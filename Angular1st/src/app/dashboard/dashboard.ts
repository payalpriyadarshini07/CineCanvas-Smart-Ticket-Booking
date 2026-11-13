import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  NgZone,
  ApplicationRef
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Module4Service } from '../services/module4.service';


interface Booking {
  bookingId: number;
  userId: number;
  showId: number;
  seatIds: number[];
  seatNumbers: string[];
  totalAmount: number;
  status: string;
  createdAt: string;
  movieTitle: string;
  moviePoster: string;
  showDate: string;
  showTime: string;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // =========================================================
  // BASIC DASHBOARD
  // =========================================================

  bookings: Booking[] = [];

  loading = true;
  errorMessage = '';

  isEditingProfile = false;
  profileMessage = '';
  profileError = '';

  userName = '';
  userEmail = '';
  userPhone = '';

  activeSection = 'overview';

  private apiUrl = 'http://localhost:8081/api';


  // =========================================================
  // AI 1: MOVIE RECOMMENDATIONS
  // =========================================================

  currentUserId = '';

  favoriteGenres = 'Action, Thriller';
  recommendationLimit = 5;

  availableGenres = [
    'Action',
    'Adventure',
    'Comedy',
    'Crime',
    'Drama',
    'Sci-Fi',
    'Thriller',
    'Biography',
    'History'
  ];

  selectedGenres: string[] = [
    'Action',
    'Thriller'
  ];

  recommendations: any[] = [];

  recommendationLoading = false;
  recommendationError = '';
  recommendationNote = '';


  // =========================================================
  // AI 2: DEMAND PREDICTION
  // =========================================================

  demandShowId = 1;
  demandTotalSeats = 0;
  demandCurrentBookings = 0;
  demandHoursUntilShow = 0;

  demandMovieTitle = '';
  demandShowDate = '';
  demandShowTime = '';

  demandLoading = false;
  demandError = '';
  demandResult: any = null;


  // =========================================================
  // AI 3: FRAUD / BOOKING SECURITY
  // =========================================================

  fraudLoading = false;
  fraudError = '';
  fraudResult: any = null;

  fraudBookingId = 0;
  fraudBookingAmount = 0;
  fraudBookingMovie = '';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private appRef: ApplicationRef,
    private module4Service: Module4Service
  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const params =
      new URLSearchParams(window.location.search);

    const transferredUserId =
      params.get('userId');

    if (transferredUserId) {
      sessionStorage.setItem(
        'userId',
        transferredUserId
      );
    }

    const userId =
      sessionStorage.getItem('userId');

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserId = userId;

    this.userName =
      sessionStorage.getItem('userName') ||
      'Customer';

    this.userEmail =
      sessionStorage.getItem('userEmail') ||
      '';

    this.userPhone =
      sessionStorage.getItem('userPhone') ||
      '';

