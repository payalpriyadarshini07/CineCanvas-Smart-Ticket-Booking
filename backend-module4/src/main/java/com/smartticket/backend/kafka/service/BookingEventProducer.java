package com.smartticket.backend.kafka.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartticket.backend.kafka.dto.BookingEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class BookingEventProducer {

    private static final String TOPIC = "booking.created";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public BookingEventProducer(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishBookingCreated(BookingEvent event) {

        try {
            String json = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(
                    TOPIC,
                    String.valueOf(event.getBookingId()),
                    json
            );

        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Failed to serialize booking event",
                    e
            );
        }
    }
}