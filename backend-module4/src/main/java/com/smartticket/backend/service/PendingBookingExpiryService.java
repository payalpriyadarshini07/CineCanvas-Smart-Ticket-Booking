package com.smartticket.backend.service;

import com.smartticket.backend.entity.Booking;
import com.smartticket.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PendingBookingExpiryService {

    private static final int PAYMENT_WINDOW_MINUTES = 7;

    private final BookingRepository bookingRepository;
    private final PendingBookingExpiryWorker expiryWorker;

    @Scheduled(fixedDelay = 30000)
    public void expireStalePendingBookings() {

        LocalDateTime expiryTime =
                LocalDateTime.now().minusMinutes(PAYMENT_WINDOW_MINUTES);

        List<Booking> pendingBookings =
                bookingRepository.findByStatusAndCreatedAtBefore(
                        "PENDING", expiryTime);

        for (Booking booking : pendingBookings) {
            try {
                expiryWorker.expireOneBooking(
                        booking.getId(), expiryTime);
            } catch (Exception exception) {
                System.err.println(
                        "Could not expire booking " + booking.getId()
                                + ": " + exception.getMessage());
            }
        }
    }
}