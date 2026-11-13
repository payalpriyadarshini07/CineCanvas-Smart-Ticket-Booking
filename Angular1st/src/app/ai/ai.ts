import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Module4Service } from '../services/module4.service';

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai.html',
  styleUrl: './ai.css'
})
export class Ai {

  recommendationLoading = false;
  demandLoading = false;
  fraudLoading = false;

  favoriteGenres: string[] = ['Action', 'Thriller'];

  availableGenres: string[] = [
    'Action',
    'Thriller',
    'Sci-Fi',
    'Romance',
    'Comedy'
  ];

  recommendations: any[] = [];
  demandResult: any = null;
  fraudResult: any = null;

  showId = 1;
  currentBookings = 20;
  totalSeats = 100;
  hoursUntilShow = 24;

  bookingId = 65;

  recommendationMessage =
    'Select your favorite genres and click Generate Recommendations.';

  demandMessage =
    'Enter the show details and click Predict Demand.';

  fraudMessage =
    'Enter your booking ID and click Security Check.';

  constructor(private readonly module4Service: Module4Service) {}

  toggleGenre(genre: string): void {
    if (this.favoriteGenres.includes(genre)) {
      this.favoriteGenres = this.favoriteGenres.filter(
        selected => selected !== genre
      );
    } else {
      this.favoriteGenres = [...this.favoriteGenres, genre];
    }
  }

  isGenreSelected(genre: string): boolean {
    return this.favoriteGenres.includes(genre);
  }

  runRecommendations(): void {
    if (this.favoriteGenres.length === 0) {
      this.recommendations = [];
      this.recommendationMessage =
        'Please select at least one genre.';
      return;
    }

    this.recommendationLoading = true;
    this.recommendations = [];
    this.recommendationMessage = 'Generating recommendations...';

    const request = {
      userId: 2,
      favoriteGenres: [...this.favoriteGenres],
      limit: 5
    };

    this.module4Service.getRecommendations(request).subscribe({
      next: (response: any) => {
        console.log('AI recommendations response:', response);

        this.recommendations =
          Array.isArray(response?.recommendations)
            ? response.recommendations
            : [];

        this.recommendationLoading = false;

        if (this.recommendations.length > 0) {
          this.recommendationMessage =
            `${this.recommendations.length} movies recommended for you.`;
        } else {
          this.recommendationMessage =
            'No recommendations were returned.';
        }
      },

      error: (error) => {
        console.error('AI recommendations error:', error);

        this.recommendationLoading = false;
        this.recommendations = [];

        this.recommendationMessage =
          `Recommendation failed (HTTP ${error?.status || 'error'}).`;
      }
    });
  }

  runDemandPrediction(): void {
    if (
      Number(this.showId) <= 0 ||
      Number(this.currentBookings) < 0 ||
      Number(this.totalSeats) <= 0 ||
      Number(this.hoursUntilShow) < 0
    ) {
      this.demandResult = null;
      this.demandMessage =
        'Please enter valid show information.';
      return;
    }

    if (Number(this.currentBookings) > Number(this.totalSeats)) {
      this.demandResult = null;
      this.demandMessage =
        'Current bookings cannot exceed total seats.';
      return;
    }

    this.demandLoading = true;
    this.demandResult = null;
    this.demandMessage = 'Predicting show demand...';

    const request = {
      showId: Number(this.showId),
      currentBookings: Number(this.currentBookings),
      totalSeats: Number(this.totalSeats),
      hoursUntilShow: Number(this.hoursUntilShow)
    };

    this.module4Service.predictDemand(request).subscribe({
      next: (response: any) => {
        console.log('AI demand response:', response);

        this.demandResult = response;
        this.demandLoading = false;
        this.demandMessage =
          'Demand prediction completed successfully.';
      },

      error: (error) => {
        console.error('AI demand error:', error);

        this.demandLoading = false;
        this.demandResult = null;

        this.demandMessage =
          `Demand prediction failed (HTTP ${error?.status || 'error'}).`;
      }
    });
  }

  runFraudDetection(): void {
    if (Number(this.bookingId) <= 0) {
      this.fraudResult = null;
      this.fraudMessage =
        'Please enter a valid booking ID.';
      return;
    }

    this.fraudLoading = true;
    this.fraudResult = null;
    this.fraudMessage = 'Checking booking security...';

    const request = {
      bookingId: Number(this.bookingId),
      userId: 2,
      bookingAmount: 250,
      bookingFrequency: 1,
      failedPaymentAttempts: 0,
      bookingsInLastMinute: 1
    };

    this.module4Service.detectFraud(request).subscribe({
      next: (response: any) => {
        console.log('AI fraud response:', response);

        this.fraudResult = response;
        this.fraudLoading = false;
        this.fraudMessage =
          'Booking security analysis completed.';
      },

      error: (error) => {
        console.error('AI fraud error:', error);

        this.fraudLoading = false;
        this.fraudResult = null;

        this.fraudMessage =
          `Security check failed (HTTP ${error?.status || 'error'}).`;
      }
    });
  }
}
