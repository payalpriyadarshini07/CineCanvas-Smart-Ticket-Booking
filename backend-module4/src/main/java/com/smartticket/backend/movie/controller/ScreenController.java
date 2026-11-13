package com.smartticket.backend.movie.controller;

import com.smartticket.backend.movie.entity.Screen;
import com.smartticket.backend.movie.service.ScreenService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
public class ScreenController {

    private final ScreenService screenService;

    public ScreenController(ScreenService screenService) {
        this.screenService = screenService;
    }

    @PostMapping
    public ResponseEntity<Screen> createScreen(
            @Valid @RequestBody Screen screen) {

        Screen savedScreen = screenService.createScreen(screen);
        return ResponseEntity.ok(savedScreen);
    }

    @GetMapping
    public ResponseEntity<List<Screen>> getAllScreens() {
        return ResponseEntity.ok(screenService.getAllScreens());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Screen> getScreenById(
            @PathVariable Long id) {

        return screenService.getScreenById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Screen> updateScreen(
            @PathVariable Long id,
            @Valid @RequestBody Screen screen) {

        Screen updatedScreen = screenService.updateScreen(id, screen);
        return ResponseEntity.ok(updatedScreen);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScreen(
            @PathVariable Long id) {

        screenService.deleteScreen(id);
        return ResponseEntity.noContent().build();
    }
}