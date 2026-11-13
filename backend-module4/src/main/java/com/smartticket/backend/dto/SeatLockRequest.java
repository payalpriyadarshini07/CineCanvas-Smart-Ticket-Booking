package com.smartticket.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SeatLockRequest {

    private Long showId;

    private Long seatId;

    private String lockToken;
}