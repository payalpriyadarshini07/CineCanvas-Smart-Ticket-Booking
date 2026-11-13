package com.smartticket.backend.movie.controller;

import com.smartticket.backend.movie.entity.Theater;
import com.smartticket.backend.movie.service.TheaterService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
public class TheaterController {

    private final TheaterService theaterService;

    public TheaterController(TheaterService theaterService) {
        this.theaterService = theaterService;
    }

    @PostMapping
    public ResponseEntity<Theater> createTheater(
            @Valid @RequestBody Theater theater) {

        Theater savedTheater = theaterService.createTheater(theater);
        return ResponseEntity.ok(savedTheater);
    }

    @GetMapping
    public ResponseEntity<List<Theater>> getAllTheaters() {
        return ResponseEntity.ok(theaterService.getAllTheaters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Theater> getTheaterById(
            @PathVariable Long id) {

        return theaterService.getTheaterById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Theater> updateTheater(
            @PathVariable Long id,
            @Valid @RequestBody Theater theater) {

        Theater updatedTheater = theaterService.updateTheater(id, theater);
        return ResponseEntity.ok(updatedTheater);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTheater(
            @PathVariable Long id) {

        theaterService.deleteTheater(id);
        return ResponseEntity.noContent().build();
    }
}