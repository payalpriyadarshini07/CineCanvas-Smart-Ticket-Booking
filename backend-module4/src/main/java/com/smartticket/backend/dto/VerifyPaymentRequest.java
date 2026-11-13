package com.smartticket.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class VerifyPaymentRequest {

    private Long bookingId;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

}
