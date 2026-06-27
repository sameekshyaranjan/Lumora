<p align="center">
  <img src="frontend/src/assets/hero.png" alt="Lumora Banner" width="600"/>
</p>

<h1 align="center">Lumora</h1>

<p align="center">
  <strong>A production-grade micro-learning platform powered by a TikTok-style vertical video feed.</strong><br/>
  Built for speed, designed for delight, engineered for scale.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge" alt="React 19"/>
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white&style=for-the-badge" alt="Node.js"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=for-the-badge" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux&logoColor=white&style=for-the-badge" alt="Redux Toolkit"/>
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?logo=framer&logoColor=white&style=for-the-badge" alt="Framer Motion"/>
  <img src="https://img.shields.io/badge/HLS.js-Streaming-E62117?logoColor=white&style=for-the-badge" alt="HLS.js"/>
  <img src="https://img.shields.io/badge/AI_Quizzes-Google_Gemini-4285F4?logo=google&logoColor=white&style=for-the-badge" alt="Google Gemini"/>
</p>

---

## 🎬 Overview

**Lumora** is a full-stack, production-ready micro-learning platform that transforms how people consume educational content. Inspired by the addictive scroll-and-learn format of TikTok and Instagram Reels, Lumora delivers short-form video lessons through an immersive vertical feed.

The platform goes far beyond a simple CRUD app — it showcases deeply integrated engineering patterns that mirror what top companies ship to production: stateless JWT auth with silent refresh, optimistic UI updates with automatic rollback, cursor-based keyset pagination, HLS adaptive streaming, AI-generated quizzes, and a real-time animated comment system powered by Framer Motion.

---

## ✨ Feature Highlights

| Feature | Technical Detail |
|---|---|
| 🎥 **Vertical Video Feed** | Scroll-snapping, full-screen feed with `IntersectionObserver`-driven autoplay. Only the visible video plays; all others are paused to conserve bandwidth. |
| 🔄 **Silent Token Refresh** | Axios request interceptors detect `401` responses, transparently call `/auth/refresh` using an HTTP-only cookie, then replay the original request — users are **never** unexpectedly logged out. |
| 💬 **Animated Comment Sheet** | A `framer-motion` slide-up bottom sheet with spring physics, drag-to-dismiss, glassmorphism backdrop, and optimistic posting. No page navigation — the video stays in view. |
| ❤️ **Optimistic Like & Bookmark** | UI state updates instantly on click. If the network request fails, state rolls back seamlessly via Redux. Zero loading spinners — the user never waits. |
| 🤖 **AI-Generated Quizzes** | After finishing a video, Google Gemini generates a unique 5-question multiple-choice quiz. Correct answers award XP and advance the learner's streak. |
| 🔖 **Smart Video Bookmarks** | Bookmark a specific timestamp in any video. The dashboard shows all saved moments as deep links that seek the player directly to that exact second on click. |
| 📊 **Progress & XP System** | Server-tracked progress marks videos complete at 90% watch time. A learner's XP and day streak are displayed on the dashboard. |
| 📄 **Cursor-Based Pagination** | Keyset pagination on `(created_at DESC, id DESC)` eliminates duplicate entries during infinite scroll, even when new content is added concurrently. |
| 🛡️ **Security Hardened** | Helmet CSP headers, `express-rate-limit` on engagement endpoints, bcrypt (`rounds=12`) password hashing, HTTP-only refresh cookies, and `X-Powered-By` disabled. |
| 🎨 **Premium UI/UX** | Dark-mode-first design with glassmorphism overlays, micro-animations, gradient avatars, pill inputs with focus glow, and responsive layout for mobile & desktop. |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser (Client)                        │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────────┐  │
│  │    Pages     │──▶│  Components  │──▶│    Custom Hooks     │  │
│  │  (React 19)  │   │  (Reusable)  │   │  (IntersectionObs.) │  │
│  └──────────────┘   └──────────────┘   └─────────────────────┘  │
│          │                                         │              │
│          ▼                                         ▼              │
│  ┌──────────────┐                     ┌─────────────────────┐    │
│  │ Redux Store  │◀────────────────────│   Axios API Client  │    │
│  │  (Auth/UI)   │  (silent refresh    │  + Interceptors     │    │
│  └──────────────┘   via custom event) └──────────┬──────────┘    │
│                                                   │               │
└───────────────────────────────────────────────────┼───────────────┘
                                                    │ HTTP/REST
                                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                  Express 5 API Server  (Port 5000)                 │
