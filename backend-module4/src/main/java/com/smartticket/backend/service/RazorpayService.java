package com.smartticket.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import org.springframework.http.client.JdkClientHttpRequestFactory;

import java.net.http.HttpClient;
import java.time.Duration;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id:}")
    private String keyId;

    @Value("${razorpay.key.secret:}")
    private String keySecret;
    private final RestClient restClient = RestClient.builder()
            .requestFactory(new JdkClientHttpRequestFactory(
                    HttpClient.newBuilder()
                            .version(HttpClient.Version.HTTP_1_1)
                            .connectTimeout(Duration.ofSeconds(30))
                            .build()
            ))
            .baseUrl("https://api.razorpay.com/v1")
            .build();

    public Map<?, ?> createOrder(BigDecimal amount, String receipt) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid payment amount");
        }

        if (receipt == null || receipt.isBlank()) {
            throw new IllegalArgumentException("Receipt is required");
        }

        long amountInPaise = amount
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();

        Map<?, ?> response = restClient.post()
                .uri("/orders")
                .headers(headers -> headers.setBasicAuth(keyId, keySecret))
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "amount", amountInPaise,
                        "currency", "INR",
                        "receipt", receipt
                ))
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("id") == null) {
            throw new IllegalStateException("Razorpay order creation failed");
        }

        return response;
    }

    public boolean verifyPaymentSignature(
            String orderId,
            String paymentId,
            String receivedSignature
    ) {
        if (isBlank(orderId) || isBlank(paymentId)
                || isBlank(receivedSignature)) {
            return false;
        }

        try {
            String payload = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec secretKey = new SecretKeySpec(
                    keySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );

            mac.init(secretKey);

            byte[] hash = mac.doFinal(
                    payload.getBytes(StandardCharsets.UTF_8)
            );

            String generatedSignature = HexFormat.of().formatHex(hash);

            return MessageDigest.isEqual(
                    generatedSignature.getBytes(StandardCharsets.UTF_8),
                    receivedSignature.getBytes(StandardCharsets.UTF_8)
            );

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Payment signature verification failed", e
            );
        }
    }

    public Map<?, ?> getPaymentDetails(String paymentId) {

        if (isBlank(paymentId)) {
            throw new IllegalArgumentException("Payment ID is required");
        }

        Map<?, ?> response = restClient.get()
                .uri("/payments/{paymentId}", paymentId)
                .headers(headers -> headers.setBasicAuth(keyId, keySecret))
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException(
                    "Could not retrieve payment details from Razorpay"
            );
        }

        return response;
    }
    public Map<?, ?> createRefund(String paymentId, BigDecimal amount) {

        if (isBlank(paymentId)) {
            throw new IllegalArgumentException("Payment ID is required");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid refund amount");
        }

        long amountInPaise = amount
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();

        Map<?, ?> response = restClient.post()
                .uri("/payments/{paymentId}/refund", paymentId)
                .headers(headers -> headers.setBasicAuth(keyId, keySecret))
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("amount", amountInPaise))
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("id") == null) {
            throw new IllegalStateException("Razorpay refund creation failed");
        }

        return response;
    }
    public String getKeyId() {
        return keyId;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}