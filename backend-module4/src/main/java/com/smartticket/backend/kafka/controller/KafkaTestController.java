package com.smartticket.backend.kafka.controller;

import com.smartticket.backend.kafka.dto.BookingEvent;
import com.smartticket.backend.kafka.service.BookingEventProducer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/kafka-test")
public class KafkaTestController {

    private final BookingEventProducer bookingEventProducer;

    public KafkaTestController(BookingEventProducer bookingEventProducer) {
        this.bookingEventProducer = bookingEventProducer;
    }

    @PostMapping("/booking-created")
    public ResponseEntity<String> publishTestBookingEvent() {

        BookingEvent event = new BookingEvent(
                UUID.randomUUID().toString(),
                "BOOKING_CREATED",
                LocalDateTime.now(),
                9999L,
                1L,
                1L,
                List.of(101L, 102L),
                1200.0,
                "CONFIRMED"
        );

        bookingEventProducer.publishBookingCreated(event);

        return ResponseEntity.ok(
                "Test booking event submitted to Kafka"
        );
    }
}