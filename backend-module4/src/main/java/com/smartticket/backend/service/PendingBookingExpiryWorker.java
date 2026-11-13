package com.smartticket.backend.service;

import com.smartticket.backend.entity.Booking;
import com.smartticket.backend.repository.BookingRepository;
import com.smartticket.backend.repository.BookingSeatRepository;
import com.smartticket.backend.repository.PaymentRepository;
import com.smartticket.backend.repository.ShowSeatReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PendingBookingExpiryWorker {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowSeatReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public void expireOneBooking(
            Long bookingId,
            LocalDateTime expiryTime) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElse(null);

        if (booking == null
                || !"PENDING".equals(booking.getStatus())
                || booking.getCreatedAt() == null
                || !booking.getCreatedAt().isBefore(expiryTime)) {
            return;
        }

        // Never expire a booking that has a successful payment.
        if (paymentRepository.existsByBookingIdAndStatus(
                bookingId, "SUCCESS")) {
            return;
        }

        List<Long> seatIds = bookingSeatRepository
                .findByBookingId(bookingId)
                .stream()
                .map(seat -> seat.getSeatId())
                .toList();

        for (Long seatId : seatIds) {
            reservationRepository.releasePendingReservation(
                    booking.getShowId(),
                    seatId,
                    booking.getId());
        }

        booking.setStatus("EXPIRED");
        bookingRepository.save(booking);
    }
}