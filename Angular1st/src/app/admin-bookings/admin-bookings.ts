import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './admin-bookings.html',
  styleUrl: './admin-bookings.css'
})
export class AdminBookings implements OnInit {

  bookings: any[] = [];
  loading = true;
  errorMessage = '';

  private apiUrl = 'http://localhost:8081/api/bookings';

constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}
  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
  this.loading = true;
  this.errorMessage = '';

  this.http.get<any[]>(this.apiUrl).subscribe({
    next: (data) => {
      console.log('Bookings received:', data);

      this.bookings = data;
      this.loading = false;

      this.cdr.detectChanges();

      console.log('Loading status:', this.loading);
      console.log('Total bookings:', this.bookings.length);
    },
    error: (error) => {
      console.error('Booking loading error:', error);

      this.errorMessage = 'Unable to load bookings.';
      this.loading = false;

      this.cdr.detectChanges();
    }
  });
}
  countStatus(status: string): number {
  return this.bookings.filter(
    booking => booking.status === status
  ).length;
}
}