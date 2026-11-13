package com.smartticket.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandPredictionRequest {

    private Long showId;

    private Integer currentBookings;

    private Integer totalSeats;

    private Double hoursUntilShow;
}