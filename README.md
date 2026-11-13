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

&#x20;                   ┌──────────────────────┐

&#x20;                   │      CineCanvas      │

&#x20;                   │ Smart Ticket Booking │

&#x20;                   └──────────┬───────────┘

&#x20;                              │

&#x20;                ┌─────────────┴─────────────┐

&#x20;                │                           │

&#x20;       ┌────────▼────────┐        ┌────────▼────────┐

&#x20;       │ Angular 21      │        │ Spring Boot     │

&#x20;       │ Frontend        │◄──────►│ Backend         │

&#x20;       └────────┬────────┘        └────────┬────────┘

&#x20;                │                          │

&#x20;                │                 ┌────────▼────────┐

&#x20;                │                 │     MySQL        │

&#x20;                │                 │    Database      │

&#x20;                │                 └─────────────────┘

&#x20;                │

&#x20;       ┌────────▼────────┐

&#x20;       │ Redis / Memurai │

&#x20;       │ Seat Locking    │

&#x20;       └─────────────────┘

&#x20;                

&#x20;       External Services:

&#x20;       • Razorpay Payment Gateway

&#x20;       • AI Services

&#x20;       • Kafka Event Processing



