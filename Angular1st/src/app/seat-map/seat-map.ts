import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import {
  SeatService,
  SeatLockResponse,
  BookingResponse,
  PaymentResponse,
  RazorpayOrderResponse
} from '../services/seat.service';

import { Module4Service } from '../services/module4.service';

import { Seat } from './seat.model';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [],
  templateUrl: './seat-map.html',
  styleUrl: './seat-map.css'
})
export class SeatMap implements OnInit {
getSelectedSeatsTotal() {
throw new Error('Method not implemented.');
}
Number(arg0: number) {
throw new Error('Method not implemented.');
}

  private seatService = inject(SeatService);
  private route = inject(ActivatedRoute);
  private module4Service = inject(Module4Service);

  // IDs received from Module 2 through URL query parameters
  showId = 0;
  screenId = 0;
  userId = 1;

  // Seat information
 seats = signal<Seat[]>([]);

// Multiple seat selection
selectedSeats = signal<Seat[]>([]);
confirmedSeatNumbers = signal<string[]>([]);
lockTokens = signal<Map<number, string>>(new Map());

// Kept temporarily for existing payment/release code.
// We will update those methods in the next steps.
selectedSeat = signal<Seat | null>(null);
lockToken = signal<string | null>(null);

  // Loading states
  isLocking = signal(false);
  isCheckingOut = signal(false);

  // AI Pre-Booking Security
  isCheckingRisk = signal(false);
  riskResult = signal<any | null>(null);

  // Booking and payment
  booking = signal<BookingResponse | null>(null);
  payment = signal<PaymentResponse | null>(null);

  paymentOptionsOpen = signal(false);
  selectedPaymentMethod = signal<string | null>(null);

  // Payment methods
  paymentMethods = [
    { id: 'GOOGLE_PAY', name: 'Google Pay', icon: 'G' },
    { id: 'PHONEPE', name: 'PhonePe', icon: 'P' },
    { id: 'PAYTM', name: 'Paytm', icon: '₹' },
    { id: 'UPI', name: 'UPI', icon: '▦' },
    { id: 'CARD', name: 'Debit / Credit Card', icon: '▣' }
  ];

  message = signal('');

  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {

      this.showId = Number(params.get('showId'));
      this.screenId = Number(params.get('screenId'));

      this.userId = Number(params.get('userId')) || 1;

      if (this.showId <= 0 || this.screenId <= 0) {

        this.message.set(
          'Invalid show or screen ID.'
        );

        return;
      }

      this.loadSeats();

    });

  }

  // =====================================================
  // LOAD AVAILABLE SEATS
  // =====================================================

  loadSeats(): void {

    this.seatService
      .getAvailableSeats(this.screenId)
      .subscribe({

        next: (data: Seat[]) => {

          this.seats.set(data);

          this.message.set(
            `Loaded ${data.length} seats successfully.`
          );

        },

        error: (error) => {

          console.error(
            'Failed to load seats:',
            error
          );

          this.message.set(
            'Failed to load seats. Check backend connection.'
          );

        }

      });

  }

  // =====================================================
  // SELECT AND LOCK SEAT
  // =====================================================

  selectSeat(seat: Seat): void {

  if (
    seat.status !== 'AVAILABLE' ||
    this.isLocking() ||
    this.isCheckingOut()
  ) {
    return;
  }

  // -------------------------------------------------
  // If seat is already selected, release it
  // -------------------------------------------------

  const alreadySelected = this.selectedSeats()
    .some(selected => selected.seatId === seat.seatId);

  if (alreadySelected) {

    const token = this.lockTokens()
      .get(seat.seatId);

    if (!token) {
      return;
    }

    this.isLocking.set(true);

    this.message.set(
      `Releasing seat ${seat.seatNumber}...`
    );

    this.seatService
      .unlockSeat(
        this.showId,
        seat.seatId,
        token
      )
      .subscribe({

        next: (response: SeatLockResponse) => {

          this.isLocking.set(false);

          if (response.success) {

            // Remove seat
            this.selectedSeats.update(
              current =>
                current.filter(
                  selected =>
                    selected.seatId !== seat.seatId
                )
            );

            // Remove its token
            this.lockTokens.update(current => {

              const updated = new Map(current);

              updated.delete(seat.seatId);

              return updated;
            });

            // Update temporary single-seat values
            const remaining = this.selectedSeats();

            this.selectedSeat.set(
              remaining.length > 0
                ? remaining[remaining.length - 1]
                : null
            );

            const remainingToken =
              remaining.length > 0
                ? this.lockTokens().get(
                    remaining[remaining.length - 1].seatId
                  ) ?? null
                : null;

            this.lockToken.set(
              remainingToken
            );

            this.message.set(
              `${seat.seatNumber} released.`
            );

          } else {

            this.message.set(
              response.message ||
              `Unable to release ${seat.seatNumber}.`
            );

          }

        },

        error: (error) => {

          this.isLocking.set(false);

          console.error(
            'Seat unlock failed:',
            error
          );

          this.message.set(
            `Unable to release ${seat.seatNumber}.`
          );

        }

      });

    return;
  }

  // -------------------------------------------------
  // Lock a new seat
  // -------------------------------------------------

  this.isLocking.set(true);

  this.message.set(
    `Locking seat ${seat.seatNumber}...`
  );

  this.seatService
    .lockSeat(
      this.showId,
      seat.seatId
    )
    .subscribe({

      next: (response: SeatLockResponse) => {

        this.isLocking.set(false);

        if (
          response.success &&
          response.lockToken
        ) {

          // Add seat to selected list
          this.selectedSeats.update(
            current => [
              ...current,
              seat
            ]
          );

          // Store token against this seat
          this.lockTokens.update(current => {

            const updated = new Map(current);

            updated.set(
              seat.seatId,
              response.lockToken!
            );

            return updated;
          });

          // Update temporary single-seat values
          this.selectedSeat.set(seat);

          this.lockToken.set(
            response.lockToken
          );

          const count =
            this.selectedSeats().length;

          this.message.set(
            `${seat.seatNumber} selected. ${count} seat${count > 1 ? 's' : ''} selected.`
          );

        } else {

          this.message.set(
            response.message ||
            'Unable to lock seat.'
          );

        }

      },

      error: (error) => {

        this.isLocking.set(false);

        console.error(
          'Seat lock failed:',
          error
        );

        this.message.set(
          `Unable to lock seat ${seat.seatNumber}.`
        );

      }

    });
}

  // =====================================================
  // AI PRE-BOOKING SECURITY CHECK
  // =====================================================


