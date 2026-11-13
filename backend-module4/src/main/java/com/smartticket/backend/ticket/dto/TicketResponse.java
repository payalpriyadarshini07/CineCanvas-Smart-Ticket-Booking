package com.smartticket.backend.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private Long bookingId;
    private Long userId;
    private Long showId;

    private String movieTitle;
    private String moviePoster;

    private String showDate;
    private String showTime;

    private List<String> seatNumbers;

    private BigDecimal totalAmount;
    private String status;

    private LocalDateTime bookingTime;

    private String qrCode;
}