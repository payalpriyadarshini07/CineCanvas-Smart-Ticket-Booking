package com.smartticket.backend.ticket.service;

import com.smartticket.backend.dto.BookingResponse;
import com.smartticket.backend.service.BookingService;
import com.smartticket.backend.ticket.dto.TicketResponse;
import org.springframework.stereotype.Service;

@Service
public class TicketService {

    private final BookingService bookingService;

    public TicketService(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    public TicketResponse getTicket(Long bookingId) {

        BookingResponse booking =
                bookingService.getBookingById(bookingId);

        String qrData =
                "SMARTTIX|BOOKING:" + booking.getBookingId()
                        + "|USER:" + booking.getUserId()
                        + "|SHOW:" + booking.getShowId();

        return new TicketResponse(
                booking.getBookingId(),
                booking.getUserId(),
                booking.getShowId(),
                booking.getMovieTitle(),
                booking.getMoviePoster(),
                booking.getShowDate(),
                booking.getShowTime(),
                booking.getSeatNumbers(),
                booking.getTotalAmount(),
                booking.getStatus(),
                booking.getCreatedAt(),
                qrData
        );
    }
}