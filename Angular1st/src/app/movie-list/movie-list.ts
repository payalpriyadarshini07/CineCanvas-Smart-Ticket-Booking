import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MovieService } from '../movie.service';
import { Movie } from '../movie.model';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.css'
})
export class MovieListComponent implements OnInit {

  movies: Movie[] = [];
  filteredMovies: Movie[] = [];

  searchText = '';
  selectedGenre = 'All Genres';
  selectedLanguage = 'All Languages';

  loading = false;
  errorMessage = '';

  constructor(
    private movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.movieService.getMovies().subscribe({
      next: (data: Movie[] | null) => {
        console.log('Movies received from backend:', data);

        this.movies = Array.isArray(data) ? data : [];
        this.filterMovies();
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error: unknown) => {
        console.error('Error loading movies:', error);

        this.movies = [];
        this.filteredMovies = [];
        this.errorMessage =
          'Unable to load movies. Please try again.';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  filterMovies(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredMovies = this.movies.filter((movie) => {

      const matchesSearch =
        (movie.title ?? '').toLowerCase().includes(search) ||
        (movie.genre ?? '').toLowerCase().includes(search) ||
        (movie.language ?? '').toLowerCase().includes(search);

      const matchesGenre =
        this.selectedGenre === 'All Genres' ||
        (movie.genre ?? '').toLowerCase() ===
          this.selectedGenre.toLowerCase();

      const matchesLanguage =
        this.selectedLanguage === 'All Languages' ||
        (movie.language ?? '').toLowerCase() ===
          this.selectedLanguage.toLowerCase();

      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }
}