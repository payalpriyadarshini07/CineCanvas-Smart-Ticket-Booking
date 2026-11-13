package com.smartticket.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonDemandPredictionRequest {

    @JsonProperty("show_id")
    private Long showId;

    @JsonProperty("current_bookings")
    private Integer currentBookings;

    @JsonProperty("total_seats")
    private Integer totalSeats;

    @JsonProperty("hours_until_show")
    private Double hoursUntilShow;
}