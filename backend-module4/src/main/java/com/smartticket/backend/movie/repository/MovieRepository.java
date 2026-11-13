package com.smartticket.backend.movie.repository;

import com.smartticket.backend.movie.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, Long> {

}