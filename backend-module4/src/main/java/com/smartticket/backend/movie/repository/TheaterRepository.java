package com.smartticket.backend.movie.repository;

import com.smartticket.backend.movie.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TheaterRepository extends JpaRepository<Theater, Long> {
}