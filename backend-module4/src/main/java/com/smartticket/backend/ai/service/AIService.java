package com.smartticket.backend.ai.service;

import com.smartticket.backend.ai.dto.DemandPredictionRequest;
import com.smartticket.backend.ai.dto.PythonDemandPredictionRequest;
import com.smartticket.backend.ai.dto.PythonRecommendationRequest;
import com.smartticket.backend.ai.dto.RecommendationRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.smartticket.backend.ai.dto.FraudDetectionRequest;
import com.smartticket.backend.ai.dto.PythonFraudDetectionRequest;
import com.smartticket.backend.ai.dto.PreBookingRiskRequest;

@Service
public class AIService {

    private final RestTemplate restTemplate;

    private static final String AI_BASE_URL =
            "http://127.0.0.1:8000";

    public AIService() {
        this.restTemplate = new RestTemplate();
    }

    public String healthCheck() {
        return restTemplate.getForObject(
                AI_BASE_URL + "/health",
                String.class
        );
    }

    public String getRecommendations(
            RecommendationRequest request) {

        PythonRecommendationRequest pythonRequest =
                new PythonRecommendationRequest(
                        request.getUserId(),
                        request.getFavoriteGenres(),
                        request.getLimit()
                );

        return restTemplate.postForObject(
                AI_BASE_URL + "/api/ai/recommendations",
                pythonRequest,
                String.class
        );
    }

    public String predictDemand(
            DemandPredictionRequest request) {

        PythonDemandPredictionRequest pythonRequest =
                new PythonDemandPredictionRequest(
                        request.getShowId(),
                        request.getCurrentBookings(),
                        request.getTotalSeats(),
                        request.getHoursUntilShow()
                );

        return restTemplate.postForObject(
                AI_BASE_URL + "/api/ai/demand-prediction",
                pythonRequest,
                String.class
        );
    }
    public String detectFraud(
            FraudDetectionRequest request) {

        PythonFraudDetectionRequest pythonRequest =
                new PythonFraudDetectionRequest(
                        request.getBookingId(),
                        request.getUserId(),
                        request.getBookingAmount(),
                        request.getBookingFrequency(),
                        request.getFailedPaymentAttempts(),
                        request.getBookingsInLastMinute()
                );

        return restTemplate.postForObject(
                AI_BASE_URL + "/api/ai/fraud-detection",
                pythonRequest,
                String.class
        );
    }
    public String checkPreBookingRisk(
            PreBookingRiskRequest request) {

        return restTemplate.postForObject(
                AI_BASE_URL + "/api/ai/pre-booking-risk",
                request,
                String.class
        );
    }
}