const { pool } = require('../config/db');
const { ok } = require('../utils/respond');

exports.addTimestampBookmark = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;
    const { timestamp, note } = req.body;

    if (typeof timestamp !== 'number') {
      return res.status(400).json({ success: false, message: 'Timestamp is required and must be a number' });
    }

    const result = await pool.query(`
      INSERT INTO timestamp_bookmarks (user_id, video_id, timestamp_seconds, note)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [userId, videoId, Math.floor(timestamp), note || null]);

    ok(res, { bookmark: result.rows[0] }, 'Timestamp bookmarked');
  } catch (error) {
    next(error);
  }
};

exports.getTimestampBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    const result = await pool.query(`
      SELECT * FROM timestamp_bookmarks
      WHERE user_id = $1 AND video_id = $2
      ORDER BY timestamp_seconds ASC
    `, [userId, videoId]);

    ok(res, { bookmarks: result.rows }, 'OK');
  } catch (error) {
    next(error);
  }
};

exports.getAllTimestampBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT tb.*, v.title, v.category
      FROM timestamp_bookmarks tb
      JOIN videos v ON tb.video_id = v.id
      WHERE tb.user_id = $1
      ORDER BY tb.created_at DESC
    `, [userId]);

    ok(res, { bookmarks: result.rows }, 'OK');
  } catch (error) {
    next(error);
  }
};
