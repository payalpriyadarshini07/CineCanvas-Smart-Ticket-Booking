
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShowService } from '../show.service';
import { Show } from '../show.model';

@Component({
  selector: 'app-show-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './show-list.html',
  styleUrl: './show-list.css'
})
export class ShowList implements OnInit {

  shows: Show[] = [];
  movieId = 0;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private showService: ShowService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.movieId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(this.movieId) || this.movieId <= 0) {
      this.errorMessage = 'Invalid movie ID.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.showService.getShowsByMovieId(this.movieId).subscribe({
      next: (data: Show[]) => {
        console.log('SHOW API RESPONSE:', data);

        this.shows = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error loading shows:', error);

        this.errorMessage =
          'Unable to load shows. Please check the backend connection.';

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
 getSeatMapUrl(showId: number | undefined, screenId: number | undefined): string {
  if (showId == null || screenId == null) {
    return '#';
  }

  const userId = sessionStorage.getItem('userId') || '';

  return `http://localhost:4201/seat-map?showId=${showId}&screenId=${screenId}&userId=${userId}`;
}
}
