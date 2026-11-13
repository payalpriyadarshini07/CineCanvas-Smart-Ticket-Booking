
package com.smartticket.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreatePaymentRequest {

    private Long bookingId;

    private String paymentMethod;

    private boolean simulateSuccess;
}