│                                                                     │
│   Helmet · CORS · express-rate-limit · express-validator           │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Routes    │─▶│ Controllers  │─▶│   Services   │              │
│  │  (5 files)  │  │  (6 files)   │  │  (DB Queries)│              │
│  └─────────────┘  └──────────────┘  └──────┬───────┘              │
│                                            │                       │
└────────────────────────────────────────────┼───────────────────────┘
                                             │ pg / pool
                                             ▼
                               ┌─────────────────────────┐
                               │   PostgreSQL Database    │
                               │  (Supabase / Neon-ready) │
                               │   7 tables · 6 indexes   │
                               └─────────────────────────┘
```

### Backend Folder Structure

```
backend/
├── db/
│   └── schema.sql              # Full database schema (7 tables)
├── uploads/                    # HLS video segments (.gitignored)
│   └── hls/
│       └── <video_name>/
│           └── playlist.m3u8
└── src/
    ├── server.js               # Entry point
    ├── app.js                  # Express app setup, middleware chain
    ├── config/
    │   └── db.js               # pg Pool singleton
    ├── routes/
    │   ├── auth.routes.js
    │   ├── video.routes.js
    │   ├── bookmark.routes.js
    │   ├── progress.routes.js
    │   └── quiz.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── video.controller.js
    │   ├── engagement.controller.js
    │   ├── bookmark.controller.js
    │   ├── progress.controller.js
    │   └── quiz.controller.js
    ├── middlewares/
    │   ├── auth.middleware.js   # JWT verification
    │   ├── error.middleware.js  # Centralized error handler
    │   ├── rateLimit.middleware.js
    │   └── validate.middleware.js
    ├── services/
    │   └── token.service.js    # JWT sign/verify helpers
    └── utils/
        ├── seed.js             # Seeds demo user + transcodes HLS
        ├── migrate.js          # Applies schema.sql
        └── validators.js       # express-validator rule sets
```

### Frontend Folder Structure

```
frontend/
└── src/
    ├── main.jsx                # React + Redux + Router bootstrap
    ├── App.jsx                 # Route declarations + ProtectedRoute
    ├── index.css               # Design system (CSS variables, animations)
    ├── api/
    │   ├── client.js           # Axios instance + interceptors (silent refresh)
    │   └── endpoints.js        # Typed API surface (authApi, videoApi, ...)
    ├── redux/
    │   ├── store.js
    │   └── authSlice.js        # JWT state + thunks
    ├── hooks/
    │   ├── useIntersectionObserver.js
    │   └── useWatchHistory.js
    ├── components/
    │   ├── CommentSheet.jsx    # Framer Motion slide-up bottom sheet
    │   ├── Navbar.jsx
    │   ├── VideoPlayer.jsx     # HLS.js adaptive streaming wrapper
    │   ├── FeedSkeleton.jsx
    │   ├── CategoryTabs.jsx
    │   ├── ProtectedRoute.jsx
    │   └── Layout.jsx
    └── pages/
        ├── LandingPage.jsx
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── DashboardPage.jsx   # XP, streak, bookmarks, course grid
        └── CoursePlayerPage.jsx # Main feed: video, quiz, bookmarks
```

### Database Schema

```sql
-- Core entities
users               -- email, password_hash, name, xp, current_streak
videos              -- title, description, category, file_path, like_count

-- Engagement (composite PK prevents duplicates at the DB level)
likes               -- (user_id, video_id) PK
bookmarks           -- (user_id, video_id) PK
comments            -- id, video_id, user_id, content, created_at

