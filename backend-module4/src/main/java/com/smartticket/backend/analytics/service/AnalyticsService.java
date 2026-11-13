package com.smartticket.backend.analytics.service;

import com.smartticket.backend.analytics.dto.AnalyticsSummary;
import com.smartticket.backend.entity.Booking;
import com.smartticket.backend.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AnalyticsService {

    private final BookingRepository bookingRepository;

    public AnalyticsService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public AnalyticsSummary getSummary() {
        List<Booking> bookings = bookingRepository.findAll();

        long totalBookings = bookings.size();

        long confirmedBookings = bookings.stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                .count();

        long cancelledBookings = bookings.stream()
                .filter(b -> "CANCELLED".equalsIgnoreCase(b.getStatus()))
                .count();

        long failedBookings = bookings.stream()
                .filter(b -> "FAILED".equalsIgnoreCase(b.getStatus()))
                .count();

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                .map(Booking::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AnalyticsSummary(
                totalBookings,
                confirmedBookings,
                cancelledBookings,
                failedBookings,
                totalRevenue.doubleValue()
        );
    }
}
