package com.smartticket.backend.movie.impl;

import com.smartticket.backend.movie.dto.MovieRequestDTO;
import com.smartticket.backend.movie.dto.MovieResponseDTO;
import com.smartticket.backend.movie.entity.Movie;
import com.smartticket.backend.movie.exception.ResourceNotFoundException;
import com.smartticket.backend.movie.repository.MovieRepository;
import com.smartticket.backend.movie.service.MovieService;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;

    public MovieServiceImpl(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @Override
    public Movie createMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    @Override
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    @Override
    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }

    @Override
    public Movie updateMovie(Long id, Movie movie) {
        Movie existingMovie = movieRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Movie not found"));

        existingMovie.setTitle(movie.getTitle());
        existingMovie.setDescription(movie.getDescription());
        existingMovie.setGenre(movie.getGenre());
        existingMovie.setLanguage(movie.getLanguage());
        existingMovie.setDuration(movie.getDuration());
        existingMovie.setReleaseDate(movie.getReleaseDate());
        existingMovie.setPosterUrl(movie.getPosterUrl());

        return movieRepository.save(existingMovie);
    }

    @Override
    public void deleteMovie(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Movie not found");
        }

        movieRepository.deleteById(id);
    }

    @Override
    public Movie convertToEntity(MovieRequestDTO movieRequestDTO) {
        Movie movie = new Movie();

        movie.setTitle(movieRequestDTO.getTitle());
        movie.setDescription(movieRequestDTO.getDescription());
        movie.setGenre(movieRequestDTO.getGenre());
        movie.setLanguage(movieRequestDTO.getLanguage());
        movie.setDuration(movieRequestDTO.getDuration());
        movie.setReleaseDate(movieRequestDTO.getReleaseDate());
        movie.setPosterUrl(movieRequestDTO.getPosterUrl());

        return movie;
    }

    @Override
    public MovieResponseDTO convertToResponseDTO(Movie movie) {
        return new MovieResponseDTO(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getGenre(),
                movie.getLanguage(),
                movie.getDuration(),
                movie.getReleaseDate(),
                movie.getPosterUrl()
        );
    }
}