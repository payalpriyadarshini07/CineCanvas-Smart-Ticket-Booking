package com.smartticket.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SeatLockResponse {

    private boolean success;

    private String message;

    private String lockToken;
}