-- Learning intelligence
user_progress       -- (user_id, video_id) PK, category, completed_at
timestamp_bookmarks -- id, user_id, video_id, timestamp_seconds, note
quizzes             -- video_id PK, question_data JSONB, created_at
```

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 5 |
| Database | PostgreSQL 16 (via `pg` / connection pooling) |
| Auth | JWT (`jsonwebtoken`) · bcrypt (`rounds=12`) · HTTP-only cookies |
| Validation | `express-validator` |
| Security | `helmet` · `express-rate-limit` · CORS |
| Video | FFmpeg (`fluent-ffmpeg`) for HLS transcoding |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Testing | Jest + Supertest |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| State Management | Redux Toolkit + React-Redux |
| Routing | React Router DOM v7 |
| HTTP Client | Axios (with interceptors for silent token refresh) |
| Animations | Framer Motion 12 |
| Video | HLS.js (adaptive bitrate streaming) |
| Build Tool | Vite 8 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 16 (or a free cloud instance: [Supabase](https://supabase.com) / [Neon](https://neon.tech))
- FFmpeg (auto-installed via `@ffmpeg-installer/ffmpeg`)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lumora.git
cd lumora
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/lumora

# Generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
REFRESH_COOKIE_PATH=/auth

# Optional: For AI quiz generation (falls back to static quiz if absent)
GEMINI_API_KEY=your_gemini_api_key_here
```

Apply the schema and seed demo data:

```bash
# Place your .mp4 source files into backend/uploads/ first, then:
npm run seed
```

> **Note:** The seed script auto-transcodes `.mp4` files to HLS format using FFmpeg. If video files are not present, the schema and demo user are still created.

Start the dev server:

```bash
npm run dev
# API server listening on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Vite dev server at http://localhost:5173
```

### 4. Demo Credentials

```
Email:    demo@lumora.dev
Password: password123
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register a new user |
| `POST` | `/auth/login` | ❌ | Login and receive tokens |
| `POST` | `/auth/refresh` | Cookie | Silently refresh access token |
| `POST` | `/auth/logout` | Cookie | Clear refresh token cookie |
| `GET` | `/auth/me` | ✅ JWT | Get current user profile |

### Videos
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/videos` | ❌ | List videos (cursor paginated) |
| `GET` | `/videos/:id` | ❌ | Get a single video |
| `POST` | `/videos` | ✅ | Upload a new video |
| `POST` | `/videos/:id/like` | ✅ | Like a video |
| `DELETE` | `/videos/:id/like` | ✅ | Unlike a video |
| `POST` | `/videos/:id/bookmark` | ✅ | Bookmark a video |
| `DELETE` | `/videos/:id/bookmark` | ✅ | Remove bookmark |
| `POST` | `/videos/:id/comment` | ✅ | Post a comment |
| `GET` | `/videos/:id/comments` | ❌ | List comments for a video |
| `GET` | `/videos/:id/quiz` | ❌ | Get or generate an AI quiz |
| `POST` | `/videos/:id/quiz/submit` | ✅ | Submit quiz answers for XP |
| `POST` | `/videos/:id/timestamps` | ✅ | Save a timestamp bookmark |
| `GET` | `/videos/:id/timestamps` | ✅ | Get all timestamps for a video |

### Progress & Bookmarks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/progress/stats` | ✅ | Get user XP and day streak |
| `GET` | `/progress/:category` | ✅ | Get progress for a category |
| `POST` | `/progress/:videoId` | ✅ | Mark a video as completed |
| `GET` | `/bookmarks` | ✅ | Get all bookmarked videos |
| `GET` | `/bookmarks/timestamps` | ✅ | Get all timestamp bookmarks |

---

## 🧠 Technical Deep Dives

### Silent Token Refresh

Lumora implements a "set-and-forget" authentication pattern. The Axios client has a response interceptor that catches `401 Unauthorized` errors. It immediately calls `/auth/refresh` (which reads the HTTP-only refresh cookie) to get a new access token, then **re-queues and replays the original failed request**. The user never sees a login prompt unless the refresh token itself is expired.

