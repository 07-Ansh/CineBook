<p align="center">
  <img src=".github/assets/logo.png" alt="CineBook Banner" width="100%" />
</p>

<p align="center">
  <strong>Enterprise-grade movie ticket booking platform built with React 19, TypeScript, Node.js/Express, PostgreSQL, and Razorpay.</strong>
</p>

<p align="center">
  <a href="https://cinebook.ansh.one"><img src="https://img.shields.io/badge/Live%20Demo-cinebook.ansh.one-4F46E5?style=for-the-badge&logo=google-chrome&logoColor=white" /></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=00BAF2" />
</p>


---

## 🌟 Overview

**CineBook** is a full-stack cinema ticketing web application designed with high performance, security, and modern UX standards. It delivers an intuitive movie discovery experience, interactive multi-tier seat maps, temporary seat locking to prevent double bookings, end-to-end Razorpay payment verification, and an automated rolling show scheduler.

---

## 🚀 Key Features

### 🎟️ Customer Experience
- **Interactive Multi-Tier Seat Map**: Real-time seat layout across 5 seat categories (Normal, Executive, Premium, Premium XL, and Recliner) with tier-based pricing.
- **Temporary Seat Locking**: 5-minute optimistic locks when payment initiates to prevent concurrent double-booking race conditions.
- **Payment Gateway Integration**: Secure checkout powered by Razorpay with HMAC-SHA256 server-side signature validation.
- **Dynamic 3-Day Schedule**: Automatically rolling showtimes guaranteed for Today, Tomorrow, and Day After Tomorrow across 3 theater screens.
- **Token-Guarded Digital Tickets**: Booking receipts secured with unique UUID tokens, QR code validation, and one-click printable/PDF ticket views.
- **Seamless Authentication**: Google OAuth via Firebase with persistent session state and automated customer booking history lookup.

### 🛡️ Admin Dashboard & Security
- **Protected Management Routes**: Dual-layer authentication verifying Firebase ID Tokens cryptographically via Google X.509 certificates.
- **Catalog Management**: Full CRUD interface for movies, schedules, screens, and pricing.
- **Business Intelligence & Reports**: Real-time aggregated metrics for total bookings, revenue by movie, and occupancy rates.
- **Server-Side Price Recalculation**: Prevents client-side amount tampering during payment verification.

---

## 🏗️ Architecture & Tech Stack

```
                                  ┌─────────────────────────────┐
                                  │      Client Browser         │
                                  │  React 19 + TypeScript + SW │
                                  └──────────────┬──────────────┘
                                                 │
                                ┌────────────────┴────────────────┐
                                │                                 │
                     (Static Assets / SPA)             (REST API / JWT)
                                │                                 │
                                ▼                                 ▼
                     ┌─────────────────────┐          ┌───────────────────────┐
                     │   Firebase Hosting  │          │   Express / Node.js   │
                     │    (CDN / Edge)     │          │    (Render / Cloud)   │
                     └─────────────────────┘          └───────────┬───────────┘
                                                                  │
                                            ┌─────────────────────┼─────────────────────┐
                                            ▼                     ▼                     ▼
                                  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                                  │ Neon PostgreSQL  │  │  Razorpay API    │  │  Firebase Auth   │
                                  │ (Database / SQL) │  │(Payment Gateway) │  │  (Token Verify)  │
                                  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

| Layer | Technologies | Key Role |
|---|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Vite | Fast, responsive UI with PWA capability and client routing |
| **Backend** | Node.js, Express, TypeScript | RESTful API, concurrency control, scheduling service |
| **Database** | PostgreSQL (Neon DB), `pg` connection pool | Relational data, triggers for auto-seat generation, transactions |
| **Authentication** | Firebase Authentication | Google OAuth, secure identity tokens |
| **Payments** | Razorpay SDK | Order creation, webhook/signature verification, hold release |

---

## 🗂️ Project Structure

```
CineBook/
├── frontend/                     # React 19 + TypeScript SPA
│   ├── src/
│   │   ├── components/          # Reusable UI (SeatGrid, TicketDetail, Layout, etc.)
│   │   ├── context/             # AuthContext (Firebase auth state)
│   │   ├── pages/               # Views (Home, MovieDetails, SeatSelection, Admin...)
│   │   ├── services/            # API client and Firebase configuration
│   │   ├── types/               # TypeScript data definitions
│   │   └── utils/               # Formatting and date helpers
│   ├── public/                  # Static assets, posters, manifest, and service worker
│   └── vite.config.ts           # Vite build configuration
│
├── backend/                      # Node.js + Express REST API
│   ├── controllers/             # Request handlers (movies, shows, payments, bookings)
│   ├── db/                      # PostgreSQL connection pool
│   ├── middleware/              # Auth & JWT verification middleware
│   ├── routes/                  # Express route declarations
│   ├── services/                # Rolling show scheduler background service
│   └── server.ts                # Application entry point & cron scheduler
│
└── database/                     # Database migrations and seed scripts
    ├── schema.sql               # Schema definitions and triggers
    └── sample_data.sql          # Seed data
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: Local instance or cloud database (e.g. Neon, Supabase)
- **Firebase Project**: Configured for Google Authentication
- **Razorpay Account**: Test API keys

### 1. Clone the Repository

```bash
git clone https://github.com/07-Ansh/CineBook.git
cd CineBook
```

### 2. Configure Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/movie_booking
FIREBASE_PROJECT_ID=your-firebase-project-id
ADMIN_EMAIL=your-admin@example.com
RAZORPAY_KEY_ID=rzp_test_xxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Initialize Database Schema

```bash
psql -d movie_booking -f database/schema.sql
psql -d movie_booking -f database/sample_data.sql
```

### 4. Configure Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_ADMIN_EMAIL=your-admin@example.com
# Leave VITE_API_BASE_URL empty for local development proxying
```

### 5. Run Development Servers

```bash
# In backend/
npm run dev

# In frontend/ (new terminal)
npm run dev
```

Visit `http://localhost:5173` to explore CineBook.

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/api/movies` | Public | List all movies |
| `GET` | `/api/movies/:id` | Public | Retrieve details for a single movie |
| `POST` | `/api/movies` | 🔒 Admin | Add a new movie |
| `PUT` | `/api/movies/:id` | 🔒 Admin | Update movie details |
| `DELETE`| `/api/movies/:id` | 🔒 Admin | Delete a movie |
| `GET` | `/api/shows/movie/:movieId` | Public | List upcoming shows for a movie |
| `GET` | `/api/seats/show/:showId` | Public | Get live seat availability map |
| `POST` | `/api/payments/create-order` | Public | Initiate Razorpay order & lock seats |
| `POST` | `/api/payments/verify` | Public | Verify payment HMAC signature & confirm booking |
| `POST` | `/api/payments/release-hold` | Public | Release seat lock on cancellation |
| `GET` | `/api/bookings/:id?token=UUID` | Protected | Fetch token-verified booking receipt |
| `GET` | `/api/bookings/customer/:email`| Public | Fetch bookings for a customer email |
| `GET` | `/api/bookings` | 🔒 Admin | Fetch all bookings across the platform |
| `GET` | `/api/reports/total-bookings` | 🔒 Admin | Get aggregated revenue and booking analytics |

🔒 *Requires `Authorization: Bearer <Firebase_ID_Token>` matching `ADMIN_EMAIL`.*

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

Copyright © 2026 Ansh Sharma.

---

<p align="center">
  <img src=".github/assets/logo.png" height="32" alt="CineBook" />
  <br/>
  <sub>Built with React · Express · Firebase · PostgreSQL</sub>
</p>


