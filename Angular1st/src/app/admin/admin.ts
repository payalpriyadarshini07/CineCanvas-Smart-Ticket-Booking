
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  private readonly apiUrl = 'http://localhost:8081/api';

  movies: any[] = [];
  theaters: any[] = [];
  screens: any[] = [];
  shows: any[] = [];

  loading = true;
  errorMessage = '';
  successMessage = '';

  showMovieForm = false;
  editingMovieId: number | null = null;
  movieForm = this.emptyMovieForm();

  showTheaterForm = false;
  editingTheaterId: number | null = null;
  theaterForm = this.emptyTheaterForm();

  showScreenForm = false;
  editingScreenId: number | null = null;
  screenForm = this.emptyScreenForm();

  showShowForm = false;
  editingShowId: number | null = null;
  showForm = this.emptyShowForm();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  emptyMovieForm(): any {
    return {
      title: '',
      description: '',
      genre: '',
      language: '',
      duration: 120,
      releaseDate: '',
      posterUrl: ''
    };
  }

  emptyTheaterForm(): any {
    return { name: '', location: '' };
  }

  emptyScreenForm(): any {
    return {
      name: '',
      totalSeats: 100,
      theaterId: null
    };
  }

  emptyShowForm(): any {
    return {
      movieId: null,
      screenId: null,
      showDate: '',
      showTime: ''
    };
  }
