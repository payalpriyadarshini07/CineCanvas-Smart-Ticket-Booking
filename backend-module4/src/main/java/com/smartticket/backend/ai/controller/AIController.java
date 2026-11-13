package com.smartticket.backend.ai.controller;

import com.smartticket.backend.ai.dto.RecommendationRequest;
import com.smartticket.backend.ai.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartticket.backend.ai.dto.DemandPredictionRequest;
import com.smartticket.backend.ai.dto.FraudDetectionRequest;
import com.smartticket.backend.ai.dto.PreBookingRiskRequest;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://localhost:4201",
        "http://localhost:4202"
})
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok(aiService.healthCheck());
    }

    @PostMapping("/recommendations")
    public ResponseEntity<String> recommendations(
            @RequestBody RecommendationRequest request) {

        return ResponseEntity.ok(
                aiService.getRecommendations(request)
        );
    }
    @PostMapping("/demand-prediction")
    public ResponseEntity<String> demandPrediction(
            @RequestBody DemandPredictionRequest request) {

        return ResponseEntity.ok(
                aiService.predictDemand(request)
        );
    }
    @PostMapping("/fraud-detection")
    public ResponseEntity<String> fraudDetection(
            @RequestBody FraudDetectionRequest request) {

        return ResponseEntity.ok(
                aiService.detectFraud(request)
        );
    }
    @PostMapping("/pre-booking-risk")
    public ResponseEntity<String> preBookingRisk(
            @RequestBody PreBookingRiskRequest request) {

        return ResponseEntity.ok(
                aiService.checkPreBookingRisk(request)
        );
    }
}