package com.smartticket.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class BookingResponse {

    private Long bookingId;

    private Long userId;

    private Long showId;

    private List<Long> seatIds;
    private List<String> seatNumbers;

    private BigDecimal totalAmount;

    private String status;

    private LocalDateTime createdAt;

    private String movieTitle;

    private String moviePoster;

    private String showDate;

    private String showTime;

    private LocalDateTime cancelledAt;

    private BigDecimal cancellationPenalty;

    private BigDecimal refundAmount;
}