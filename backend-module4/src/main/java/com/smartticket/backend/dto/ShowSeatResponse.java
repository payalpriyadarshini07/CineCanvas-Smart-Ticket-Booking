package com.smartticket.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ShowSeatResponse {

    private Long seatId;
    private Long screenId;
    private String seatNumber;
    private String seatTier;
    private BigDecimal price;
    private String status;
}