    this.loadBookings();
    this.loadDemandDatabaseData();
  }


  // =========================================================
  // BOOKINGS
  // =========================================================

  loadBookings(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const userId =
      sessionStorage.getItem('userId');

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.get<Booking[]>(
      `${this.apiUrl}/bookings/user/${userId}`
    ).subscribe({

      next: (data) => {

        this.ngZone.run(() => {

          this.bookings =
            data || [];

          this.loading = false;

          this.cdr.markForCheck();
          this.cdr.detectChanges();

        });

      },

      error: (error) => {

        console.error(
          'Dashboard booking error:',
          error
        );

        this.ngZone.run(() => {

          this.errorMessage =
            'Unable to load your bookings.';

          this.loading = false;

          this.cdr.markForCheck();
          this.cdr.detectChanges();

        });

      }

    });
  }


  // =========================================================
  // BOOKING COUNTS
  // =========================================================

  get confirmedCount(): number {

    return this.bookings.filter(
      b =>
        String(b.status).toUpperCase() === 'CONFIRMED'
    ).length;

  }


  get cancelledCount(): number {

    return this.bookings.filter(
      b =>
        String(b.status).toUpperCase() === 'CANCELLED'
    ).length;

  }


  get expiredCount(): number {

    return this.bookings.filter(
      b =>
        String(b.status).toUpperCase() === 'EXPIRED'
    ).length;

  }


  get upcomingCount(): number {

    const today =
      new Date();

    return this.bookings.filter(
      b =>
        String(b.status).toUpperCase() === 'CONFIRMED' &&
        new Date(b.showDate) >= today
    ).length;

  }


  // =========================================================
  // NAVIGATION
  // =========================================================

  setActiveSection(section: string): void {

    this.activeSection =
      section;

  }


  // =========================================================
  // AI 1: MOVIE RECOMMENDATIONS
  // =========================================================

  toggleGenre(genre: string): void {

    if (this.selectedGenres.includes(genre)) {

      this.selectedGenres =
        this.selectedGenres.filter(
          g => g !== genre
        );

    } else {

      this.selectedGenres = [
        ...this.selectedGenres,
        genre
      ];

    }

    this.favoriteGenres =
      this.selectedGenres.join(', ');

  }


  getRecommendations(): void {

    // Prevent duplicate requests
    if (this.recommendationLoading) {
      return;
    }

    // Browser only
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const userId =
      Number(
        sessionStorage.getItem('userId')
      );

    const limit =
      Number(
        this.recommendationLimit
      );

    const genres =
      this.selectedGenres
        .map(g => g.trim())
        .filter(g => g.length > 0);


    // =======================================================
    // VALIDATION
    // =======================================================

    if (
      !Number.isInteger(userId) ||
      userId < 1
    ) {

      this.ngZone.run(() => {

        this.recommendationError =
          'Please log in again.';

        this.cdr.detectChanges();

      });

      return;
    }


    if (genres.length === 0) {

      this.ngZone.run(() => {

        this.recommendationError =
          'Select at least one favorite genre.';

        this.cdr.detectChanges();

      });

      return;
    }


    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 20
    ) {

      this.ngZone.run(() => {

        this.recommendationError =
          'Recommendation limit must be between 1 and 20.';

        this.cdr.detectChanges();

      });

      return;
    }


    // =======================================================
    // START REQUEST
    // =======================================================

    this.ngZone.run(() => {

      this.recommendationLoading = true;
      this.recommendationError = '';
      this.recommendationNote = '';
      this.recommendations = [];

      this.cdr.detectChanges();

    });


    console.log(
      'Sending recommendation request:',
      {
        userId: userId,
        favoriteGenres: genres,
        limit: limit
      }
    );


    this.module4Service.getRecommendations({

      userId: userId,

      favoriteGenres: genres,

      limit: limit

    }).subscribe({

      // =====================================================
      // SUCCESS
      // =====================================================

      next: (response) => {

        console.log(
          'Recommendation response:',
          response
        );


        this.ngZone.run(() => {

          this.recommendations =
            response?.recommendations || [];

          this.recommendationNote =
            response?.note || '';

          this.recommendationLoading =
            false;

          if (
            this.recommendations.length === 0
          ) {

            this.recommendationError =
              'No recommendations were found for the selected genres.';

          } else {

            this.recommendationError =
              '';

          }


          console.log(
            '### RECOMMENDATION UI UPDATE ###',
            {
              loading: this.recommendationLoading,
              recommendations:
                this.recommendations.length
            }
          );


          // Force Angular component refresh
          this.cdr.markForCheck();
          this.cdr.detectChanges();


          // Final application-level refresh
          setTimeout(() => {

            try {

              this.appRef.tick();

            } catch (tickError) {

              console.warn(
                'Application refresh warning:',
                tickError
              );

            }

          }, 0);

        });

      },


      // =====================================================
      // ERROR
      // =====================================================

      error: (error) => {

        console.error(
          'Recommendation AI error:',
          error
        );


        this.ngZone.run(() => {

          this.recommendationLoading =
            false;


          if (error?.status === 0) {

            this.recommendationError =
              'Unable to connect to the SmartTix backend.';

          } else if (error?.status === 500) {

            this.recommendationError =
              'SmartTix AI recommendation service returned an internal error.';

          } else {

            this.recommendationError =
              `Recommendation failed (HTTP ${error?.status}).`;

          }


          this.cdr.markForCheck();
          this.cdr.detectChanges();


          setTimeout(() => {

            try {

              this.appRef.tick();

            } catch (tickError) {

              console.warn(
                'Application refresh warning:',
                tickError
              );

            }

          }, 0);

        });

      }

    });

  }


  // =========================================================
  // AI 2: DEMAND PREDICTION
  // =========================================================

  loadDemandDatabaseData(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.http.get<any[]>(
      `${this.apiUrl}/shows`
    ).subscribe({

      next: (shows) => {

        this.ngZone.run(() => {

          if (!shows || shows.length === 0) {

            this.demandError =
              'No shows are available in the SmartTix database.';

            this.cdr.detectChanges();

            return;
          }


          // Prefer an upcoming show.
          const now = new Date();

          const upcomingShows =
            shows.filter(show => {

              const date =
                show.showDate ||
                show.show_date;

              const time =
                show.showTime ||
                show.show_time;

              if (!date || !time) {
                return true;
              }

              return new Date(
                `${date}T${time}`
              ) >= now;

            });


          const selectedShow =
            upcomingShows[0] ||
            shows[0];


          this.demandShowId =
            Number(
              selectedShow.showId ??
              selectedShow.id ??
              selectedShow.show_id
            );


          this.demandShowDate =
            selectedShow.showDate ??
            selectedShow.show_date ??
            '';


          this.demandShowTime =
            selectedShow.showTime ??
            selectedShow.show_time ??
            '';


          this.demandMovieTitle =
            selectedShow.movieTitle ??
            selectedShow.movie_title ??
            selectedShow.movieName ??
            selectedShow.movie_name ??
            'SmartTix Show';


          // =================================================
          // SCREEN CAPACITY
          // =================================================

          this.demandTotalSeats =
            Number(
              selectedShow.totalSeats ??
              selectedShow.total_seats ??
              selectedShow.capacity ??
              selectedShow.screenCapacity ??
              selectedShow.screen_capacity ??
              0
            );


          // =================================================
          // FALLBACK TO SCREEN DATABASE
          // =================================================

          const screenId =
            Number(
              selectedShow.screenId ??
              selectedShow.screen_id
            );


          if (
            this.demandTotalSeats <= 0 &&
            Number.isInteger(screenId) &&
            screenId > 0
          ) {

            this.http.get<any[]>(
              `${this.apiUrl}/screens`
            ).subscribe({

              next: (screens) => {

                this.ngZone.run(() => {

                  const screen =
                    screens.find(
                      s =>
                        Number(
                          s.screenId ??
                          s.id ??
                          s.screen_id
                        ) === screenId
                    );


                  if (screen) {

                    this.demandTotalSeats =
                      Number(
                        screen.totalSeats ??
                        screen.total_seats ??
                        screen.capacity ??
                        screen.seatCount ??
                        screen.seat_count ??
                        0
                      );

                  }


                  this.calculateHoursUntilShow();

                  this.loadDemandBookingCount(
                    this.demandShowId
                  );

                  this.cdr.markForCheck();
                  this.cdr.detectChanges();

                });

              },

              error: (error) => {

                console.error(
                  'Screen database error:',
                  error
                );

                this.loadDemandBookingCount(
                  this.demandShowId
                );

              }

            });

          } else {

            this.calculateHoursUntilShow();

            this.loadDemandBookingCount(
              this.demandShowId
            );

          }


          this.cdr.markForCheck();
          this.cdr.detectChanges();

        });

      },


      error: (error) => {

        console.error(
          'Show database error:',
          error
        );

        this.ngZone.run(() => {

          this.demandError =
            'Unable to load shows from the SmartTix database.';

          this.cdr.markForCheck();
          this.cdr.detectChanges();

        });

      }

    });

  }


  // =========================================================
  // DEMAND BOOKING COUNT
  // =========================================================

  loadDemandBookingCount(
    showId: number
  ): void {

    this.http.get<any[]>(
      `${this.apiUrl}/bookings`
    ).subscribe({

      next: (bookings) => {

        this.ngZone.run(() => {

          const showBookings =
            (bookings || []).filter(
              booking =>
                Number(
                  booking.showId ??
                  booking.show_id
                ) === Number(showId) &&
                String(
                  booking.status
                ).toUpperCase() === 'CONFIRMED'
            );


          this.demandCurrentBookings =
            showBookings.reduce(
              (total, booking) => {

                const seats =
                  Array.isArray(
                    booking.seatIds
                  )
                    ? booking.seatIds.length
                    : Array.isArray(
                        booking.seat_ids
                      )
                        ? booking.seat_ids.length
                        : 1;

                return total + seats;

              },
              0
            );


          console.log(
            'Demand database values:',
            {
              showId:
                this.demandShowId,

              totalSeats:
                this.demandTotalSeats,

              currentBookings:
                this.demandCurrentBookings,

              movie:
                this.demandMovieTitle
            }
          );


          this.cdr.markForCheck();
          this.cdr.detectChanges();

        });

      },


      error: (error) => {

        console.error(
          'Booking database error:',
          error
        );

        this.ngZone.run(() => {

          this.demandCurrentBookings = 0;

          this.cdr.markForCheck();
          this.cdr.detectChanges();

        });

      }

    });

  }


  // =========================================================
  // CALCULATE HOURS UNTIL SHOW
  // =========================================================

  calculateHoursUntilShow(): void {

    if (
      !this.demandShowDate ||
      !this.demandShowTime
    ) {

      this.demandHoursUntilShow = 24;

      return;
    }


    const showDateTime =
      new Date(
        `${this.demandShowDate}T${this.demandShowTime}`
      );


    const now =
      new Date();


    const difference =
      showDateTime.getTime() -
      now.getTime();


    this.demandHoursUntilShow =
      Math.max(
        0,
        Math.round(
          difference /
          (1000 * 60 * 60)
        )
      );

  }


  // =========================================================
  // PREDICT DEMAND
  // =========================================================

  predictDemand(): void {

  this.demandError = '';
  this.demandResult = null;

  const showId = Number(this.demandShowId);
  const totalSeats = Number(this.demandTotalSeats);
  const currentBookings = Number(this.demandCurrentBookings);
  const hoursUntilShow = Number(this.demandHoursUntilShow);

  // Validate Show ID
  if (!Number.isInteger(showId) || showId < 1) {

    this.ngZone.run(() => {

      this.demandError = 'Invalid show selected.';
      this.demandLoading = false;

      this.cdr.detectChanges();

    });

    return;
  }


  // Validate seat capacity
  if (!Number.isInteger(totalSeats) || totalSeats < 1) {

    this.ngZone.run(() => {

      this.demandError =
        'Seat capacity for this show could not be loaded from the database.';

      this.demandLoading = false;

      this.cdr.detectChanges();

    });

    return;
  }


  // Validate current bookings
  if (
    currentBookings < 0 ||
    currentBookings > totalSeats
  ) {

    this.ngZone.run(() => {

      this.demandError =
        'Current bookings must be between 0 and total seats.';

      this.demandLoading = false;

      this.cdr.detectChanges();

    });

    return;
  }


  // Validate hours
  if (hoursUntilShow < 0) {

    this.ngZone.run(() => {

      this.demandError =
        'Show time cannot be in the past.';

      this.demandLoading = false;

      this.cdr.detectChanges();

    });

    return;
  }


  // Start loading
  this.demandLoading = true;


  // Data sent to backend
  const requestData = {

    showId: showId,

    totalSeats: totalSeats,

    currentBookings: currentBookings,

    hoursUntilShow: hoursUntilShow

  };


  console.log(
    'Sending demand prediction request:',
    requestData
  );


  this.module4Service
    .predictDemand(requestData)
    .subscribe({

      // =====================================================
      // SUCCESS
      // =====================================================

      next: (response: any) => {

        console.log(
          'Demand prediction response:',
          response
        );


        this.ngZone.run(() => {

          /*
           * Get predicted occupancy from backend.
           *
           * Example:
           * 71% occupancy = HIGH
           * 45% occupancy = MEDIUM
           * 20% occupancy = LOW
           */

          const predictedOccupancy =
            Number(
              response?.predicted_occupancy_percentage ?? 0
            );


          /*
           * Keep occupancy between 0 and 100.
           */

          const safeOccupancy =
            Math.max(
              0,
              Math.min(
                100,
                predictedOccupancy
              )
            );


          /*
           * Determine demand level from
           * predicted occupancy.
           *
           * 0 - 29%   = LOW
           * 30 - 69%  = MEDIUM
           * 70 - 100% = HIGH
           */

          let demandLevel = 'LOW';


          if (safeOccupancy >= 70) {

            demandLevel = 'HIGH';

          } else if (safeOccupancy >= 30) {

            demandLevel = 'MEDIUM';

          } else {

            demandLevel = 'LOW';

          }


          /*
           * Calculate predicted bookings from
           * predicted occupancy if backend did
           * not provide a valid value.
           */

          let predictedBookings =
            Number(
              response?.predicted_total_bookings
            );


          if (
            !Number.isFinite(predictedBookings) ||
            predictedBookings < 0
          ) {

            predictedBookings =
              Math.round(
                (safeOccupancy / 100) *
                totalSeats
              );

          }


          /*
           * Keep predicted bookings within
           * the actual seat capacity.
           */

          predictedBookings =
            Math.max(
              0,
              Math.min(
                totalSeats,
                Math.round(predictedBookings)
              )
            );


          /*
           * Final result displayed in dashboard.
           */

          this.demandResult = {

            ...response,

            demand_level: demandLevel,

            predicted_total_bookings:
              predictedBookings,

            predicted_occupancy_percentage:
              safeOccupancy

          };


          this.demandLoading = false;


          console.log(
            'Final demand result:',
            this.demandResult
          );


          // Force Angular UI refresh
          this.cdr.markForCheck();
          this.cdr.detectChanges();


          setTimeout(() => {

            try {

              this.appRef.tick();

            } catch (e) {

              console.warn(
                'UI refresh warning:',
                e
              );

            }

          }, 0);

        });

      },


      // =====================================================
      // ERROR
      // =====================================================

      error: (error: any) => {

        console.error(
          'Demand prediction error:',
          error
        );


        this.ngZone.run(() => {

          this.demandLoading = false;


          this.demandError =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to predict crowd demand. Please try again.';


          this.demandResult = null;


          this.cdr.markForCheck();
          this.cdr.detectChanges();


          setTimeout(() => {

            try {

              this.appRef.tick();

            } catch (e) {

              console.warn(
                'UI refresh warning:',
                e
              );

            }

          }, 0);

        });

      }

    });

}


  // =========================================================
  // AI 3: FRAUD / BOOKING SECURITY
  // =========================================================

  detectFraud(): void {

  // Prevent duplicate requests
  if (this.fraudLoading) {
    return;
  }

  // Browser only
  if (!isPlatformBrowser(this.platformId)) {
    return;
  }


  // =====================================================
  // GET LOGGED-IN USER FROM SESSION
  // =====================================================

  const userId =
    Number(
      sessionStorage.getItem('userId')
    );


  if (
    !Number.isInteger(userId) ||
    userId < 1
  ) {

    this.ngZone.run(() => {

      this.fraudError =
        'Please log in again.';

      this.fraudResult = null;

      this.cdr.detectChanges();

    });

    return;
  }


  // =====================================================
  // USE REAL DATABASE BOOKINGS
  // =====================================================

  /*
   * this.bookings is loaded from:
   *
   * GET /api/bookings/user/{userId}
   *
   * Therefore all calculations below are based
   * on the real SmartTix database records.
   */

  const allUserBookings =
    [...this.bookings];


  // =====================================================
  // CONFIRMED BOOKINGS
  // =====================================================

  const confirmedBookings =
    allUserBookings
      .filter(
        booking =>
          String(
            booking.status || ''
          ).toUpperCase() === 'CONFIRMED'
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime()
          -
          new Date(
            a.createdAt
          ).getTime()
      );


  // No confirmed booking
  if (
    confirmedBookings.length === 0
  ) {

    this.ngZone.run(() => {

      this.fraudError =
        'You do not have a confirmed booking to analyze yet.';

      this.fraudResult = null;

      this.cdr.markForCheck();
      this.cdr.detectChanges();

    });

    return;
  }


  // =====================================================
  // LATEST REAL DATABASE BOOKING
  // =====================================================

  const latestBooking =
    confirmedBookings[0];


  const bookingId =
    Number(
      latestBooking.bookingId
    );


  const bookingAmount =
    Number(
      latestBooking.totalAmount || 0
    );


  this.fraudBookingId =
    bookingId;


  this.fraudBookingAmount =
    bookingAmount;


  this.fraudBookingMovie =
    latestBooking.movieTitle ||
    'SmartTix Movie';


  // =====================================================
  // TOTAL BOOKINGS FROM DATABASE
  // =====================================================

  const bookingFrequency =
    allUserBookings.length;


  // =====================================================
  // BOOKINGS MADE IN LAST 60 SECONDS
  // =====================================================

  const now =
    Date.now();


  const bookingsInLastMinute =
    allUserBookings.filter(
      booking => {

        const createdTime =
          new Date(
            booking.createdAt
          ).getTime();


        if (
          !Number.isFinite(
            createdTime
          )
        ) {
          return false;
        }


        const difference =
          now - createdTime;


        return (
          difference >= 0 &&
          difference <= 60 * 1000
        );

      }
    ).length;


  // =====================================================
  // FAILED PAYMENT / FAILED BOOKING ATTEMPTS
  // =====================================================

  /*
   * Read failed statuses from the actual database
   * booking records.
   *
   * We do NOT invent a number.
   */

  const failedPaymentAttempts =
    allUserBookings.filter(
      booking => {

        const status =
          String(
            booking.status || ''
          )
          .trim()
          .toUpperCase()
          .replace(/[\s-]+/g, '_');


        const paymentStatus =
          String(
            (booking as any).paymentStatus || ''
          )
          .trim()
          .toUpperCase()
          .replace(/[\s-]+/g, '_');


        return (

          status === 'FAILED' ||

          status === 'PAYMENT_FAILED' ||

          status === 'FAILED_PAYMENT' ||

          paymentStatus === 'FAILED' ||

          paymentStatus === 'PAYMENT_FAILED' ||

          paymentStatus === 'FAILED_PAYMENT'

        );

      }
    ).length;


  // =====================================================
  // DATABASE INFORMATION LOG
  // =====================================================

  console.log(
    '===== SMARTTIX DATABASE SECURITY DATA =====',
    {
      userId,

      totalBookings:
        allUserBookings.length,

      confirmedBookings:
        confirmedBookings.length,

      latestBookingId:
        bookingId,

      latestBookingAmount:
        bookingAmount,

      latestMovie:
        this.fraudBookingMovie,

      bookingsInLastMinute,

      failedPaymentAttempts
    }
  );


  // =====================================================
  // START SECURITY CHECK
  // =====================================================

  this.ngZone.run(() => {

    this.fraudLoading = true;

    this.fraudError = '';

    this.fraudResult = null;

    this.cdr.markForCheck();
    this.cdr.detectChanges();

  });


  // =====================================================
  // SEND DATABASE-DERIVED DATA TO AI SERVICE
  // =====================================================

  this.module4Service
    .detectFraud({

      bookingId,

      userId,

      bookingAmount,

      bookingFrequency,

      bookingsInLastMinute,

      failedPaymentAttempts

    })
    .subscribe({

      // ===================================================
      // SUCCESS
      // ===================================================

      next: (response: any) => {

        console.log(
          'Fraud detection response:',
          response
        );


        this.ngZone.run(() => {

          this.fraudResult =
            response;


          this.fraudLoading =
            false;


          this.fraudError =
            '';


          this.cdr.markForCheck();
          this.cdr.detectChanges();


          // Extra UI refresh
          setTimeout(() => {

            try {

              this.appRef.tick();

            } catch (error) {

              console.warn(
                'Security UI refresh warning:',
                error
              );

            }

          }, 0);

        });

      },


      // ===================================================
      // ERROR
      // ===================================================

      error: (error: any) => {

        console.error(
          'Fraud detection error:',
          error
        );


        this.ngZone.run(() => {

          this.fraudLoading =
            false;


          this.fraudResult =
            null;


          if (
            error?.status === 0
          ) {

            this.fraudError =
              'Unable to connect to the SmartTix AI security service.';

          } else {

            this.fraudError =
              error?.error?.detail ||
              `Security check failed (HTTP ${error?.status}).`;

          }


          this.cdr.markForCheck();
          this.cdr.detectChanges();


          setTimeout(() => {

            try {

              this.appRef.tick();

            } catch (refreshError) {

              console.warn(
                'Security refresh warning:',
                refreshError
              );

            }

          }, 0);

        });

      }

    });

}

  // =========================================================
  // BOOKING CANCELLATION
  // =========================================================

  cancelBooking(
    bookingId: number
  ): void {

    const confirmed =
      window.confirm(
        'Are you sure you want to cancel this booking? Cancellation charges will apply.'
      );


    if (!confirmed) {
      return;
    }


    this.http.post<any>(
      `${this.apiUrl}/bookings/${bookingId}/cancel`,
      {}
    ).subscribe({

      next: (response) => {

        alert(
          `Booking cancelled successfully!\n` +
          `Cancellation penalty: ₹${response.cancellationPenalty}\n` +
          `Refund amount: ₹${response.refundAmount}`
        );

        this.loadBookings();

      },


      error: (error) => {

        console.error(
          'Booking cancellation error:',
          error
        );


        alert(
          error?.error?.message ||
          error?.error ||
          'Unable to cancel booking.'
        );

      }

    });

  }


  // =========================================================
  // LOGOUT
  // =========================================================

  logout(): void {

    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userPhone');

    this.router.navigate(['/']);

  }


  // =========================================================
  // PROFILE
  // =========================================================

  updateProfile(): void {

    const userId =
      sessionStorage.getItem('userId');


    if (!userId) {

      this.router.navigate(['/login']);

      return;
    }


    const profileData = {

      name:
        this.userName,

      phone:
        this.userPhone

    };


    this.http.put<any>(
      `${this.apiUrl}/auth/profile/${userId}`,
      profileData
    ).subscribe({

      next: (response) => {

        this.ngZone.run(() => {

          this.userName =
            response.name;

          this.userPhone =
            response.phone || '';


          sessionStorage.setItem(
            'userName',
            response.name
          );


          sessionStorage.setItem(
            'userPhone',
            response.phone || ''
          );


          this.profileMessage =
            'Profile updated successfully!';

          this.profileError = '';

          this.isEditingProfile =
            false;


          this.cdr.markForCheck();
          this.cdr.detectChanges();

        });

      },


      error: (error) => {

        console.error(
          'Profile update error:',
          error
        );


        this.ngZone.run(() => {

          this.profileError =
            error?.error ||
            'Unable to update profile.';

          this.profileMessage = '';

          this.cdr.markForCheck();
          this.cdr.detectChanges();

        });

      }

    });

  }

}