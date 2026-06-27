# Lumora Backend

The backend engine for Lumora. Built with Node.js, Express, and PostgreSQL.

## Architecture

This backend strictly enforces a layered architecture to ensure maintainability and separation of concerns:

- **Routes (`src/routes/`)**: Receives the HTTP request, performs basic validation using `express-validator`, and delegates to the controller. No business logic lives here.
- **Controllers (`src/controllers/`)**: Handles HTTP specifics (extracting params/body, sending status codes/JSON responses). Maps the request to the appropriate service layer method.
- **Services (`src/services/`)**: Contains the core business logic and database interactions. Knows nothing about HTTP (`req` or `res`).

## Required Video Assets

The database seeder requires three specific video files to be present in the `uploads/` directory to work properly.

Please place the following 3 files inside `backend/uploads/`:
1. `intro-to-systems.mp4`
2. `data-structures-101.mp4`
3. `networking-basics.mp4`

*(Names must match exactly as they are case-sensitive on Linux/Unix systems).*

## Database & Authentication

- **Relational Integrity**: We use PostgreSQL composite primary keys on the `likes` and `bookmarks` tables (e.g. `PRIMARY KEY (user_id, video_id)`) to enforce deduping at the database layer.
- **Atomic Operations**: Video metrics like `like_count` are incremented atomically alongside the insertion of the like record within a PostgreSQL transaction (`BEGIN`/`COMMIT`).
- **Auth Flow**: Uses stateless JWT access tokens (15m expiry) stored in-memory on the frontend, combined with long-lived refresh tokens securely delivered via an `HttpOnly`, `Path=/auth` cookie.

## Cursor Pagination

The `/videos` list endpoint implements cursor-based (keyset) pagination using `created_at DESC, id DESC`. This prevents duplicate entries and missed rows when new videos are uploaded during an active user session, providing a superior scroll experience over traditional `LIMIT/OFFSET`.

## Local Development Commands

- `npm run dev`: Starts the server on port 5000 with nodemon.
- `npm run migrate`: Drops (if existing) and recreates all tables.
- `npm run seed`: Inserts demo users and the 3 video records.
- `npm test`: Runs the Mocha/Chai integration tests.
