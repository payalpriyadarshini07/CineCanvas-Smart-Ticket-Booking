package com.smartticket.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefundRequest {
    private Long bookingId;
}