# Lumora

A production-ready short-video learning platform inspired by the vertical-scrolling feed experience of Instagram Reels and YouTube Shorts. 

Built with a robust, clean architecture featuring a Node.js/Express backend and a React/Vite frontend.

## Architecture Overview

**Backend (Node.js + Express + PostgreSQL)**
- **Strict Layered Architecture:** Requests flow strictly through `Routes` → `Controllers` → `Services` → `Database`. No business logic resides in the routing layer.
- **Security First:** Features robust bcrypt password hashing, HTTP-only refresh cookies for XSS protection, Helmet for CSP headers, and rate limiting against brute-force attacks.
- **Relational Integrity:** PostgreSQL handles complex relationships via composite primary keys (preventing duplicate likes/bookmarks) and atomic increment operations using robust transactional boundaries.
- **Keyset Pagination:** The video feed uses cursor pagination (`created_at DESC, id DESC`) rather than `OFFSET` to prevent duplicate data fetches as new videos are uploaded during an active user session.

**Frontend (React + Vite + Redux Toolkit)**
- **Modern UI:** Built for smooth, native-feeling vertical video scrolling.
- **State Management:** Utilizes Redux Toolkit for seamless authentication state and data caching (`authSlice` handles normalized user state).
- **Silent Refresh Flow:** Centralized Axios client intercepts 401s, silently requests a new access token using the HTTP-only cookie, and replays failed requests automatically without logging the user out.
- **Optimistic UI Updates:** Like and Bookmark buttons update instantly on click, syncing invisibly with the server, and automatically rolling back the UI if the network fails.
- **Performance:** Optimized lazy-loading and Intersection Observers to guarantee media only plays when fully visible in the viewport.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (Local, Neon, or Supabase)

### Full Run Order
To spin up both servers and connect them:

1. **Backend setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Fill DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET in .env
   npm install
   ```

2. **Database Setup:**
   ```bash
   npm run migrate
   npm run seed
   # The seed command creates demo@lumora.dev / password123
   ```

3. **Start backend server:**
   ```bash
   npm run dev
   # Runs on http://localhost:5000
   ```

4. **Frontend setup (in a new terminal):**
   ```bash
   cd frontend
   echo "VITE_API_URL=http://localhost:5000" > .env
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

### Demo Credentials
Log into the frontend using:
- **Email:** `demo@lumora.dev`
- **Password:** `password123`

## Key Technical Decisions
- **Stateless JWT Authentication:** Access tokens are short-lived (15m) and stored securely in memory, while long-lived refresh tokens (7d) are handled securely via `HttpOnly` cookies.
- **Centralized Error Handling:** All API errors are routed through a singular error middleware, ensuring the client receives a strictly typed `{ success, data, message }` response envelope regardless of where the failure occurred.

## License
MIT
