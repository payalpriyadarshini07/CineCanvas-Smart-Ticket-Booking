package com.smartticket.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateBookingRequest {

    private Long userId;

    private Long showId;

    private List<Long> seatIds;

    private List<String> lockTokens;
}
