package com.smartticket.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationRequest {

    private String name;
    private String email;
    private String phone;
    private String password;
}