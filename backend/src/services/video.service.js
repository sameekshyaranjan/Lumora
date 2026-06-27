const { query, getClient } = require('../config/db');
const { NotFoundError } = require('../utils/errors');

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

async function listVideos({ cursor, limit, category, search }) {
  const lim = Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT);

  let anchor = null;
  if (cursor) {
    const { rows } = await query(
      'SELECT created_at, id FROM videos WHERE id = $1',
      [cursor]
    );
    if (rows[0]) anchor = rows[0];

  }

  const params = [];
  const where = [];

  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`title ILIKE $${params.length}`);
  }
  if (anchor) {

    params.push(anchor.created_at, anchor.id);
    where.push(
      `(created_at, id) < ($${params.length - 1}, $${params.length})`
    );
  }

  params.push(lim + 1);
  const sql = `
    SELECT id, title, description, category, file_path, like_count, created_at
    FROM videos
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY created_at DESC, id DESC
    LIMIT $${params.length}
  `;
  const { rows } = await query(sql, params);

  const hasMore = rows.length > lim;
  const videos = hasMore ? rows.slice(0, lim) : rows;
  const nextCursor = hasMore ? videos[videos.length - 1].id : null;
  return { videos, nextCursor };
}

async function getVideo(id) {
  const { rows } = await query(
    `SELECT id, title, description, category, file_path, like_count, created_at
     FROM videos WHERE id = $1`,
    [id]
  );
  if (!rows[0]) throw new NotFoundError('Video not found');
  return rows[0];
}

async function createVideo({ title, description, category, file_path }) {
  const { rows } = await query(
    `INSERT INTO videos (title, description, category, file_path)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, category, file_path, like_count, created_at`,
    [title, description || '', category, file_path]
  );
  return rows[0];
}

module.exports = { listVideos, getVideo, createVideo, DEFAULT_LIMIT };
