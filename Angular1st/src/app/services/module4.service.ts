import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsSummary {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  failedBookings: number;
  totalRevenue: number;
}

export interface RecommendationRequest {
  userId: number;
  favoriteGenres: string[];
  limit?: number;
}

export interface DemandPredictionRequest {
  showId: number;
  currentBookings: number;
  totalSeats: number;
  hoursUntilShow: number;
}

export interface FraudDetectionRequest {
  bookingId: number;
  userId: number;
  bookingAmount: number;
  bookingFrequency: number;
  failedPaymentAttempts: number;
  bookingsInLastMinute: number;
}

/**
 * Request used for checking booking risk
 * BEFORE the booking is confirmed.
 */
export interface PreBookingRiskRequest {
  showId: number;
  totalSeats: number;
  currentBookings: number;
  hoursUntilShow: number;
  bookingAmount: number;
  seatsRequested: number;
}

export interface TicketResponse {
  bookingId: number;
  userId: number;
  showId: number;
  movieTitle: string;
  moviePoster: string;
  showDate: string;
  showTime: string;
  seatNumbers: string[];
  totalAmount: number;
  status: string;
  bookingTime: string;
  qrCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class Module4Service {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8081';

  // ==========================================
  // ANALYTICS
  // ==========================================

  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(
      `${this.apiUrl}/api/analytics/summary`
    );
  }

  // ==========================================
  // MOVIE RECOMMENDATIONS
  // ==========================================

  getRecommendations(
    request: RecommendationRequest
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/api/ai/recommendations`,
      request
    );
  }

  // ==========================================
  // DEMAND PREDICTION
  // ==========================================

  predictDemand(
    request: DemandPredictionRequest
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/api/ai/demand-prediction`,
      request
    );
  }

  // ==========================================
  // FRAUD DETECTION
  // ==========================================

  detectFraud(
    request: FraudDetectionRequest
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/api/ai/fraud-detection`,
      request
    );
  }

  // ==========================================
  // PRE-BOOKING SECURITY CHECK
  // ==========================================

  checkPreBookingRisk(
  request: PreBookingRiskRequest
): Observable<any> {

  return this.http.post<any>(
    `${this.apiUrl}/api/ai/pre-booking-risk`,
    request
  );
}
  // ==========================================
  // TICKET
  // ==========================================

  getTicket(
    bookingId: number
  ): Observable<TicketResponse> {

    return this.http.get<TicketResponse>(
      `${this.apiUrl}/api/tickets/${bookingId}`
    );
  }

}