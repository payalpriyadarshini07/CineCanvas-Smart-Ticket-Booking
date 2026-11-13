package com.smartticket.backend.repository;

import com.smartticket.backend.entity.ShowSeatReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ShowSeatReservationRepository
        extends JpaRepository<ShowSeatReservation, Long> {

    Optional<ShowSeatReservation> findByShowIdAndSeatId(
            Long showId, Long seatId);

    List<ShowSeatReservation> findByShowId(Long showId);

    // Reserve an available seat when a pending booking is created.
    @Modifying
    @Query("""
        UPDATE ShowSeatReservation r
        SET r.status = 'LOCKED',
            r.bookingId = :bookingId
        WHERE r.showId = :showId
          AND r.seatId = :seatId
          AND r.status = 'AVAILABLE'
        """)
    int reserveSeat(
            @Param("showId") Long showId,
            @Param("seatId") Long seatId,
            @Param("bookingId") Long bookingId);

    // Mark the reservation as booked after successful payment.
    @Modifying
    @Query("""
        UPDATE ShowSeatReservation r
        SET r.status = 'BOOKED'
        WHERE r.showId = :showId
          AND r.seatId = :seatId
          AND r.bookingId = :bookingId
          AND r.status = 'LOCKED'
        """)
    int markSeatBooked(
            @Param("showId") Long showId,
            @Param("seatId") Long seatId,
            @Param("bookingId") Long bookingId);

    // Release a reservation only if it belongs to this booking.
    @Modifying
    @Query("""
        UPDATE ShowSeatReservation r
        SET r.status = 'AVAILABLE',
            r.bookingId = NULL
        WHERE r.showId = :showId
          AND r.seatId = :seatId
          AND r.bookingId = :bookingId
          AND r.status = 'LOCKED'
        """)
    int releasePendingReservation(
            @Param("showId") Long showId,
            @Param("seatId") Long seatId,
            @Param("bookingId") Long bookingId);


    @Modifying
    @Query("""
    UPDATE ShowSeatReservation r
    SET r.status = 'AVAILABLE',
        r.bookingId = NULL
    WHERE r.showId = :showId
      AND r.seatId = :seatId
      AND r.bookingId = :bookingId
      AND r.status = 'BOOKED'
    """)
    int releaseBookedReservation(
            @Param("showId") Long showId,
            @Param("seatId") Long seatId,
            @Param("bookingId") Long bookingId);
}