checkPreBookingRisk(): void {

  const selectedSeats = this.selectedSeats();

  if (selectedSeats.length === 0) {

    this.message.set(
      'Select and lock at least one seat first.'
    );

    return;
  }

  if (this.isCheckingRisk()) {
    return;
  }

  this.isCheckingRisk.set(true);

  this.message.set(
    'AI is checking your booking security...'
  );

  // Number of seats selected
  const seatsRequested = selectedSeats.length;

  // Total seats currently loaded for this screen
  const totalSeats = this.seats().length;

  // Count currently available seats
  const availableSeats = this.seats().filter(
    s => s.status === 'AVAILABLE'
  ).length;

  // Approximate currently booked/occupied seats
  const currentBookings = Math.max(
    0,
    totalSeats - availableSeats
  );

  // Calculate total booking amount
  const bookingAmount = selectedSeats.reduce(
    (total, seat) => {

      const price = Number(
        (seat as any).price ??
        (seat as any).seatPrice ??
        0
      );

      return total + price;
    },
    0
  );

  /*
   * The current seat-map does not have show timing.
   *
   * For now use a safe baseline of 24 hours.
   * We can connect the actual show time later.
   */
  const hoursUntilShow = 24;

  const request = {
    showId: this.showId,
    totalSeats: totalSeats,
    currentBookings: currentBookings,
    hoursUntilShow: hoursUntilShow,
    bookingAmount: bookingAmount,
    seatsRequested: seatsRequested
  };

  console.log(
    'Pre-booking AI request:',
    request
  );

  this.module4Service
    .checkPreBookingRisk(request)
    .subscribe({

      next: (result) => {

        console.log(
          'Pre-booking AI result:',
          result
        );

        this.riskResult.set(result);

        this.isCheckingRisk.set(false);

        this.message.set(
          result.message ||
          'Security check completed.'
        );

        /*
         * Once the AI check is complete,
         * open the payment options.
         */
        this.paymentOptionsOpen.set(true);

        this.selectedPaymentMethod.set(null);

      },

      error: (error) => {

        console.error(
          'Pre-booking AI risk check failed:',
          error
        );

        this.isCheckingRisk.set(false);

        this.message.set(
          'Unable to complete the security check. Please try again.'
        );

      }

    });

}


  // =====================================================
  // OPEN PAYMENT OPTIONS
  // =====================================================

  openPaymentOptions(): void {

    if (
      !this.selectedSeat() ||
      !this.lockToken()
    ) {

      this.message.set(
        'Select and lock a seat first.'
      );

      return;
    }

    /*
     * If the risk check has already completed,
     * directly open payment options.
     */
    if (this.riskResult()) {

      this.paymentOptionsOpen.set(true);

      this.selectedPaymentMethod.set(null);

      this.message.set(
        'Choose your payment method.'
      );

      return;
    }

    /*
     * Otherwise run AI security check first.
     */
    this.checkPreBookingRisk();

  }

  // =====================================================
  // SELECT PAYMENT METHOD
  // =====================================================

  choosePaymentMethod(method: string): void {

    this.selectedPaymentMethod.set(method);

    this.message.set(
      `${method.replace('_', ' ')} selected.`
    );

  }

  // =====================================================
  // CLOSE PAYMENT OPTIONS
  // =====================================================

  closePaymentOptions(): void {

    this.paymentOptionsOpen.set(false);

    this.selectedPaymentMethod.set(null);

  }

  // =====================================================
  // CHECKOUT
  // =====================================================

  checkout(): void {

    const method = this.selectedPaymentMethod();

    if (!method) {

      this.message.set(
        'Please select your payment method.'
      );

      return;
    }

    if (this.isCheckingOut()) {
      return;
    }

    this.paymentOptionsOpen.set(false);

    this.processBookingAndPayment();

  }

  // =====================================================
  // CREATE BOOKING AND PAYMENT ORDER
  // =====================================================

