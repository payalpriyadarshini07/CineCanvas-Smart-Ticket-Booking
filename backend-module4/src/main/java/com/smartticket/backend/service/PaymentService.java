package com.smartticket.backend.service;
import java.time.Duration;
import java.math.RoundingMode;
import com.smartticket.backend.movie.entity.Show;
import com.smartticket.backend.movie.repository.ShowRepository;

import com.smartticket.backend.dto.CreatePaymentRequest;
import com.smartticket.backend.dto.PaymentResponse;
import com.smartticket.backend.dto.RefundRequest;
import com.smartticket.backend.dto.VerifyPaymentRequest;

import com.smartticket.backend.entity.Booking;
import com.smartticket.backend.entity.BookingSeat;
import com.smartticket.backend.entity.Payment;

import com.smartticket.backend.repository.BookingRepository;
import com.smartticket.backend.repository.BookingSeatRepository;
import com.smartticket.backend.repository.PaymentRepository;
import com.smartticket.backend.repository.ShowSeatReservationRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final ShowRepository showRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowSeatReservationRepository reservationRepository;
    private final RazorpayService razorpayService;

    // CREATE RAZORPAY ORDER
    @Transactional
    public Map<String, Object> processPayment(CreatePaymentRequest request) {

        if (request == null || request.getBookingId() == null) {
            throw new IllegalArgumentException("Valid booking ID is required");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found"));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalArgumentException(
                    "Only pending bookings can be paid");
        }

        if (request.getPaymentMethod() == null
                || request.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException("Payment method is required");
        }

        if (paymentRepository.existsByBookingIdAndStatus(
                booking.getId(), "SUCCESS")) {
            throw new IllegalArgumentException("Payment already completed");
        }

        List<BookingSeat> seats =
                bookingSeatRepository.findByBookingId(booking.getId());

        if (seats.isEmpty()) {
            throw new IllegalArgumentException(
                    "No seats found for this booking");
        }

        Map<?, ?> order = razorpayService.createOrder(
                booking.getTotalAmount(),
                "BOOKING-" + booking.getId()
        );

        String orderId = order.get("id").toString();

        Payment payment = Payment.builder()
                .bookingId(booking.getId())
                .amount(booking.getTotalAmount())
                .status("PENDING")
                .paymentMethod(request.getPaymentMethod())
                .razorpayOrderId(orderId)
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        return Map.of(
                "keyId", razorpayService.getKeyId(),
                "orderId", orderId,
                "amount", order.get("amount"),
                "currency", "INR",
                "bookingId", booking.getId()
        );
    }
    // DEMO PAYMENT
    @Transactional
    public PaymentResponse processDemoPayment(CreatePaymentRequest request) {

        if (request == null || request.getBookingId() == null) {
            throw new IllegalArgumentException("Valid booking ID is required");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Only pending bookings can be paid");
        }

        if (request.getPaymentMethod() == null
                || request.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException("Payment method is required");
        }

        List<BookingSeat> seats =
                bookingSeatRepository.findByBookingId(booking.getId());

        if (seats.isEmpty()) {
            throw new IllegalArgumentException("No seats found for this booking");
        }

        Payment payment = Payment.builder()
                .bookingId(booking.getId())
                .amount(booking.getTotalAmount())
                .status("SUCCESS")
                .paymentMethod("DEMO_" + request.getPaymentMethod())
                .transactionId("DEMO-" + System.currentTimeMillis())
                .createdAt(LocalDateTime.now())
                .build();

        for (BookingSeat seat : seats) {
            int updatedRows = reservationRepository.markSeatBooked(
                    booking.getShowId(),
                    seat.getSeatId(),
                    booking.getId()
            );

            if (updatedRows != 1) {
                throw new IllegalStateException(
                        "Could not confirm seat " + seat.getSeatId());
            }
        }

        booking.setStatus("CONFIRMED");

        paymentRepository.save(payment);
        bookingRepository.save(booking);

        return toResponse(payment);
    }
    // VERIFY RAZORPAY PAYMENT
    @Transactional
    public PaymentResponse verifyPayment(VerifyPaymentRequest request) {

        if (request == null
                || request.getBookingId() == null
                || isBlank(request.getRazorpayOrderId())
                || isBlank(request.getRazorpayPaymentId())
                || isBlank(request.getRazorpaySignature())) {

            throw new IllegalArgumentException(
                    "Payment verification details are required");
        }

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Payment order not found"));

        if (!Objects.equals(payment.getBookingId(), request.getBookingId())) {
            throw new IllegalArgumentException(
                    "Payment does not belong to this booking");
        }

        // IDEMPOTENCY CHECK
        if ("SUCCESS".equals(payment.getStatus())) {

            if (!Objects.equals(
                    payment.getRazorpayPaymentId(),
                    request.getRazorpayPaymentId())) {

                throw new IllegalArgumentException(
                        "Payment was already completed with a different payment ID");
            }

            return toResponse(payment);
        }

        // VERIFY SIGNATURE
        boolean signatureValid =
                razorpayService.verifyPaymentSignature(
                        request.getRazorpayOrderId(),
                        request.getRazorpayPaymentId(),
                        request.getRazorpaySignature()
                );

        if (!signatureValid) {
            throw new IllegalArgumentException(
                    "Invalid Razorpay payment signature");
        }

        // FETCH PAYMENT DETAILS FROM RAZORPAY
        Map<?, ?> gatewayPayment =
                razorpayService.getPaymentDetails(
                        request.getRazorpayPaymentId()
                );

        // VERIFY PAYMENT STATUS
        if (!"captured".equalsIgnoreCase(
                String.valueOf(gatewayPayment.get("status")))) {

            throw new IllegalStateException("Payment is not captured");
        }

        // VERIFY ORDER ID
        if (!request.getRazorpayOrderId().equals(
                String.valueOf(gatewayPayment.get("order_id")))) {

            throw new IllegalStateException("Payment order ID mismatch");
        }

        // VERIFY AMOUNT
        long expectedAmountInPaise = payment.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();

        if (!(gatewayPayment.get("amount") instanceof Number gatewayAmount)
                || gatewayAmount.longValue() != expectedAmountInPaise) {

            throw new IllegalStateException("Payment amount mismatch");
        }

        // VERIFY CURRENCY
        if (!"INR".equalsIgnoreCase(
                String.valueOf(gatewayPayment.get("currency")))) {

            throw new IllegalStateException("Payment currency mismatch");
        }

        // VERIFY BOOKING
        Booking booking = bookingRepository
                .findById(request.getBookingId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found"));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalArgumentException(
                    "Booking is no longer pending");
        }

        List<BookingSeat> seats =
                bookingSeatRepository.findByBookingId(booking.getId());

        if (seats.isEmpty()) {
            throw new IllegalArgumentException(
                    "No seats found for this booking");
        }

        // CONFIRM RESERVED SEATS
        for (BookingSeat seat : seats) {

            int updatedRows = reservationRepository.markSeatBooked(
                    booking.getShowId(),
                    seat.getSeatId(),
                    booking.getId()
            );

            if (updatedRows != 1) {
                throw new IllegalStateException(
                        "Could not confirm seat " + seat.getSeatId());
            }
        }

        // UPDATE PAYMENT
        payment.setStatus("SUCCESS");
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setTransactionId(request.getRazorpayPaymentId());

        // CONFIRM BOOKING
        booking.setStatus("CONFIRMED");

        paymentRepository.save(payment);
        bookingRepository.save(booking);

        return toResponse(payment);
    }

    // REFUND
    @Transactional
    public PaymentResponse processRefund(RefundRequest request) {

        if (request == null || request.getBookingId() == null) {
            throw new IllegalArgumentException("Valid booking ID is required");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!"CANCELLED".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Booking must be cancelled first");
        }

        List<Payment> payments =
                paymentRepository.findByBookingId(booking.getId());

        Payment payment = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No successful payment exists"));

        if (!"NOT_REQUESTED".equals(payment.getRefundStatus())) {
            throw new IllegalArgumentException("Refund already requested or processed");
        }

        Show show = showRepository.findById(booking.getShowId())
                .orElseThrow(() -> new IllegalArgumentException("Show not found"));

        LocalDateTime showStart = LocalDateTime.parse(
                show.getShowDate() + "T" + show.getShowTime());

        BigDecimal penalty = calculateCancellationPenalty(
                showStart, payment.getAmount());

        BigDecimal refundAmount = payment.getAmount().subtract(penalty);

        // DEMO PAYMENT
        boolean demoPayment = payment.getPaymentMethod() != null
                && payment.getPaymentMethod().startsWith("DEMO_");

        if (demoPayment) {
            payment.setRefundStatus("PROCESSED");
            payment.setStatus("REFUNDED");
            payment.setRefundedAt(LocalDateTime.now());
        } else {
            if (isBlank(payment.getRazorpayPaymentId())) {
                throw new IllegalStateException("Razorpay payment ID is missing");
            }

            Map<?, ?> refund = razorpayService.createRefund(
                    payment.getRazorpayPaymentId(), refundAmount);

            payment.setRazorpayRefundId(refund.get("id").toString());
            payment.setRefundStatus("PENDING");
            payment.setStatus("PARTIALLY_REFUNDED");
        }

        payment.setCancellationPenalty(penalty);
        payment.setRefundAmount(refundAmount);

        booking.setCancellationPenalty(penalty);
        booking.setRefundAmount(refundAmount);
        booking.setCancelledAt(LocalDateTime.now());

        // Release booked seats
        List<BookingSeat> seats =
                bookingSeatRepository.findByBookingId(booking.getId());

        for (BookingSeat seat : seats) {
            int updatedRows = reservationRepository.releaseBookedReservation(
                    booking.getShowId(),
                    seat.getSeatId(),
                    booking.getId());

            if (updatedRows != 1) {
                throw new IllegalStateException(
                        "Could not release seat " + seat.getSeatId());
            }
        }

        paymentRepository.save(payment);
        bookingRepository.save(booking);

        return toResponse(payment);
    }

    private BigDecimal calculateCancellationPenalty(
            LocalDateTime showStart,
            BigDecimal amount) {

        LocalDateTime now = LocalDateTime.now();

        if (!now.isBefore(showStart)) {
            throw new IllegalArgumentException(
                    "Cancellation is not allowed after the show starts");
        }

        Duration remaining = Duration.between(now, showStart);

        BigDecimal penaltyRate;

        if (remaining.compareTo(Duration.ofHours(24)) > 0) {
            penaltyRate = new BigDecimal("0.10");
        } else if (remaining.compareTo(Duration.ofHours(12)) > 0) {
            penaltyRate = new BigDecimal("0.20");
        } else if (remaining.compareTo(Duration.ofHours(4)) > 0) {
            penaltyRate = new BigDecimal("0.30");
        } else if (remaining.compareTo(Duration.ofHours(1)) > 0) {
            penaltyRate = new BigDecimal("0.50");
        } else {
            penaltyRate = new BigDecimal("0.75");
        }

        return amount.multiply(penaltyRate)
                .setScale(2, RoundingMode.HALF_UP);
    }
    // HELPER METHODS
    private PaymentResponse toResponse(Payment payment) {

        return new PaymentResponse(
                payment.getId(),
                payment.getBookingId(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getPaymentMethod(),
                payment.getTransactionId(),
                payment.getCreatedAt()
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}