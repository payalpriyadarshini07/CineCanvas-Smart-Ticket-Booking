import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MovieListComponent } from './movie-list';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initially have empty movie lists', () => {
    expect(component.movies).toEqual([]);
    expect(component.filteredMovies).toEqual([]);
  });

  it('should filter movies by title', () => {
    component.movies = [
      {
        id: 1,
        title: 'Inception',
        description: 'A science fiction movie',
        genre: 'Sci-Fi',
        language: 'English',
        duration: 148,
        releaseDate: '2010-07-16',
        posterUrl: ''
      },
      {
        id: 2,
        title: '3 Idiots',
        description: 'A comedy-drama movie',
        genre: 'Education',
        language: 'Hindi',
        duration: 170,
        releaseDate: '2009-12-25',
        posterUrl: ''
      }
    ];

    component.searchText = 'inception';
    component.filterMovies();

    expect(component.filteredMovies.length).toBe(1);
    expect(component.filteredMovies[0].title).toBe('Inception');
  });
});