private processBookingAndPayment(): void {

  const selectedSeats = this.selectedSeats();

  const tokenMap = this.lockTokens();

  const method = this.selectedPaymentMethod();

  // -------------------------------------------------
  // Validate selected seats
  // -------------------------------------------------

  if (selectedSeats.length === 0) {

    this.message.set(
      'Please select and lock at least one seat.'
    );

    return;
  }

  if (!method) {

    this.message.set(
      'Seat selection or payment method is missing.'
    );

    return;
  }

  // -------------------------------------------------
  // Build lock token list in the SAME ORDER
  // as the selected seat list
  // -------------------------------------------------

  const seatIds = selectedSeats.map(
    seat => seat.seatId
  );

  const lockTokens = selectedSeats.map(
    seat => tokenMap.get(seat.seatId)
  );

  // Make sure every seat has a token
  if (
    lockTokens.some(
      token => !token
    )
  ) {

    this.message.set(
      'One or more seat locks are missing or expired.'
    );

    return;
  }

  /*
   * Extra safety:
   * Do not allow booking if AI check
   * has not completed.
   */
  if (!this.riskResult()) {

    this.message.set(
      'Please complete the booking security check first.'
    );

    return;
  }

  this.isCheckingOut.set(true);

  this.message.set(
    'Creating booking...'
  );

  // ===================================================
  // STEP 1: CREATE MULTI-SEAT BOOKING
  // ===================================================

  this.seatService
    .createBooking(
      this.userId,
      this.showId,
      seatIds,
      lockTokens as string[]
    )
    .subscribe({

      next: (booking: BookingResponse) => {

        this.booking.set(booking);
        this.confirmedSeatNumbers.set(
  selectedSeats.map(seat => seat.seatNumber)
);

        /*
         * Backend releases all Redis locks
         * after successful booking creation.
         *
         * Clear frontend lock state as well.
         */
        this.lockTokens.set(
          new Map()
        );

        this.selectedSeats.set([]);

        this.selectedSeat.set(null);
        this.lockToken.set(null);

        this.message.set(
          'Creating secure Razorpay order...'
        );

        // =============================================
        // STEP 2: CREATE RAZORPAY ORDER
        // =============================================

        this.seatService
          .createRazorpayOrder(
            booking.bookingId,
            method
          )
          .subscribe({

            next: (
              order: RazorpayOrderResponse
            ) => {

              this.openRazorpayCheckout(
                order
              );

            },

            error: (error) => {

              console.error(
                'Razorpay order creation failed:',
                error
              );

              this.isCheckingOut.set(false);

              this.message.set(
                error.error?.message ||
                'Unable to create payment order.'
              );

            }

          });

      },

      error: (error) => {

        this.isCheckingOut.set(false);

        console.error(
          'Booking creation failed:',
          error
        );

        this.message.set(
          error.error?.message ||
          'Unable to create booking.'
        );

      }

    });

}
  // =====================================================
  // OPEN RAZORPAY CHECKOUT
  // =====================================================

  private openRazorpayCheckout(
    order: RazorpayOrderResponse
  ): void {

    if (typeof Razorpay === 'undefined') {

      this.isCheckingOut.set(false);

      this.message.set(
        'Razorpay Checkout script is not loaded.'
      );

      return;
    }

    const options = {

      key: order.keyId,

      amount: order.amount,

      currency: order.currency,

      name: 'Smart Ticket Booking',

      description: 'Movie ticket booking',

      order_id: order.orderId,

      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {

        this.message.set(
          'Verifying payment securely...'
        );

        // =============================================
        // STEP 3: VERIFY PAYMENT
        // =============================================

        this.seatService
          .verifyRazorpayPayment({

            bookingId:
              order.bookingId,

            razorpayOrderId:
              response.razorpay_order_id,

            razorpayPaymentId:
              response.razorpay_payment_id,

            razorpaySignature:
              response.razorpay_signature

          })
          .subscribe({

            next: (
              payment: PaymentResponse
            ) => {

              this.payment.set(payment);

              if (
                payment.status === 'SUCCESS'
              ) {

                this.refreshBooking(
                  order.bookingId
                );

              } else {

                this.isCheckingOut.set(false);

                this.message.set(
                  'Payment has not been confirmed.'
                );

              }

            },

            error: (error) => {

              console.error(
                'Payment verification failed:',
                error
              );

              this.isCheckingOut.set(false);

              this.message.set(
                'Payment verification failed. Please check your booking status.'
              );

            }

          });

      },

      modal: {

        ondismiss: () => {

          this.isCheckingOut.set(false);

          this.message.set(
            'Payment window closed. Check booking status before retrying.'
          );

        }

      },

      theme: {
        color: '#7c3aed'
      }

    };

    try {

      const razorpay =
        new Razorpay(options);

      razorpay.open();

    } catch (error) {

      console.error(
        'Unable to open Razorpay Checkout:',
        error
      );

      this.isCheckingOut.set(false);

      this.message.set(
        'Unable to open payment window.'
      );

    }

  }

  // =====================================================
  // REFRESH BOOKING AFTER PAYMENT
  // =====================================================

  private refreshBooking(
    bookingId: number
  ): void {

    this.seatService
      .getBooking(bookingId)
      .subscribe({

        next: (
          updatedBooking: BookingResponse
        ) => {

          this.booking.set(
            updatedBooking
          );

          this.isCheckingOut.set(false);

          if (
            updatedBooking.status ===
            'CONFIRMED'
          ) {

            this.message.set(
              'Payment successful! Booking confirmed.'
            );

          } else {

            this.message.set(
              `Payment received, but booking status is ${updatedBooking.status}.`
            );

          }

          this.loadSeats();

        },

        error: (error) => {

          this.isCheckingOut.set(false);

          console.error(
            'Failed to refresh booking:',
            error
          );

          this.message.set(
            'Payment verified, but booking details could not be refreshed.'
          );

        }

      });

  }

  // =====================================================
  // RELEASE SEAT
  // =====================================================

  releaseSeat(): void {

    const seat = this.selectedSeat();

    const token = this.lockToken();

    if (
      !seat ||
      !token ||
      this.isCheckingOut()
    ) {
      return;
    }

    this.seatService
      .unlockSeat(
        this.showId,
        seat.seatId,
        token
      )
      .subscribe({

        next: (
          response: SeatLockResponse
        ) => {

          if (response.success) {

            this.selectedSeat.set(null);

            this.lockToken.set(null);

            this.riskResult.set(null);

            this.message.set(
              'Seat released successfully.'
            );

            this.loadSeats();

          } else {

            this.message.set(
              response.message
            );

          }

        },

        error: (error) => {

          console.error(
            'Seat unlock failed:',
            error
          );

          this.message.set(
            'Unable to release seat.'
          );

        }

      });

  }

  // =====================================================
  // START ANOTHER BOOKING
  // =====================================================

  startAnotherBooking(): void {

    this.selectedSeat.set(null);

    this.lockToken.set(null);

    this.booking.set(null);

    this.payment.set(null);

    this.riskResult.set(null);

    this.paymentOptionsOpen.set(false);

    this.selectedPaymentMethod.set(null);

    this.message.set(
      'Select a seat to begin another booking.'
    );

    this.loadSeats();

  }

}