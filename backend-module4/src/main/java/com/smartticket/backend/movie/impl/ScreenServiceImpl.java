package com.smartticket.backend.movie.impl;
import com.smartticket.backend.entity.Seat;
import com.smartticket.backend.repository.SeatRepository;
import java.math.BigDecimal;
import com.smartticket.backend.movie.entity.Screen;
import com.smartticket.backend.movie.exception.ResourceNotFoundException;
import com.smartticket.backend.movie.repository.ScreenRepository;
import com.smartticket.backend.movie.repository.ShowRepository;
import com.smartticket.backend.movie.repository.TheaterRepository;
import com.smartticket.backend.movie.service.ScreenService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ScreenServiceImpl implements ScreenService {
    private final SeatRepository seatRepository;
    private final ScreenRepository screenRepository;
    private final TheaterRepository theaterRepository;
    private final ShowRepository showRepository;

    public ScreenServiceImpl(
            ScreenRepository screenRepository,
            TheaterRepository theaterRepository,
            ShowRepository showRepository,
            SeatRepository seatRepository) {
        this.screenRepository = screenRepository;
        this.theaterRepository = theaterRepository;
        this.showRepository = showRepository;
        this.seatRepository = seatRepository;
    }

    @Override
    public Screen createScreen(Screen screen) {
        validateTheater(screen.getTheaterId());

        Screen savedScreen = screenRepository.save(screen);

        int totalSeats = savedScreen.getTotalSeats();

        for (int i = 1; i <= totalSeats; i++) {
            String row = String.valueOf((char) ('A' + (i - 1) / 10));
            int seatNumber = ((i - 1) % 10) + 1;

            Seat seat = Seat.builder()
                    .screenId(savedScreen.getId())
                    .seatNumber(row + seatNumber)
                    .seatTier(row.equals("A") ? "PREMIUM" : "REGULAR")
                    .price(row.equals("A")
                            ? new BigDecimal("250.00")
                            : new BigDecimal("180.00"))
                    .build();

            seatRepository.save(seat);
        }

        return savedScreen;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Screen> getAllScreens() {
        return screenRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Screen> getScreenById(Long id) {
        return screenRepository.findById(id);
    }

    @Override
    public Screen updateScreen(Long id, Screen screen) {
        Screen existingScreen = screenRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Screen not found with id: " + id));

        validateTheater(screen.getTheaterId());

        existingScreen.setName(screen.getName());
        existingScreen.setTotalSeats(screen.getTotalSeats());
        existingScreen.setTheaterId(screen.getTheaterId());

        return screenRepository.save(existingScreen);
    }

    @Override
    public void deleteScreen(Long id) {
        Screen existingScreen = screenRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Screen not found with id: " + id));

        if (!showRepository.findByScreenId(id).isEmpty()) {
            throw new IllegalArgumentException(
                    "Cannot delete this screen because shows are assigned to it. "
                            + "Remove or reassign those shows first.");
        }

        screenRepository.delete(existingScreen);
    }

    private void validateTheater(Long theaterId) {
        if (theaterId == null
                || !theaterRepository.existsById(theaterId)) {
            throw new IllegalArgumentException(
                    "Theater not found with id: " + theaterId);
        }
    }

}