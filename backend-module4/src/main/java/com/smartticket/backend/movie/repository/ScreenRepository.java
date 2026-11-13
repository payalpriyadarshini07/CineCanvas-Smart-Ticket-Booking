package com.smartticket.backend.movie.repository;

import com.smartticket.backend.movie.entity.Screen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScreenRepository extends JpaRepository<Screen, Long> {
}