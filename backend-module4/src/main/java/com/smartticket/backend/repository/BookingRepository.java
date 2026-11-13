package com.smartticket.backend.repository;

import com.smartticket.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    List<Booking> findByStatusAndCreatedAtBefore(
            String status,
            LocalDateTime createdAt);

    // Get all bookings belonging to a customer
    List<Booking> findByUserId(Long userId);
}