# Lumora — Backend

Express 5 REST API with PostgreSQL, JWT authentication, HLS video streaming, and AI-powered quiz generation.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 5 |
| Database | PostgreSQL 16 (`pg` connection pool) |
| Auth | JWT + bcrypt + HTTP-only refresh cookie |
| Validation | `express-validator` |
| Security | `helmet`, `express-rate-limit`, CORS |
| Video | FFmpeg (`fluent-ffmpeg`) — HLS transcoding |
| AI | Google Gemini 1.5 Flash |
| Testing | Jest + Supertest |

## Folder Structure

```
src/
├── server.js               # Entry point
├── app.js                  # Express setup, middleware chain
├── config/
│   └── db.js               # pg Pool singleton
├── routes/                 # Route declarations only
├── controllers/            # Request/response handling
├── middlewares/            # auth, error, rateLimit, validate
├── services/               # Business logic and DB queries
└── utils/                  # seed, migrate, validators, respond
db/
└── schema.sql              # Full PostgreSQL schema
uploads/
└── hls/                    # Transcoded HLS video segments (gitignored)
```

## Setup

```bash
npm install
```

Create a `.env` file (see root README for all variables).

Apply schema and seed demo data:

```bash
# Drop your .mp4 source files into uploads/ first
npm run seed
```

Start dev server:

```bash
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with `node --watch` (auto-restart on change) |
| `npm start` | Start in production mode |
| `npm run seed` | Apply schema + transcode HLS + create demo user |
| `npm run migrate` | Apply schema only |
| `npm test` | Run Jest integration tests |

## API Routes

All routes are prefixed under their resource:

- `/auth` — register, login, refresh, logout, me
- `/videos` — feed, likes, bookmarks, comments, quiz, timestamps
- `/progress` — XP, streak, video completion
- `/bookmarks` — saved videos and timestamp bookmarks

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default `5000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_ORIGIN` | Allowed CORS origin |
| `JWT_SECRET` | HMAC secret for access tokens |
| `REFRESH_TOKEN_SECRET` | HMAC secret for refresh tokens |
| `ACCESS_TOKEN_TTL` | e.g. `15m` |
| `REFRESH_TOKEN_TTL` | e.g. `7d` |
| `REFRESH_COOKIE_PATH` | e.g. `/auth` |
| `GEMINI_API_KEY` | Google Gemini key (optional — falls back to static quiz) |

## Video Setup

Videos are served over HLS. Place `.mp4` files in `uploads/` and run `npm run seed`. FFmpeg will transcode each into a `playlist.m3u8` + `.ts` segments under `uploads/hls/<name>/`.

The `uploads/` directory is fully gitignored — video files are never committed.
