package com.smartticket.backend.movie.impl;
import com.smartticket.backend.entity.Seat;
import com.smartticket.backend.entity.ShowSeatReservation;
import com.smartticket.backend.repository.SeatRepository;
import com.smartticket.backend.repository.ShowSeatReservationRepository;
import java.time.LocalDateTime;
import com.smartticket.backend.movie.entity.Show;
import com.smartticket.backend.movie.exception.ResourceNotFoundException;
import com.smartticket.backend.movie.repository.MovieRepository;
import com.smartticket.backend.movie.repository.ScreenRepository;
import com.smartticket.backend.movie.repository.ShowRepository;
import com.smartticket.backend.movie.service.ShowService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
public class ShowServiceImpl implements ShowService {

    private final ShowRepository showRepository;
    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;
    private final SeatRepository seatRepository;
    private final ShowSeatReservationRepository reservationRepository;
    public ShowServiceImpl(
            ShowRepository showRepository,
            MovieRepository movieRepository,
            ScreenRepository screenRepository,
            SeatRepository seatRepository,
            ShowSeatReservationRepository reservationRepository) {

        this.showRepository = showRepository;
        this.movieRepository = movieRepository;
        this.screenRepository = screenRepository;
        this.seatRepository = seatRepository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public Show createShow(Show show) {
        validateMovieAndScreen(show);
        validateScheduleConflict(show, null);

        // Save the show first to generate its ID.
        Show savedShow = showRepository.save(show);

        // Get all seats configured for this screen.
        List<Seat> seats =
                seatRepository.findByScreenId(savedShow.getScreenId());

        // Create an AVAILABLE reservation for every seat.
        LocalDateTime now = LocalDateTime.now();

        List<ShowSeatReservation> reservations = seats.stream()
                .map(seat -> ShowSeatReservation.builder()
                        .showId(savedShow.getId())
                        .seatId(seat.getId())
                        .bookingId(null)
                        .status("AVAILABLE")
                        .createdAt(now)
                        .updatedAt(now)
                        .build())
                .toList();

        reservationRepository.saveAll(reservations);

        return savedShow;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Show> getShowById(Long id) {
        return showRepository.findById(id);
    }

    @Override
    public Show updateShow(Long id, Show show) {
        Show existingShow = showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Show not found with id: " + id));

        validateMovieAndScreen(show);
        validateScheduleConflict(show, id);

        existingShow.setMovieId(show.getMovieId());
        existingShow.setScreenId(show.getScreenId());
        existingShow.setShowDate(show.getShowDate());
        existingShow.setShowTime(show.getShowTime());

        return showRepository.save(existingShow);
    }

    @Override
    public void deleteShow(Long id) {
        Show existingShow = showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Show not found with id: " + id));

        showRepository.delete(existingShow);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Show> getShowsByMovieId(Long movieId) {
        return showRepository.findByMovieId(movieId);
    }

    private void validateMovieAndScreen(Show show) {
        if (show.getMovieId() == null
                || !movieRepository.existsById(show.getMovieId())) {
            throw new IllegalArgumentException(
                    "Movie not found with id: " + show.getMovieId());
        }

        if (show.getScreenId() == null
                || !screenRepository.existsById(show.getScreenId())) {
            throw new IllegalArgumentException(
                    "Screen not found with id: " + show.getScreenId());
        }

        if (show.getShowDate() == null
                || show.getShowDate().isBlank()) {
            throw new IllegalArgumentException("Show date is required.");
        }

        if (show.getShowTime() == null
                || show.getShowTime().isBlank()) {
            throw new IllegalArgumentException("Show time is required.");
        }
    }

    private void validateScheduleConflict(Show show, Long excludeId) {
        List<Show> existingShows = showRepository.findAll();

        boolean conflict = existingShows.stream().anyMatch(existing ->
                !Objects.equals(existing.getId(), excludeId)
                        && Objects.equals(existing.getScreenId(), show.getScreenId())
                        && Objects.equals(existing.getShowDate(), show.getShowDate())
                        && Objects.equals(existing.getShowTime(), show.getShowTime()));

        if (conflict) {
            throw new IllegalArgumentException(
                    "This screen already has a show at that date and time.");
        }
    }
}