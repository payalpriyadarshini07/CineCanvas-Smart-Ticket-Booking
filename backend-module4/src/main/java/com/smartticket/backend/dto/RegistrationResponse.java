package com.smartticket.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegistrationResponse {

    private Long id;
    private String name;
    private String email;
    private String message;
}