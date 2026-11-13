package com.smartticket.backend.service;

import com.smartticket.backend.dto.BookingResponse;
import com.smartticket.backend.dto.CreateBookingRequest;
import com.smartticket.backend.dto.RefundRequest;
import com.smartticket.backend.entity.Booking;
import com.smartticket.backend.entity.BookingSeat;
import com.smartticket.backend.entity.Seat;
import com.smartticket.backend.movie.entity.Movie;
import com.smartticket.backend.movie.entity.Show;
import com.smartticket.backend.movie.repository.MovieRepository;
import com.smartticket.backend.movie.repository.ShowRepository;
import com.smartticket.backend.repository.BookingRepository;
import com.smartticket.backend.repository.BookingSeatRepository;
import com.smartticket.backend.repository.SeatRepository;
import com.smartticket.backend.repository.ShowSeatReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final MovieRepository movieRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;
    private final BookingSeatRepository bookingSeatRepository;
    private final SeatRepository seatRepository;
    private final ShowSeatReservationRepository reservationRepository;
    private final SeatLockService seatLockService;

    // Module 2 integration
    private final ShowRepository showRepository;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Booking request is required");
        }

        if (request.getUserId() == null || request.getUserId() <= 0) {
            throw new IllegalArgumentException(
                    "Valid user ID is required");
        }

        if (request.getShowId() == null || request.getShowId() <= 0) {
            throw new IllegalArgumentException(
                    "Valid show ID is required");
        }

        List<Long> seatIds = request.getSeatIds();
        List<String> lockTokens = request.getLockTokens();

        // Validate seat list
        if (seatIds == null || seatIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one seat must be selected");
        }

        // Validate lock token list
        if (lockTokens == null || lockTokens.size() != seatIds.size()) {
            throw new IllegalArgumentException(
                    "Each selected seat must have a valid lock token");
        }

        // Validate seat IDs
        for (Long seatId : seatIds) {
            if (seatId == null) {
                throw new IllegalArgumentException(
                        "Seat ID cannot be null");
            }
        }

        // Validate lock tokens
        for (String lockToken : lockTokens) {
            if (lockToken == null || lockToken.isBlank()) {
                throw new IllegalArgumentException(
                        "Lock token cannot be empty");
            }
        }

        Long showId = request.getShowId();

        // Verify that the show exists in Module 2.
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Show does not exist"));

        /*
         * ---------------------------------------------------------
         * 1. Validate every Redis lock
         * ---------------------------------------------------------
         */
        for (int i = 0; i < seatIds.size(); i++) {

            Long seatId = seatIds.get(i);
            String lockToken = lockTokens.get(i);

            boolean lockValid =
                    seatLockService.isSeatLockedByToken(
                            showId,
                            seatId,
                            lockToken
                    );

            if (!lockValid) {
                throw new IllegalArgumentException(
                        "Seat lock is missing, expired, or invalid for seat "
                                + seatId);
            }
        }

        /*
         * ---------------------------------------------------------
         * 2. Validate every seat and calculate total amount
         * ---------------------------------------------------------
         */
        BigDecimal totalAmount = BigDecimal.ZERO;

        List<Seat> selectedSeats = new ArrayList<>();

        for (Long seatId : seatIds) {

            // Verify seat exists
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Seat does not exist: " + seatId));

            // Verify seat belongs to show's screen
            if (!seat.getScreenId().equals(show.getScreenId())) {
                throw new IllegalArgumentException(
                        "Selected seat does not belong to this show's screen: "
                                + seatId);
            }

            // Verify reservation exists for this show
            boolean reservationExists =
                    reservationRepository
                            .findByShowIdAndSeatId(showId, seatId)
                            .isPresent();

            if (!reservationExists) {
                throw new IllegalArgumentException(
                        "Seat is not configured for this show: "
                                + seatId);
            }

            // Add seat price to total
            totalAmount = totalAmount.add(seat.getPrice());

            selectedSeats.add(seat);
        }

        /*
         * ---------------------------------------------------------
         * 3. Create pending booking
         * ---------------------------------------------------------
         */
        Booking booking = Booking.builder()
                .userId(request.getUserId())
                .showId(showId)
                .totalAmount(totalAmount)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        /*
         * ---------------------------------------------------------
         * 4. Reserve every selected seat
         * ---------------------------------------------------------
         */
        for (Long seatId : seatIds) {

            int updatedRows = reservationRepository.reserveSeat(
                    showId,
                    seatId,
                    savedBooking.getId()
            );

            if (updatedRows != 1) {
                throw new IllegalArgumentException(
                        "Seat is already reserved for this show: "
                                + seatId);
            }
        }

        /*
         * ---------------------------------------------------------
         * 5. Save every booking-seat relationship
         * ---------------------------------------------------------
         */
        for (Seat seat : selectedSeats) {

            BookingSeat bookingSeat = BookingSeat.builder()
                    .bookingId(savedBooking.getId())
                    .seatId(seat.getId())
                    .price(seat.getPrice())
                    .build();

            bookingSeatRepository.save(bookingSeat);
        }

        /*
         * ---------------------------------------------------------
         * 6. Release ALL Redis locks after successful DB commit
         * ---------------------------------------------------------
         */
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCommit() {

                        for (int i = 0; i < seatIds.size(); i++) {

                            Long seatId = seatIds.get(i);
                            String lockToken = lockTokens.get(i);

                            seatLockService.unlockSeat(
                                    showId,
                                    seatId,
                                    lockToken
                            );
                        }
                    }
                }
        );

        return toResponse(savedBooking, seatIds);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {

        if (bookingId == null || bookingId <= 0) {
            throw new IllegalArgumentException(
                    "Valid booking ID is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Booking not found"));

        return toResponse(
                booking,
                getSeatIds(booking.getId())
        );
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUserId(Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(
                    "Valid user ID is required");
        }

        return bookingRepository.findByUserId(userId)
                .stream()
                .map(booking -> toResponse(
                        booking,
                        getSeatIds(booking.getId())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {

        return bookingRepository.findAll()
                .stream()
                .map(booking -> toResponse(
                        booking,
                        getSeatIds(booking.getId())
                ))
                .toList();
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId) {

        if (bookingId == null || bookingId <= 0) {
            throw new IllegalArgumentException(
                    "Valid booking ID is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Booking not found"));

        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new IllegalArgumentException(
                    "Only confirmed bookings can be cancelled");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        RefundRequest refundRequest = new RefundRequest();
        refundRequest.setBookingId(bookingId);

        paymentService.processRefund(refundRequest);

        return toResponse(
                booking,
                getSeatIds(bookingId)
        );
    }

    private List<Long> getSeatIds(Long bookingId) {

        return bookingSeatRepository
                .findByBookingId(bookingId)
                .stream()
                .map(BookingSeat::getSeatId)
                .toList();
    }

    private BookingResponse toResponse(
            Booking booking,
            List<Long> seatIds) {

        Show show = showRepository
                .findById(booking.getShowId())
                .orElse(null);

        Movie movie = show != null
                ? movieRepository
                .findById(show.getMovieId())
                .orElse(null)
                : null;

        List<String> seatNumbers = seatIds
                .stream()
                .map(seatId ->
                        seatRepository
                                .findById(seatId)
                                .map(Seat::getSeatNumber)
                                .orElse("Unknown")
                )
                .toList();

        return new BookingResponse(
                booking.getId(),
                booking.getUserId(),
                booking.getShowId(),
                seatIds,
                seatNumbers,
                booking.getTotalAmount(),
                booking.getStatus(),
                booking.getCreatedAt(),
                movie != null
                        ? movie.getTitle()
                        : "Movie unavailable",
                movie != null
                        ? movie.getPosterUrl()
                        : null,
                show != null
                        ? show.getShowDate()
                        : null,
                show != null
                        ? show.getShowTime()
                        : null,
                booking.getCancelledAt(),
                booking.getCancellationPenalty(),
                booking.getRefundAmount()
        );
    }
}
