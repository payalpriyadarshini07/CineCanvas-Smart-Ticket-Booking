package com.smartticket.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FraudDetectionRequest {

    private Long bookingId;

    private Long userId;

    private Double bookingAmount;

    private Integer bookingFrequency;

    private Integer failedPaymentAttempts;

    private Integer bookingsInLastMinute;
}