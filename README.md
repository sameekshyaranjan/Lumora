<p align="center">
  <h1 align="center">Lumora</h1>
  <p align="center">
    A full-stack short-video learning platform with a TikTok-style vertical feed,<br/>
    built with React, Redux Toolkit, Node.js, Express, and PostgreSQL.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/react-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/express-5-lightgrey?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/postgresql-16-blue?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
  - [System Design](#system-design)
  - [Backend Architecture](#backend-architecture)
  - [Frontend Architecture](#frontend-architecture)
  - [Database Schema](#database-schema)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Launch](#4-launch)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Technical Deep Dives](#technical-deep-dives)
  - [Authentication Flow](#authentication-flow)
  - [Optimistic UI Updates](#optimistic-ui-updates)
  - [Cursor-Based Pagination](#cursor-based-pagination)
  - [Silent Token Refresh](#silent-token-refresh)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

**Lumora** is a production-grade micro-learning platform that delivers educational video content through an engaging, mobile-first vertical feed — inspired by the user experience of Instagram Reels and YouTube Shorts.

The platform demonstrates modern full-stack engineering patterns including stateless JWT authentication with silent refresh, optimistic UI updates with rollback, cursor-based infinite scrolling, and a strictly layered backend architecture.

---

## Key Features

| Feature | Description |
|---|---|
| **Vertical Video Feed** | Full-screen, snap-scrolling video feed with `IntersectionObserver`-driven autoplay. Only the visible video plays; all others are paused. |
| **Optimistic Like & Bookmark** | UI updates instantly on interaction. If the network request fails, state rolls back seamlessly — the user never sees a loading spinner. |
| **Animated Comment Sheet** | A `framer-motion`-powered bottom sheet with drag-to-dismiss. Handles loading, empty, posting, and error states independently. |
| **Silent Token Refresh** | Axios interceptors detect expired access tokens, refresh them in the background via HTTP-only cookies, and replay the original request — users are never logged out unexpectedly. |
| **Cursor Pagination** | Keyset-based pagination (`created_at DESC, id DESC`) eliminates duplicate entries during infinite scroll, even when new content is added concurrently. |
| **Category Filtering** | Dynamic category tabs derived from the video catalog. Switching categories resets the feed and cursor for a clean filtered view. |
| **Watch History & Progress** | Client-side `localStorage` persistence tracks watched videos and marks them as "Completed" when 90% of the video duration has been watched. |
| **Saved Learning** | Server-backed bookmarks list with composite primary key deduplication at the database level. |
| **Security Hardened** | Helmet CSP headers, rate limiting, bcrypt password hashing, HTTP-only cookies, and `X-Powered-By` disabled. |

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│  React 19 · Redux Toolkit · Axios · Framer Motion       │
│  Port 5173                                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────┐   ┌──────────────┐   ┌────────────────┐  │
│   │  Pages  │──▶│  Components  │──▶│  Custom Hooks  │  │
│   └─────────┘   └──────────────┘   └────────────────┘  │
│        │                                    │           │
│        ▼                                    ▼           │
│   ┌─────────┐                     ┌─────────────────┐  │
│   │  Redux  │◀────────────────────│  API Client     │  │
│   │  Store  │   (token-refreshed  │  (Axios +       │  │
│   │         │    custom event)    │   Interceptors) │  │
│   └─────────┘                     └────────┬────────┘  │
│                                            │           │
└────────────────────────────────────────────┼───────────┘
                                             │ HTTPS
                                             ▼
┌─────────────────────────────────────────────────────────┐
│                       Server                            │
│  Express 5 · Helmet · CORS · Rate Limiting              │
│  Port 5000                                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────┐   ┌──────────────┐   ┌───────────────┐  │
│   │  Routes  │──▶│ Controllers  │──▶│   Services    │  │
│   │(validate)│   │ (HTTP logic) │   │(business logic│  │
│   └──────────┘   └──────────────┘   │  + DB queries)│  │
│                                     └───────┬───────┘  │
│                                             │          │
│                                             ▼          │
│                                     ┌───────────────┐  │
│                                     │  PostgreSQL   │  │
│                                     │  (Supabase)   │  │
│                                     └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture

The backend enforces a **strict three-layer separation** — no business logic exists in routes, and no HTTP concepts (`req`, `res`) leak into services:

| Layer | Responsibility | Example |
|---|---|---|
| **Routes** | Input validation via `express-validator`, rate limiting, auth middleware | `auth.routes.js` |
| **Controllers** | Extract params/body, call service, send HTTP response | `auth.controller.js` |
| **Services** | Core business logic, database queries, transaction management | `auth.service.js` |

### Frontend Architecture

| Layer | Responsibility |
|---|---|
| **Pages** | Route-level components (`FeedPage`, `LoginPage`, `BookmarksPage`, `HistoryPage`) |
| **Components** | Reusable UI (`VideoCard`, `VideoPlayer`, `VideoOverlay`, `CommentSheet`, `CategoryTabs`) |
| **Hooks** | Encapsulated logic (`useInfiniteFeed`, `useWatchHistory`) |
| **Redux** | Global auth state with `createAsyncThunk` for login/register/bootstrap |
| **API** | Centralized Axios client with request/response interceptors for token management |

### Database Schema

```sql
users          videos              likes                comments           bookmarks
─────          ──────              ─────                ────────           ─────────
id (PK)        id (PK)             user_id (FK) ──┐     id (PK)           user_id (FK) ──┐
email (UQ)     title               video_id (FK)──┤     user_id (FK)      video_id (FK)──┤
password_hash  description         created_at     │     video_id (FK)     created_at     │
name           category            ───────────────┘     content            ───────────────┘
created_at     file_path           PK(user_id,          created_at         PK(user_id,
               like_count              video_id)                               video_id)
               created_at
```

**Key design decisions:**
- **Composite primary keys** on `likes` and `bookmarks` enforce deduplication at the database level — no application-level checks needed.
- **Atomic like operations** wrap the `INSERT INTO likes` and `UPDATE videos SET like_count` in a single transaction to prevent count drift.
- **Keyset index** (`idx_videos_created_at_id`) on `(created_at DESC, id DESC)` powers efficient cursor pagination without full-table scans.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 18+** | Runtime |
| **Express 5** | HTTP framework |
| **PostgreSQL** | Relational database (Supabase-hosted) |
| **jsonwebtoken** | JWT signing and verification |
| **bcrypt** | Password hashing (cost factor 12) |
| **helmet** | Security headers and CSP |
| **express-rate-limit** | Brute-force protection |
| **express-validator** | Request body/param validation |
| **jest + supertest** | Integration testing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 8** | Build tool and dev server |
| **Redux Toolkit** | Global state management |
| **Axios** | HTTP client with interceptors |
| **Framer Motion** | Animation (comment sheet, button interactions) |
| **React Router 7** | Client-side routing |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **PostgreSQL** database (local install, [Neon](https://neon.tech), or [Supabase](https://supabase.com))
- Three short `.mp4` video files for the demo content

### 1. Clone the Repository

```bash
git clone https://github.com/sameekshyaranjan/Lumora.git
cd Lumora
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create your environment file
cp .env.example .env
```

Open `.env` and configure:

```env
DATABASE_URL=postgres://your_user:your_password@your_host/your_db?sslmode=require
JWT_SECRET=<generate-a-64-char-random-string>
REFRESH_TOKEN_SECRET=<generate-a-different-64-char-random-string>
```

> **Tip:** Generate secure secrets with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

**Place video assets** in the `backend/uploads/` directory:

```
backend/uploads/
├── intro-to-systems.mp4
├── data-structures-101.mp4
└── networking-basics.mp4
```

> File names must match exactly — they are referenced by the database seeder.

**Initialize the database:**

```bash
npm run migrate   # Creates tables, indexes, and constraints
npm run seed      # Inserts demo user + 3 video records
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Point the frontend at the backend
echo "VITE_API_URL=http://localhost:5000" > .env
```

### 4. Launch

Open **two terminal windows**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev                  # → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev                  # → http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Demo credentials:**
| Field | Value |
|---|---|
| Email | `demo@lumora.dev` |
| Password | `password123` |

---

## API Reference

All responses follow the envelope: `{ success: boolean, data: object, message: string }`

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create a new account |
| `POST` | `/auth/login` | — | Log in, receive access token + refresh cookie |
| `GET` | `/auth/me` | Bearer | Get current user profile |
| `POST` | `/auth/refresh` | Cookie | Exchange refresh cookie for new access token |
| `POST` | `/auth/logout` | Cookie | Clear the refresh cookie |

### Videos

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/videos?limit=5&cursor=<id>&category=<cat>` | — | Paginated video feed |
| `GET` | `/videos/:id` | — | Single video details |
| `POST` | `/videos/:id/like` | Bearer | Like a video (idempotent) |
| `DELETE` | `/videos/:id/like` | Bearer | Unlike a video |
| `POST` | `/videos/:id/bookmark` | Bearer | Bookmark a video (idempotent) |
| `DELETE` | `/videos/:id/bookmark` | Bearer | Remove bookmark |
| `POST` | `/videos/:id/comment` | Bearer | Post a comment |
| `GET` | `/videos/:id/comments` | — | List comments (newest first) |

### Bookmarks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/bookmarks` | Bearer | List user's saved videos |

---

## Project Structure

```
Lumora/
├── backend/
│   ├── db/
│   │   └── schema.sql               # DDL: tables, indexes, constraints
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # PostgreSQL connection pool
│   │   │   └── env.js                # Validated environment loader
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Register, login, refresh, me
│   │   │   └── video.controller.js   # Feed, like, comment, bookmark
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # JWT verification guard
│   │   │   └── error.middleware.js    # Centralized error handler
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Auth endpoints + validation rules
│   │   │   ├── video.routes.js       # Video + engagement endpoints
│   │   │   └── bookmark.routes.js    # Bookmark listing
│   │   ├── services/
│   │   │   ├── auth.service.js       # Hashing, JWT signing, user lookup
│   │   │   ├── video.service.js      # Feed query, cursor pagination
│   │   │   └── engagement.service.js # Likes, comments, bookmarks (transactions)
│   │   ├── utils/
│   │   │   ├── migrate.js            # Runs schema.sql against the DB
│   │   │   └── seed.js               # Inserts demo data
│   │   ├── app.js                    # Express app factory
│   │   └── server.js                 # Startup entrypoint
│   ├── uploads/                      # Static video files (gitignored)
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js             # Axios instance + interceptors
│   │   │   └── endpoints.js          # Typed API methods
│   │   ├── components/
│   │   │   ├── CategoryTabs.jsx      # Dynamic category filter bar
│   │   │   ├── CommentSheet.jsx      # Animated bottom sheet
│   │   │   ├── ContinueWatchingRow.jsx # "Resume" horizontal strip
│   │   │   ├── FeedSkeleton.jsx      # Full-screen shimmer loader
│   │   │   ├── ProtectedRoute.jsx    # Auth gate for private routes
│   │   │   ├── VideoCard.jsx         # Single feed card (observer + player)
│   │   │   ├── VideoOverlay.jsx      # Like, bookmark, comment buttons
│   │   │   └── VideoPlayer.jsx       # Video element with state machine
│   │   ├── hooks/
│   │   │   ├── useInfiniteFeed.js    # Cursor pagination + category reset
│   │   │   └── useWatchHistory.js    # localStorage persistence
│   │   ├── pages/
│   │   │   ├── BookmarksPage.jsx     # Saved Learning (server-backed)
│   │   │   ├── FeedPage.jsx          # Main vertical feed
│   │   │   ├── HistoryPage.jsx       # Watch history with badges
│   │   │   ├── LoginPage.jsx         # Authentication
│   │   │   └── RegisterPage.jsx      # Registration
│   │   ├── redux/
│   │   │   ├── authSlice.js          # Auth state + async thunks
│   │   │   └── store.js              # Redux store configuration
│   │   ├── App.jsx                   # Root router
│   │   ├── main.jsx                  # React DOM entry
│   │   └── index.css                 # Global styles
│   ├── .gitignore
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Technical Deep Dives

### Authentication Flow

Lumora implements a **dual-token stateless authentication** strategy:

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │    DB    │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │  POST /auth/login  │                    │
     │───────────────────▶│  Verify password   │
     │                    │───────────────────▶│
     │                    │◀───────────────────│
     │                    │                    │
     │  200 + accessToken │                    │
     │  Set-Cookie:       │                    │
     │  refresh_token     │                    │
     │  (HttpOnly)        │                    │
     │◀───────────────────│                    │
     │                    │                    │
     │  GET /videos       │                    │
     │  Authorization:    │                    │
     │  Bearer <token>    │                    │
     │───────────────────▶│  Verify JWT        │
     │                    │───────────────────▶│
     │  200 + data        │                    │
     │◀───────────────────│                    │
```

- **Access token** (15 min TTL): Stored exclusively in JavaScript memory — never touches `localStorage` or `sessionStorage`, eliminating XSS token theft.
- **Refresh token** (7 day TTL): Delivered via an `HttpOnly`, `Path=/auth` cookie — invisible to client-side JavaScript and scoped only to refresh endpoints.

### Optimistic UI Updates

The Like button demonstrates the optimistic update pattern with automatic rollback:

```
User clicks "Like"
       │
       ▼
┌─────────────────────┐
│ 1. Save prev state  │  prevLiked = false, prevCount = 5
│ 2. Update UI now    │  liked = true, count = 6
│ 3. Fire API call    │  POST /videos/:id/like
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
 Success      Failure
    │           │
    ▼           ▼
 Reconcile   Rollback
 count from  liked = false
 server      count = 5
```

The user perceives instant feedback. Network latency becomes invisible.

### Cursor-Based Pagination

Unlike traditional `LIMIT/OFFSET` pagination (which can produce duplicates or skip records when new rows are inserted), Lumora uses **keyset pagination**:

```sql
-- First page
SELECT * FROM videos
ORDER BY created_at DESC, id DESC
LIMIT 6;  -- fetch limit+1 to detect hasMore

-- Subsequent pages (cursor = last item's id)
SELECT * FROM videos
WHERE (created_at, id) < (anchor.created_at, anchor.id)
ORDER BY created_at DESC, id DESC
LIMIT 6;
```

This guarantees:
- **No duplicate entries** across pages
- **No skipped records** when new videos are added mid-scroll
- **O(log n) performance** via the `idx_videos_created_at_id` composite index

### Silent Token Refresh

When an access token expires mid-session, the Axios response interceptor transparently handles renewal:

```
Request A → 401 (token expired)
       │
       ▼
Interceptor catches 401
       │
       ├─── Is /auth/refresh URL? → Skip (prevent loop)
       ├─── Already retried? → Skip (prevent loop)
       │
       ▼
POST /auth/refresh (sends HttpOnly cookie)
       │
       ▼
New access token received
       │
       ├─── Update in-memory token
       ├─── Dispatch 'token-refreshed' event → Redux syncs
       ├─── Replay original Request A with new token
       │
       ▼
Request A → 200 ✓ (user never noticed)
```

Concurrent 401s are deduplicated — only one refresh request fires, and all waiting requests are replayed with the new token.

---

## Testing

The backend includes integration tests covering authentication and engagement flows:

```bash
cd backend
npm test
```

Tests verify:
- User registration and login (input validation, duplicate detection, token issuance)
- Protected route access (valid token, expired token, missing token)
- Like idempotency and atomic count operations
- Bookmark deduplication via composite primary keys
- Comment creation and listing order

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Server listen port |
| `NODE_ENV` | No | `development` | Environment mode |
| `FRONTEND_ORIGIN` | No | `http://localhost:5173` | CORS allowed origin |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `TEST_DATABASE_URL` | No | — | Separate DB for test suite |
| `JWT_SECRET` | **Yes** | — | Access token signing secret |
| `REFRESH_TOKEN_SECRET` | **Yes** | — | Refresh token signing secret |
| `ACCESS_TOKEN_TTL` | No | `15m` | Access token expiry |
| `REFRESH_TOKEN_TTL` | No | `7d` | Refresh token expiry |
| `REFRESH_COOKIE_PATH` | No | `/auth` | Cookie path scope |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | **Yes** | — | Backend base URL (`http://localhost:5000`) |

---

## License

This project is licensed under the [MIT License](LICENSE).
