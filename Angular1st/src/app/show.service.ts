 import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Show } from './show.model';

@Injectable({
  providedIn: 'root'
})
export class ShowService {

  private apiUrl = 'http://localhost:8081/api/shows';

  constructor(private http: HttpClient) {}

  getShows(): Observable<Show[]> {
    return this.http.get<Show[]>(this.apiUrl);
  }

  getShowsByMovieId(movieId: number): Observable<Show[]> {
    return this.http.get<Show[]>(`${this.apiUrl}?movieId=${movieId}`);
  }
}