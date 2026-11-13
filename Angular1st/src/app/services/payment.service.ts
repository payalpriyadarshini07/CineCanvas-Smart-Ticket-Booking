import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreatePaymentRequest {
  bookingId: number;
  paymentMethod: string;
  simulateSuccess: boolean;
}

export interface CreatePaymentResponse {
  orderId: string;
  currency: string;
  keyId: string;
  amount: number;
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
export class PaymentService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Create Razorpay order
  createPayment(data: CreatePaymentRequest): Observable<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>(
      `${this.apiUrl}/payments`,
      data
    );
  }

  // Verify Razorpay payment
  verifyPayment(data: VerifyPaymentRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/payments/verify`,
      data
    );
  }
}