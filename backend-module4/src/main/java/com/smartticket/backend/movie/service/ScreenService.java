package com.smartticket.backend.movie.service;

import com.smartticket.backend.movie.entity.Screen;

import java.util.List;
import java.util.Optional;

public interface ScreenService {

    Screen createScreen(Screen screen);

    List<Screen> getAllScreens();

    Optional<Screen> getScreenById(Long id);

    Screen updateScreen(Long id, Screen screen);

    void deleteScreen(Long id);
}