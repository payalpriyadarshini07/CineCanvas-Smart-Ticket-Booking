
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../movie.service';
import { Movie } from '../movie.model';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css'
})
export class MovieDetails implements OnInit {

  movie: Movie | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      this.movie = null;
      this.errorMessage = '';
      this.loading = true;

      if (!Number.isInteger(id) || id <= 0) {
        this.errorMessage = 'Invalid movie ID.';
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }

      this.movieService.getMovieById(id).subscribe({
        next: (data: Movie) => {
          console.log('Movie details received:', data);

          this.movie = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading movie:', error);

          this.movie = null;
          this.errorMessage =
            'Unable to load movie details. Please try again.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }
}
