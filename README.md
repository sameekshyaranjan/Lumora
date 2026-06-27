# Lumora

A production-ready short-video learning platform inspired by the vertical-scrolling feed experience of Instagram Reels and YouTube Shorts. 

Built with a robust, clean architecture featuring a Node.js/Express backend and a React/Vite frontend.

## Architecture Overview

**Backend (Node.js + Express + PostgreSQL)**
- **Strict Layered Architecture:** Requests flow strictly through `Routes` → `Controllers` → `Services` → `Database`. No business logic resides in the routing layer.
- **Security First:** Features robust bcrypt password hashing, HTTP-only refresh cookies for XSS protection, Helmet for CSP headers, and rate limiting against brute-force attacks.
- **Relational Integrity:** PostgreSQL handles complex relationships via composite primary keys (preventing duplicate likes/bookmarks) and atomic increment operations using robust transactional boundaries.

**Frontend (React + Vite + Redux Toolkit) (Coming Soon)**
- **Modern UI:** Built for smooth, native-feeling vertical video scrolling.
- **State Management:** Utilizes Redux Toolkit for seamless authentication state and data caching.
- **Performance:** Optimized lazy-loading and Intersection Observers to guarantee media only plays when fully visible in the viewport.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (Local, Neon, or Supabase)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Copy the example environment file and configure your secrets.
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure you generate strong random strings for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`, and provide a valid PostgreSQL connection string in `DATABASE_URL`.*

4. **Run Database Migrations:**
   Automatically create the required tables and indexes.
   ```bash
   npm run migrate
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

### Frontend Setup
*Frontend instructions will be added as the client application is finalized.*

## Key Technical Decisions
- **Stateless JWT Authentication:** Access tokens are short-lived and stored securely in memory, while long-lived refresh tokens are handled securely via `HttpOnly` cookies.
- **Keyset Pagination:** The video feed uses keyset/cursor pagination (`created_at DESC, id DESC`) rather than `OFFSET` to prevent duplicate data fetches as new videos are uploaded during an active user session. 
- **Centralized Error Handling:** All API errors are routed through a singular error middleware, ensuring the client receives a strictly typed `{ success, data, message }` response envelope regardless of where the failure occurred.

## License
MIT
