package com.smartticket.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PreBookingRiskRequest {

    @JsonProperty("showId")
    private Long showId;

    @JsonProperty("totalSeats")
    private Integer totalSeats;

    @JsonProperty("currentBookings")
    private Integer currentBookings;

    @JsonProperty("hoursUntilShow")
    private Double hoursUntilShow;

    @JsonProperty("bookingAmount")
    private Double bookingAmount;

    @JsonProperty("seatsRequested")
    private Integer seatsRequested;
}