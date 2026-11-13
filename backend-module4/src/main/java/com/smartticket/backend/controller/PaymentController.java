package com.smartticket.backend.controller;

import com.smartticket.backend.dto.CreatePaymentRequest;
import com.smartticket.backend.dto.RefundRequest;
import com.smartticket.backend.dto.VerifyPaymentRequest;
import com.smartticket.backend.dto.PaymentResponse;
import com.smartticket.backend.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {


    private final PaymentService paymentService;

    // Create Razorpay order
    @PostMapping
    public ResponseEntity<Map<String, Object>> processPayment(
            @RequestBody CreatePaymentRequest request) {

        return ResponseEntity.ok(
                paymentService.processPayment(request)
        );
    }
    // Demo payment (no real money charged)
    @PostMapping("/demo")
    public ResponseEntity<PaymentResponse> processDemoPayment(
            @RequestBody CreatePaymentRequest request) {

        return ResponseEntity.ok(
                paymentService.processDemoPayment(request)
        );
    }
    // Verify Razorpay payment
    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @RequestBody VerifyPaymentRequest request) {

        return ResponseEntity.ok(
                paymentService.verifyPayment(request)
        );
    }

    // Process refund
    @PostMapping("/refund")
    public ResponseEntity<PaymentResponse> processRefund(
            @RequestBody RefundRequest request) {

        return ResponseEntity.ok(
                paymentService.processRefund(request)
        );
    }


}
