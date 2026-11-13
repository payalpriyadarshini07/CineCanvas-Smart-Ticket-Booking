package com.smartticket.backend.kafka.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingEvent {

    private String eventId;
    private String eventType;
    private LocalDateTime timestamp;

    private Long bookingId;
    private Long userId;
    private Long showId;

    private List<Long> seatIds;

    private double amount;
    private String bookingStatus;
}