CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT NOT NULL UNIQUE,
  password_hash    TEXT NOT NULL,
  name             TEXT NOT NULL,
  xp               INTEGER NOT NULL DEFAULT 0,
  current_streak   INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL,
  file_path   TEXT NOT NULL,          -- stored as "/uploads/<file>.mp4"
  like_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON videos (category);

CREATE INDEX IF NOT EXISTS idx_videos_created_at_id ON videos (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS likes (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)      -- composite PK => no duplicate likes
);

CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_video_created
  ON comments (video_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bookmarks (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)      -- composite PK => no duplicate bookmarks
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created
  ON bookmarks (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS timestamp_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  timestamp_seconds INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timestamp_bookmarks_user_video 
  ON timestamp_bookmarks (user_id, video_id, timestamp_seconds);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  category   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);
CREATE INDEX IF NOT EXISTS idx_user_progress_category
  ON user_progress (user_id, category);

CREATE TABLE IF NOT EXISTS quizzes (
  video_id      UUID PRIMARY KEY REFERENCES videos(id) ON DELETE CASCADE,
  question_data JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