loadDashboard(): void {
  this.loading = true;
  this.errorMessage = '';

  forkJoin({
    movies: this.http.get<any[]>(`${this.apiUrl}/movies`).pipe(
      catchError(error => {
        console.error('Movies API error:', error);
        this.errorMessage = 'Could not load movies.';
        return of([]);
      })
    ),
    theaters: this.http.get<any[]>(`${this.apiUrl}/theaters`).pipe(
      catchError(error => {
        console.error('Theaters API error:', error);
        this.errorMessage = 'Could not load theaters.';
        return of([]);
      })
    ),
    screens: this.http.get<any[]>(`${this.apiUrl}/screens`).pipe(
      catchError(error => {
        console.error('Screens API error:', error);
        this.errorMessage = 'Could not load screens.';
        return of([]);
      })
    ),
    shows: this.http.get<any[]>(`${this.apiUrl}/shows`).pipe(
      catchError(error => {
        console.error('Shows API error:', error);
        this.errorMessage = 'Could not load shows.';
        return of([]);
      })
    )
  }).subscribe({
    next: data => {
      this.movies = data.movies;
      this.theaters = data.theaters;
      this.screens = data.screens;
      this.shows = data.shows;
      this.loading = false;

      console.log('Admin dashboard loaded:', {
        movies: this.movies.length,
        theaters: this.theaters.length,
        screens: this.screens.length,
        shows: this.shows.length
      });

      this.cdr.detectChanges();
    },
    error: error => {
      console.error('Dashboard loading error:', error);
      this.errorMessage = 'Unable to load dashboard data.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}
  // Movie management

  openAddMovieForm(): void {
    this.editingMovieId = null;
    this.movieForm = this.emptyMovieForm();
    this.showMovieForm = true;
    this.showTheaterForm = false;
    this.showScreenForm = false;
    this.showShowForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  editMovie(movie: any): void {
    this.editingMovieId = movie.id;
    this.movieForm = { ...this.emptyMovieForm(), ...movie };
    this.showMovieForm = true;
    this.showTheaterForm = false;
    this.showScreenForm = false;
    this.showShowForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelMovieForm(): void {
    this.showMovieForm = false;
    this.editingMovieId = null;
    this.movieForm = this.emptyMovieForm();
  }

  saveMovie(): void {
    if (
      !this.movieForm.title?.trim() ||
      !this.movieForm.description?.trim() ||
      !this.movieForm.genre?.trim() ||
      !this.movieForm.language?.trim() ||
      !this.movieForm.releaseDate ||
      !this.movieForm.posterUrl?.trim() ||
      Number(this.movieForm.duration) <= 0
    ) {
      this.errorMessage = 'Please complete all movie fields.';
      return;
    }

    const id = this.editingMovieId;
    const payload = {
      ...this.movieForm,
      duration: Number(this.movieForm.duration)
    };

    const request = id !== null
      ? this.http.put(`${this.apiUrl}/movies/${id}`, payload)
      : this.http.post(`${this.apiUrl}/movies`, payload);

    request.subscribe({
      next: () => {
        this.successMessage = id !== null
          ? 'Movie updated successfully.'
          : 'Movie added successfully.';
        this.cancelMovieForm();
        this.loadDashboard();
      },
      error: error => {
        console.error('Save movie error:', error);
        this.errorMessage = 'Could not save movie. Check the backend.';
      }
    });
  }

  deleteMovie(movie: any): void {
    if (!confirm(`Delete "${movie.title}"?`)) return;

    this.http.delete(`${this.apiUrl}/movies/${movie.id}`).subscribe({
      next: () => {
        this.successMessage = 'Movie deleted successfully.';
        this.loadDashboard();
      },
      error: error => {
        console.error('Delete movie error:', error);
        this.errorMessage = 'Could not delete movie.';
      }
    });
  }

  // Theater management

  openAddTheaterForm(): void {
    this.editingTheaterId = null;
    this.theaterForm = this.emptyTheaterForm();
    this.showTheaterForm = true;
    this.showMovieForm = false;
    this.showScreenForm = false;
    this.showShowForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  editTheater(theater: any): void {
    this.editingTheaterId = theater.id;
    this.theaterForm = {
      name: theater.name ?? '',
      location: theater.location ?? ''
    };
    this.showTheaterForm = true;
    this.showMovieForm = false;
    this.showScreenForm = false;
    this.showShowForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelTheaterForm(): void {
    this.showTheaterForm = false;
    this.editingTheaterId = null;
    this.theaterForm = this.emptyTheaterForm();
  }

  saveTheater(): void {
    const name = this.theaterForm.name?.trim();
    const location = this.theaterForm.location?.trim();

    if (!name || !location) {
      this.errorMessage = 'Enter both theater name and location.';
      return;
    }

    const id = this.editingTheaterId;
    const payload = { name, location };

    const request = id !== null
      ? this.http.put(`${this.apiUrl}/theaters/${id}`, payload)
      : this.http.post(`${this.apiUrl}/theaters`, payload);

    request.subscribe({
      next: () => {
        this.successMessage = id !== null
          ? 'Theater updated successfully.'
          : 'Theater added successfully.';
        this.cancelTheaterForm();
        this.loadDashboard();
      },
      error: error => {
        console.error('Save theater error:', error);
        this.errorMessage = 'Could not save theater. Check backend endpoints.';
      }
    });
  }

  deleteTheater(theater: any): void {
    if (!confirm(`Delete theater "${theater.name}"?`)) return;

    this.http.delete(`${this.apiUrl}/theaters/${theater.id}`).subscribe({
      next: () => {
        this.successMessage = 'Theater deleted successfully.';
        this.loadDashboard();
      },
      error: error => {
        console.error('Delete theater error:', error);
        this.errorMessage = 'Could not delete theater. Check backend dependencies.';
      }
    });
  }

  // Screen management

  openAddScreenForm(): void {
    this.editingScreenId = null;
    this.screenForm = this.emptyScreenForm();
    this.showScreenForm = true;
    this.showMovieForm = false;
    this.showTheaterForm = false;
    this.showShowForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  editScreen(screen: any): void {
    this.editingScreenId = screen.id;
    this.screenForm = {
      name: screen.name ?? '',
      totalSeats: screen.totalSeats ?? 100,
      theaterId: screen.theaterId ?? null
    };
    this.showScreenForm = true;
    this.showMovieForm = false;
    this.showTheaterForm = false;
    this.showShowForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelScreenForm(): void {
    this.showScreenForm = false;
    this.editingScreenId = null;
    this.screenForm = this.emptyScreenForm();
  }

  saveScreen(): void {
    const name = this.screenForm.name?.trim();
    const totalSeats = Number(this.screenForm.totalSeats);
    const theaterId = Number(this.screenForm.theaterId);

    if (!name || !Number.isInteger(totalSeats) || totalSeats <= 0 ||
        !Number.isInteger(theaterId) || theaterId <= 0) {
      this.errorMessage =
        'Enter a screen name, a positive whole-number seat capacity, and select a theater.';
      return;
    }

    const id = this.editingScreenId;
    const payload = { name, totalSeats, theaterId };

    const request = id !== null
      ? this.http.put(`${this.apiUrl}/screens/${id}`, payload)
      : this.http.post(`${this.apiUrl}/screens`, payload);

    request.subscribe({
      next: () => {
        this.successMessage = id !== null
          ? 'Screen updated successfully.'
          : 'Screen added successfully.';
        this.cancelScreenForm();
        this.loadDashboard();
      },
      error: error => {
        console.error('Save screen error:', error);
        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'Could not save screen. Check the selected theater and backend.';
      }
    });
  }

  deleteScreen(screen: any): void {
    if (!confirm(`Delete screen "${screen.name}"?`)) return;

    this.http.delete(`${this.apiUrl}/screens/${screen.id}`).subscribe({
      next: () => {
        this.successMessage = 'Screen deleted successfully.';
        this.loadDashboard();
      },
      error: error => {
        console.error('Delete screen error:', error);
        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'Could not delete screen. It may have scheduled shows.';
      }
    });
  }

  getTheaterName(theaterId: number): string {
    const theater = this.theaters.find(
      item => Number(item.id) === Number(theaterId)
    );
    return theater?.name ?? `Theater #${theaterId}`;
  }

  // Show management

  openAddShowForm(): void {
    this.editingShowId = null;
    this.showForm = this.emptyShowForm();
    this.showShowForm = true;
    this.showMovieForm = false;
    this.showTheaterForm = false;
    this.showScreenForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  editShow(show: any): void {
    this.editingShowId = show.id;
    this.showForm = {
      movieId: show.movieId,
      screenId: show.screenId,
      showDate: show.showDate ?? '',
      showTime: show.showTime ?? ''
    };
    this.showShowForm = true;
    this.showMovieForm = false;
    this.showTheaterForm = false;
    this.showScreenForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelShowForm(): void {
    this.showShowForm = false;
    this.editingShowId = null;
    this.showForm = this.emptyShowForm();
  }

  saveShow(): void {
    const movieId = Number(this.showForm.movieId);
    const screenId = Number(this.showForm.screenId);
    const showDate = this.showForm.showDate;
    const showTime = this.showForm.showTime;

    if (!movieId || !screenId || !showDate || !showTime) {
      this.errorMessage = 'Please select a movie, screen, date, and time.';
      return;
    }

    const id = this.editingShowId;
    const payload = { movieId, screenId, showDate, showTime };

    const request = id !== null
      ? this.http.put(`${this.apiUrl}/shows/${id}`, payload)
      : this.http.post(`${this.apiUrl}/shows`, payload);

    request.subscribe({
      next: () => {
        this.successMessage = id !== null
          ? 'Show updated successfully.'
          : 'Show created successfully.';
        this.cancelShowForm();
        this.loadDashboard();
      },
      error: error => {
        console.error('Save show error:', error);
        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'Could not save show. Check the selected movie, screen, and schedule.';
      }
    });
  }

  deleteShow(show: any): void {
    if (!confirm(`Delete show #${show.id}?`)) return;

    this.http.delete(`${this.apiUrl}/shows/${show.id}`).subscribe({
      next: () => {
        this.successMessage = 'Show deleted successfully.';
        this.loadDashboard();
      },
      error: error => {
        console.error('Delete show error:', error);
        this.errorMessage = 'Could not delete show.';
      }
    });
  }

  getMovieTitle(movieId: number): string {
    return this.movies.find(
      movie => Number(movie.id) === Number(movieId)
    )?.title ?? `Movie #${movieId}`;
  }

  getScreenName(screenId: number): string {
    const screen = this.screens.find(
      item => Number(item.id) === Number(screenId)
    );

    return screen?.name ?? `Screen #${screenId}`;
  }
}