```javascript
// src/api/client.js
axiosInstance.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    await authApi.refresh(); // authenticates via HTTP-only cookie
    return axiosInstance(error.config); // replay original request
  }
  return Promise.reject(error);
});
```

### Optimistic UI Updates

When a user clicks Like, the Redux store is updated **synchronously** before the network request fires. If the API returns an error, a `catch` block dispatches a rollback action to restore the previous state. This creates a native-app feel with zero perceived latency.

```javascript
// Optimistic: update UI immediately
dispatch(toggleLike(videoId));
try {
  await videoApi.like(videoId);
} catch {
  dispatch(toggleLike(videoId)); // rollback on failure
}
```

### Cursor-Based Keyset Pagination

Standard offset pagination breaks under concurrent inserts — a new video added between pages causes duplicates. Lumora uses keyset pagination on a composite cursor `(created_at DESC, id DESC)`, guaranteeing stable, duplicate-free infinite scrolling regardless of concurrent writes.

```sql
SELECT * FROM videos
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT $3;
```

### HLS Adaptive Streaming

Source videos are pre-transcoded by FFmpeg into HLS format (`.m3u8` playlist + `.ts` segments) during the seed step. The browser uses `HLS.js` to stream these segments adaptively, enabling smooth playback across all network conditions — the same delivery method used by YouTube and Netflix.

### AI Quiz Generation

On the first request for a quiz, the backend sends the video's title and description to Google Gemini, which generates a structured 5-question JSON quiz. This is persisted to the `quizzes` table (keyed by `video_id`) so subsequent requests are instant DB reads — no redundant AI calls and no extra cost.

---

## 🔒 Security Model

| Concern | Mitigation |
|---|---|
| Password storage | `bcrypt` with cost factor 12 |
| Session tokens | Short-lived JWT (`15m`) + long-lived refresh token (`7d`) in HTTP-only, `SameSite=Strict` cookie |
| CSRF | Refresh cookie is `SameSite=Strict`; access token lives in-memory (not `localStorage`) |
| Clickjacking | `helmet` sets `X-Frame-Options: DENY` and strict CSP |
| Fingerprinting | `X-Powered-By` header removed via `helmet` |
| Abuse / spam | `express-rate-limit` on all engagement routes (like, comment, bookmark) |
| Input injection | `express-validator` sanitizes and validates all request bodies before controllers execute |
| Duplicate records | Composite `PRIMARY KEY` on `likes` and `bookmarks` enforced at the database level |

---

## 🧪 Testing

The backend includes an integration test suite using Jest + Supertest that runs against a real PostgreSQL database (tables are truncated between tests, not mocked).

```bash
cd backend
npm test
```

Test coverage includes:
- `POST /auth/register` — field validation, duplicate email handling
- `POST /auth/login` — credential verification, token issuance
- `GET /videos` — cursor pagination, category filtering
- `POST /videos/:id/like` — auth guard, atomic count increment, duplicate prevention
- `POST /auth/refresh` — HTTP-only cookie token rotation

---

## 📋 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (default: `5000`) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `FRONTEND_ORIGIN` | ✅ | Allowed CORS origin (e.g. `http://localhost:5173`) |
| `JWT_SECRET` | ✅ | HMAC secret for access tokens |
| `REFRESH_TOKEN_SECRET` | ✅ | HMAC secret for refresh tokens |
| `ACCESS_TOKEN_TTL` | ✅ | e.g. `15m` |
| `REFRESH_TOKEN_TTL` | ✅ | e.g. `7d` |
| `REFRESH_COOKIE_PATH` | ✅ | e.g. `/auth` |
| `GEMINI_API_KEY` | ❌ | Powers AI quiz generation. Falls back to static quiz data if absent. |

---

## 📄 License

MIT © 2025 Lumora. Built with ❤️ for the Skillcase Internship Assessment.

