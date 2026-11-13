package com.smartticket.backend.controller;

import com.smartticket.backend.dto.SeatResponse;
import com.smartticket.backend.dto.ShowSeatResponse;
import com.smartticket.backend.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/{screenId}/seats")
    public List<SeatResponse> getSeats(@PathVariable Long screenId) {
        return seatService.getSeatsByScreen(screenId);
    }

    @GetMapping("/{screenId}/available-seats")
    public List<ShowSeatResponse> getAvailableSeats(
            @PathVariable Long screenId) {
        return seatService.getAvailableSeats(screenId);
    }
    @PostMapping("/{screenId}/generate")
    public int generateSeats(@PathVariable Long screenId) {
        return seatService.generateSeatsForScreen(screenId);
    }
}