import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {

  moviesCount = 14;
theatersCount = 6;
screensCount = 9;
showsCount = 40;

totalBookings = 57;
confirmedBookings = 26;
cancelledBookings = 8;
failedBookings = 0;
totalRevenue = 5800;

  // UI state
  loading = false;
  errorMessage = '';

  private readonly apiUrl = 'http://localhost:8081/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    // Admin authentication check
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
      this.router.navigate(['/admin-login']);
      return;
    }

    this.loadAdminStats();
  }

  loadAdminStats(): void {

    // Show dashboard immediately
    this.loading = false;
    this.errorMessage = '';

    // Movies
    this.http.get<any[]>(`${this.apiUrl}/movies`).subscribe({
      next: (data) => {
        this.moviesCount = data.length;
      },
      error: (err) => {
        console.error('Movies API error:', err);
        this.moviesCount = 0;
      }
    });

    // Theaters
    this.http.get<any[]>(`${this.apiUrl}/theaters`).subscribe({
      next: (data) => {
        this.theatersCount = data.length;
      },
      error: (err) => {
        console.error('Theaters API error:', err);
        this.theatersCount = 0;
      }
    });

    // Screens
    this.http.get<any[]>(`${this.apiUrl}/screens`).subscribe({
      next: (data) => {
        this.screensCount = data.length;
      },
      error: (err) => {
        console.error('Screens API error:', err);
        this.screensCount = 0;
      }
    });

    // Shows
    this.http.get<any[]>(`${this.apiUrl}/shows`).subscribe({
      next: (data) => {
        this.showsCount = data.length;
      },
      error: (err) => {
        console.error('Shows API error:', err);
        this.showsCount = 0;
      }
    });

    // Analytics
    this.http.get<any>(
      `${this.apiUrl}/analytics/summary`
    ).subscribe({
      next: (data) => {

        console.log('ADMIN ANALYTICS:', data);

        this.totalBookings = Number(data.totalBookings);
        this.confirmedBookings = Number(data.confirmedBookings);
        this.cancelledBookings = Number(data.cancelledBookings);
        this.failedBookings = Number(data.failedBookings);
        this.totalRevenue = Number(data.totalRevenue);
      },

      error: (err) => {
        console.error('Analytics API error:', err);
        this.errorMessage = 'Unable to load analytics data.';
      }
    });
  }

  openManagement(): void {
    this.router.navigate(['/admin']);
  }

  openBookings(): void {
    this.router.navigate(['/admin-bookings']);
  }

  logout(): void {
    sessionStorage.removeItem('adminLoggedIn');
    this.router.navigateByUrl('/');
  }
}