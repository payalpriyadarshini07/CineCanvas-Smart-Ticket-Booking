import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SeatLockRequest {
  showId: number;
  seatId: number;
  lockToken?: string;
}

export interface SeatLockResponse {
  success: boolean;
  message: string;
  lockToken: string | null;
}

export interface CreateBookingRequest {
  userId: number;
  showId: number;
  seatIds: number[];
  lockToken: string;
}

export interface BookingResponse {
  bookingId: number;
  userId: number;
  showId: number;
  seatIds: number[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Lock a selected seat using Redis
  lockSeat(data: SeatLockRequest): Observable<SeatLockResponse> {
    return this.http.post<SeatLockResponse>(
      `${this.apiUrl}/seats/lock`,
      data
    );
  }

  // Unlock a selected seat
  unlockSeat(data: SeatLockRequest): Observable<SeatLockResponse> {
    return this.http.post<SeatLockResponse>(
      `${this.apiUrl}/seats/unlock`,
      data
    );
  }

  // Create booking
  createBooking(data: CreateBookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(
      `${this.apiUrl}/bookings`,
      data
    );
  }

  // Get booking details
  getBooking(bookingId: number): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(
      `${this.apiUrl}/bookings/${bookingId}`
    );
  }
}