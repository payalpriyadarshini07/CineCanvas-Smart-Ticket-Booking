package com.smartticket.backend.movie.service;

import com.smartticket.backend.movie.entity.Show;

import java.util.List;
import java.util.Optional;

public interface ShowService {

    Show createShow(Show show);

    List<Show> getAllShows();

    Optional<Show> getShowById(Long id);

    Show updateShow(Long id, Show show);

    void deleteShow(Long id);

    List<Show> getShowsByMovieId(Long movieId);
}