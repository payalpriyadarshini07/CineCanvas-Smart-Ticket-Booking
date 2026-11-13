
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Seat } from '../seat-map/seat.model';

export interface SeatLockResponse {
  success: boolean;
  message: string;
  lockToken: string | null;
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

export interface PaymentResponse {
  paymentId: number;
  bookingId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

export interface RazorpayOrderResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  bookingId: number;
}

export interface VerifyPaymentRequest {
  bookingId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeatService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8081/api';

  getAvailableSeats(screenId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(
      `${this.apiUrl}/screens/${screenId}/available-seats`
    );
  }

  lockSeat(
    showId: number,
    seatId: number
  ): Observable<SeatLockResponse> {
    return this.http.post<SeatLockResponse>(
      `${this.apiUrl}/seats/lock`,
      { showId, seatId }
    );
  }

  unlockSeat(
    showId: number,
    seatId: number,
    lockToken: string
  ): Observable<SeatLockResponse> {
    return this.http.post<SeatLockResponse>(
      `${this.apiUrl}/seats/unlock`,
      { showId, seatId, lockToken }
    );
  }

  // CREATE BOOKING FOR MULTIPLE SEATS
  createBooking(
    userId: number,
    showId: number,
    seatIds: number[],
    lockTokens: string[]
  ): Observable<BookingResponse> {

    return this.http.post<BookingResponse>(
      `${this.apiUrl}/bookings`,
      {
        userId,
        showId,
        seatIds,
        lockTokens
      }
    );
  }

  // CREATE RAZORPAY ORDER
  createRazorpayOrder(
    bookingId: number,
    paymentMethod: string
  ): Observable<RazorpayOrderResponse> {

    return this.http.post<RazorpayOrderResponse>(
      `${this.apiUrl}/payments`,
      {
        bookingId,
        paymentMethod,
        simulateSuccess: false
      }
    );
  }

  // VERIFY RAZORPAY PAYMENT
  verifyRazorpayPayment(
    request: VerifyPaymentRequest
  ): Observable<PaymentResponse> {

    return this.http.post<PaymentResponse>(
      `${this.apiUrl}/payments/verify`,
      request
    );
  }

  getBooking(bookingId: number): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(
      `${this.apiUrl}/bookings/${bookingId}`
    );
  }
}