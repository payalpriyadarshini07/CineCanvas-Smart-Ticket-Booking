package com.smartticket.backend.movie.impl;

import com.smartticket.backend.movie.entity.Theater;
import com.smartticket.backend.movie.repository.TheaterRepository;
import com.smartticket.backend.movie.service.TheaterService;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TheaterServiceImpl implements TheaterService {

    private final TheaterRepository theaterRepository;

    public TheaterServiceImpl(TheaterRepository theaterRepository) {
        this.theaterRepository = theaterRepository;
    }

    @Override
    public Theater createTheater(Theater theater) {
        return theaterRepository.save(theater);
    }

    @Override
    public List<Theater> getAllTheaters() {
        return theaterRepository.findAll();
    }

    @Override
    public Optional<Theater> getTheaterById(Long id) {
        return theaterRepository.findById(id);
    }

    @Override
    public Theater updateTheater(Long id, Theater theater) {
        Theater existingTheater = theaterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Theater not found"));

        existingTheater.setName(theater.getName());
        existingTheater.setLocation(theater.getLocation());

        return theaterRepository.save(existingTheater);
    }

    @Override
    public void deleteTheater(Long id) {
        if (!theaterRepository.existsById(id)) {
            throw new RuntimeException("Theater not found");
        }

        theaterRepository.deleteById(id);
    }
}