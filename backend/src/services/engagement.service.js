const { query, getClient } = require('../config/db');
const { NotFoundError } = require('../utils/errors');

async function assertVideoExists(client, videoId) {
  const { rowCount } = await client.query('SELECT 1 FROM videos WHERE id = $1', [videoId]);
  if (rowCount === 0) throw new NotFoundError('Video not found');
}

async function likeVideo(userId, videoId) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await assertVideoExists(client, videoId);

    const ins = await client.query(
      `INSERT INTO likes (user_id, video_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, video_id) DO NOTHING`,
      [userId, videoId]
    );

    if (ins.rowCount === 1) {
      await client.query(
        'UPDATE videos SET like_count = like_count + 1 WHERE id = $1',
        [videoId]
      );
    }

    const { rows } = await client.query(
      'SELECT like_count FROM videos WHERE id = $1',
      [videoId]
    );
    await client.query('COMMIT');
    return { liked: true, like_count: rows[0].like_count };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function unlikeVideo(userId, videoId) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await assertVideoExists(client, videoId);

    const del = await client.query(
      'DELETE FROM likes WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );
    if (del.rowCount === 1) {

      await client.query(
        'UPDATE videos SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1',
        [videoId]
      );
    }
    const { rows } = await client.query(
      'SELECT like_count FROM videos WHERE id = $1',
      [videoId]
    );
    await client.query('COMMIT');
    return { liked: false, like_count: rows[0].like_count };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function addComment(userId, videoId, content) {

  const exists = await query('SELECT 1 FROM videos WHERE id = $1', [videoId]);
  if (exists.rowCount === 0) throw new NotFoundError('Video not found');

  const { rows } = await query(
    `INSERT INTO comments (user_id, video_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, video_id, content, created_at`,
    [userId, videoId, content]
  );
  return rows[0];
}

async function listComments(videoId) {
  const { rows } = await query(
    `SELECT c.id, c.content, c.created_at, c.user_id, u.name AS user_name
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.video_id = $1
     ORDER BY c.created_at DESC`,
    [videoId]
  );
  return rows;
}

async function addBookmark(userId, videoId) {
  const exists = await query('SELECT 1 FROM videos WHERE id = $1', [videoId]);
  if (exists.rowCount === 0) throw new NotFoundError('Video not found');

  await query(
    `INSERT INTO bookmarks (user_id, video_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, video_id) DO NOTHING`,
    [userId, videoId]
  );
  return { bookmarked: true };
}

async function removeBookmark(userId, videoId) {
  await query(
    'DELETE FROM bookmarks WHERE user_id = $1 AND video_id = $2',
    [userId, videoId]
  );
  return { bookmarked: false };
}

async function listBookmarks(userId) {
  const { rows } = await query(
    `SELECT v.id, v.title, v.description, v.category, v.file_path,
            v.like_count, v.created_at, b.created_at AS saved_at
     FROM bookmarks b
     JOIN videos v ON v.id = b.video_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  likeVideo, unlikeVideo,
  addComment, listComments,
  addBookmark, removeBookmark, listBookmarks,
};
