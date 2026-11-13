package com.smartticket.backend.ticket.controller;

import com.smartticket.backend.ticket.dto.TicketResponse;
import com.smartticket.backend.ticket.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://localhost:4201",
        "http://localhost:4202"
})
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<TicketResponse> getTicket(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                ticketService.getTicket(bookingId)
        );
    }
}