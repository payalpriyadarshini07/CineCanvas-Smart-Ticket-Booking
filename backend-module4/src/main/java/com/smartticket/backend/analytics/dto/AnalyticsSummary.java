package com.smartticket.backend.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummary {

    private long totalBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long failedBookings;
    private double totalRevenue;
}
