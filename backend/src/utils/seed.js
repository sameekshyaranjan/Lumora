require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { pool, query } = require('../config/db');
const { applySchema } = require('./migrate');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const VIDEOS = [
  {
    title: 'Introduction to German',
    description: 'Learn the very basics of the German language.',
    category: 'Language',
    source_file: 'uploads/Introduction_German.mp4',
    file_path: '/uploads/hls/Introduction_German/playlist.m3u8',
    hls_dir: 'uploads/hls/Introduction_German'
  },
  {
    title: 'Learning German',
    description: 'A deeper dive into German vocabulary and grammar.',
    category: 'Language',
    source_file: 'uploads/Learning_German.mp4',
    file_path: '/uploads/hls/Learning_German/playlist.m3u8',
    hls_dir: 'uploads/hls/Learning_German'
  },
  {
    title: 'German Story Time',
    description: 'A short story told in German to practice your listening skills.',
    category: 'Language',
    source_file: 'uploads/Story_German.mp4',
    file_path: '/uploads/hls/Story_German/playlist.m3u8',
    hls_dir: 'uploads/hls/Story_German'
  },
];

async function ensureFilesPresent() {
  const missing = VIDEOS
    .map((v) => path.join(__dirname, '..', '..', v.source_file))
    .filter((p) => !fs.existsSync(p));
  if (missing.length) {
    console.warn(
      '[seed] WARNING: these video files are missing on disk:\n  ' +
      missing.join('\n  ') +
      '\n[seed] Please upload the .mp4 files before seeding HLS.'
    );
  }
}

async function ensureDemoUser() {
  const email = 'demo@lumora.dev';
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) return existing.rows[0].id;
  const hash = await bcrypt.hash('password123', 12);
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, name, xp, current_streak)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [email, hash, 'Demo Learner', 0, 0]
  );
  console.log('[seed] demo user created -> demo@lumora.dev / password123');
  return rows[0].id;
}

function transcodeHLS(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    const playlistPath = path.join(outputDir, 'playlist.m3u8');
    if (fs.existsSync(playlistPath)) {
      console.log(`[seed] HLS already exists for: ${outputDir}`);
      return resolve();
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    if (!fs.existsSync(inputPath)) {
      console.warn(`[seed] Cannot transcode, missing source: ${inputPath}`);
      return resolve();
    }

    console.log(`[seed] Transcoding ${path.basename(inputPath)} to HLS... (this may take a minute)`);
    
    ffmpeg(inputPath, { timeout: 432000 })
      .addOptions([
        '-profile:v baseline', 
        '-level 3.0', 
        '-start_number 0', 
        '-hls_time 10', 
        '-hls_list_size 0', 
        '-f hls'
      ])
      .output(playlistPath)
      .on('end', () => resolve())
      .on('error', (err) => {
        console.error(`[seed] Error transcoding ${inputPath}:`, err.message);
        reject(err);
      })
      .run();
  });
}

async function seedVideos() {
  for (const v of VIDEOS) {
    const exists = await query('SELECT id FROM videos WHERE file_path = $1', [v.file_path]);
    if (exists.rowCount > 0) {
      console.log(`[seed] skip (already present in DB): ${v.title}`);
      continue;
    }
    
    const inputPath = path.join(__dirname, '..', '..', v.source_file);
    const outputDir = path.join(__dirname, '..', '..', v.hls_dir);
    
    await transcodeHLS(inputPath, outputDir);

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
