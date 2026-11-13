package com.smartticket.backend.movie.controller;

import com.smartticket.backend.movie.entity.Show;
import com.smartticket.backend.movie.service.ShowService;
import com.smartticket.backend.movie.exception.ResourceNotFoundException;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    public ShowController(ShowService showService) {
        this.showService = showService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Show createShow(@Valid @RequestBody Show show) {
        return showService.createShow(show);
    }

    @GetMapping
    public List<Show> getAllShows(
            @RequestParam(required = false) Long movieId) {

        if (movieId != null) {
            return showService.getShowsByMovieId(movieId);
        }

        return showService.getAllShows();
    }

    @GetMapping("/{id}")
    public Show getShowById(@PathVariable Long id) {
        return showService.getShowById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Show not found with id: " + id));
    }

    @PutMapping("/{id}")
    public Show updateShow(
            @PathVariable Long id,
            @Valid @RequestBody Show show) {
        return showService.updateShow(id, show);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteShow(@PathVariable Long id) {
        showService.deleteShow(id);
    }
}