package com.smartticket.backend.movie.controller;

import com.smartticket.backend.movie.dto.MovieRequestDTO;
import com.smartticket.backend.movie.dto.MovieResponseDTO;
import com.smartticket.backend.movie.entity.Movie;
import com.smartticket.backend.movie.service.MovieService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @PostMapping
    public ResponseEntity<MovieResponseDTO> createMovie(
            @Valid @RequestBody MovieRequestDTO movieRequestDTO) {

        Movie movie = movieService.convertToEntity(movieRequestDTO);
        Movie savedMovie = movieService.createMovie(movie);

        return ResponseEntity.ok(
                movieService.convertToResponseDTO(savedMovie)
        );
    }

    @GetMapping
    public ResponseEntity<List<MovieResponseDTO>> getAllMovies() {

        List<MovieResponseDTO> movies = movieService.getAllMovies()
                .stream()
                .map(movieService::convertToResponseDTO)
                .toList();

        return ResponseEntity.ok(movies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieResponseDTO> getMovieById(
            @PathVariable Long id) {

        return movieService.getMovieById(id)
                .map(movieService::convertToResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovieResponseDTO> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody MovieRequestDTO movieRequestDTO) {

        Movie movie = movieService.convertToEntity(movieRequestDTO);
        Movie updatedMovie = movieService.updateMovie(id, movie);

        return ResponseEntity.ok(
                movieService.convertToResponseDTO(updatedMovie)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {

        movieService.deleteMovie(id);

        return ResponseEntity.noContent().build();
    }
}