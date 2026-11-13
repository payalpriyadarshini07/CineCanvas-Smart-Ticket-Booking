\# 🎬 CineCanvas – Smart Ticket Booking Platform



CineCanvas is a full-stack smart ticket booking platform designed to provide a seamless movie discovery, seat booking, payment, and ticket management experience.



The project combines an \*\*Angular frontend\*\* with a \*\*Spring Boot backend\*\* and integrates database management, real-time seat locking, payment processing, and AI-powered services.



\---



\## 🚀 Project Overview



CineCanvas allows users to:



\- Browse available movies

\- View movie details and show timings

\- Select seats through an interactive seat layout

\- Lock seats during the booking process

\- Complete ticket bookings

\- Make online payments using Razorpay

\- Generate and manage booking tickets

\- Access personalized movie-related features

\- Use an admin dashboard for platform management



The system is designed using a modular full-stack architecture with separate frontend and backend applications.



\---



\## 🏗️ Architecture



```text

                    ┌──────────────────────┐

                    │      CineCanvas      │

                    │ Smart Ticket Booking │

                    └──────────┬───────────┘

                               │

                 ┌─────────────┴─────────────┐

                 │                           │

        ┌────────▼────────┐        ┌────────▼────────┐

        │ Angular 21      │        │ Spring Boot     │

        │ Frontend        │◄──────►│ Backend         │

        └────────┬────────┘        └────────┬────────┘

                 │                          │

                 │                 ┌────────▼────────┐

                 │                 │     MySQL        │

                 │                 │    Database      │

                 │                 └─────────────────┘

                 │

        ┌────────▼────────┐

        │ Redis / Memurai │

        │ Seat Locking    │

        └─────────────────┘

                 

        External Services:

        • Razorpay Payment Gateway

        • AI Services

        • Kafka Event Processing




