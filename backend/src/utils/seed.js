require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { pool, query } = require('../config/db');
const { applySchema } = require('./migrate');

const VIDEOS = [
  {
    title: 'Introduction to German',
    description: 'Learn the very basics of the German language.',
    category: 'Language',
    file_path: '/uploads/Introduction_German.mp4',
  },
  {
    title: 'Learning German',
    description: 'A deeper dive into German vocabulary and grammar.',
    category: 'Language',
    file_path: '/uploads/Learning_German.mp4',
  },
  {
    title: 'German Story Time',
    description: 'A short story told in German to practice your listening skills.',
    category: 'Language',
    file_path: '/uploads/Story_German.mp4',
  },
];

async function ensureFilesPresent() {
  const missing = VIDEOS
    .map((v) => path.join(__dirname, '..', '..', v.file_path.replace('/uploads/', 'uploads/')))
    .filter((p) => !fs.existsSync(p));
  if (missing.length) {
    console.warn(
      '[seed] WARNING: these video files are missing on disk:\n  ' +
      missing.join('\n  ') +
      '\n[seed] Rows will still be inserted, but playback will 404 until files are placed.'
    );
  }
}

async function ensureDemoUser() {
  const email = 'demo@lumora.dev';
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) return existing.rows[0].id;
  const hash = await bcrypt.hash('password123', 12);
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3) RETURNING id`,
    [email, hash, 'Demo Learner']
  );
  console.log('[seed] demo user created -> demo@lumora.dev / password123');
  return rows[0].id;
}

async function seedVideos() {
  for (const v of VIDEOS) {
    const exists = await query('SELECT id FROM videos WHERE file_path = $1', [v.file_path]);
    if (exists.rowCount > 0) {
      console.log(`[seed] skip (already present): ${v.title}`);
      continue;
    }
    await query(
      `INSERT INTO videos (title, description, category, file_path)
       VALUES ($1, $2, $3, $4)`,
      [v.title, v.description, v.category, v.file_path]
    );
    console.log(`[seed] inserted: ${v.title}`);
  }
}

async function run() {
  await applySchema();
  await ensureFilesPresent();
  await ensureDemoUser();
  await seedVideos();
}

run()
  .then(() => pool.end())
  .then(() => { console.log('[seed] done'); process.exit(0); })
  .catch((e) => { console.error('[seed] failed', e); process.exit(1); });
