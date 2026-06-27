# Lumora — Frontend

React 19 SPA with Redux Toolkit, HLS.js video streaming, Framer Motion animations, and a TikTok-style vertical feed.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| State Management | Redux Toolkit + React-Redux |
| Routing | React Router DOM v7 |
| HTTP Client | Axios (with silent token refresh interceptors) |
| Animations | Framer Motion 12 |
| Video | HLS.js (adaptive bitrate streaming) |
| Build Tool | Vite 8 |

## Folder Structure

```
src/
├── main.jsx                # React + Redux + Router bootstrap
├── App.jsx                 # Route declarations + ProtectedRoute
├── index.css               # Design system: CSS variables, animations
├── api/
│   ├── client.js           # Axios instance with refresh interceptors
│   └── endpoints.js        # Typed API surface (authApi, videoApi, ...)
├── redux/
│   ├── store.js
│   └── authSlice.js        # JWT auth state and thunks
├── hooks/
│   ├── useIntersectionObserver.js
│   └── useWatchHistory.js
├── components/
│   ├── CommentSheet.jsx    # Framer Motion slide-up bottom sheet
│   ├── Navbar.jsx
│   ├── VideoPlayer.jsx     # HLS.js wrapper component
│   ├── FeedSkeleton.jsx
│   ├── CategoryTabs.jsx
│   ├── ProtectedRoute.jsx
│   └── Layout.jsx
└── pages/
    ├── LandingPage.jsx
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── DashboardPage.jsx   # XP, streak, bookmarks, course grid
    └── CoursePlayerPage.jsx # Vertical feed, quiz, timestamps
```

## Setup

```bash
npm install
npm run dev
# Vite dev server at http://localhost:5173
```

Make sure the backend is running at `http://localhost:5000` before starting the frontend.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint |

## Key Patterns

### Silent Token Refresh
The Axios client intercepts `401` responses, calls `/auth/refresh` via HTTP-only cookie, then replays the original request — without the user ever seeing a login redirect.

### Optimistic UI
Likes and bookmarks update Redux state immediately on click. A network failure triggers an automatic rollback to the previous state.

### IntersectionObserver Autoplay
The vertical feed uses `IntersectionObserver` to detect which video is currently visible and plays only that one — all others are paused.

### HLS Streaming
`HLS.js` mounts on each video element to stream adaptive `.m3u8` playlists served by the backend's `/uploads` static route.
