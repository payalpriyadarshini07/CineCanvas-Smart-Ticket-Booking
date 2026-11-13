package com.smartticket.backend.movie.service;

import com.smartticket.backend.movie.dto.MovieRequestDTO;
import com.smartticket.backend.movie.dto.MovieResponseDTO;
import com.smartticket.backend.movie.entity.Movie;

import java.util.List;
import java.util.Optional;

public interface MovieService {

    Movie createMovie(Movie movie);

    List<Movie> getAllMovies();

    Optional<Movie> getMovieById(Long id);

    Movie updateMovie(Long id, Movie movie);

    void deleteMovie(Long id);

    Movie convertToEntity(MovieRequestDTO movieRequestDTO);

    MovieResponseDTO convertToResponseDTO(Movie movie);
}