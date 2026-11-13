
package com.smartticket.backend.controller;

import com.smartticket.backend.dto.SeatLockRequest;
import com.smartticket.backend.dto.SeatLockResponse;
import com.smartticket.backend.service.SeatLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatLockController {

    private final SeatLockService seatLockService;

    @PostMapping("/lock")
    public ResponseEntity<SeatLockResponse> lockSeat(
            @RequestBody SeatLockRequest request) {

        String lockToken = seatLockService.lockSeat(
                request.getShowId(),
                request.getSeatId()
        );

        if (lockToken == null) {
            return ResponseEntity.ok(
                    new SeatLockResponse(
                            false,
                            "Seat is already locked",
                            null
                    )
            );
        }

        return ResponseEntity.ok(
                new SeatLockResponse(
                        true,
                        "Seat locked successfully",
                        lockToken
                )
        );
    }

    @PostMapping("/unlock")
    public ResponseEntity<SeatLockResponse> unlockSeat(
            @RequestBody SeatLockRequest request) {

        if (request.getLockToken() == null
                || request.getLockToken().isBlank()) {

            return ResponseEntity.badRequest().body(
                    new SeatLockResponse(
                            false,
                            "Lock token is required",
                            null
                    )
            );
        }

        boolean unlocked = seatLockService.unlockSeat(
                request.getShowId(),
                request.getSeatId(),
                request.getLockToken()
        );

        if (!unlocked) {
            return ResponseEntity.ok(
                    new SeatLockResponse(
                            false,
                            "Invalid lock token",
                            null
                    )
            );
        }

        return ResponseEntity.ok(
                new SeatLockResponse(
                        true,
                        "Seat unlocked successfully",
                        null
                )
        );
    }
}