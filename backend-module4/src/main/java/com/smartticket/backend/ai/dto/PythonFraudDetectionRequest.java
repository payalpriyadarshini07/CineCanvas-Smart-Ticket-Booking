package com.smartticket.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonFraudDetectionRequest {

    @JsonProperty("booking_id")
    private Long bookingId;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("booking_amount")
    private Double bookingAmount;

    @JsonProperty("booking_frequency")
    private Integer bookingFrequency;

    @JsonProperty("failed_payment_attempts")
    private Integer failedPaymentAttempts;

    @JsonProperty("bookings_in_last_minute")
    private Integer bookingsInLastMinute;
}