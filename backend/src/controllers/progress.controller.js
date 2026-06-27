const { pool } = require('../config/db');
const { ok } = require('../utils/respond');

exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category } = req.params;

    const result = await pool.query(
      'SELECT video_id FROM user_progress WHERE user_id = $1 AND category = $2',
      [userId, category]
    );

    const completedVideoIds = result.rows.map(r => r.video_id);
    ok(res, { completed: completedVideoIds }, 'OK');
  } catch (error) {
    next(error);
  }
};

exports.markCompleted = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const progressResult = await pool.query(`
      INSERT INTO user_progress (user_id, video_id, category)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, video_id) DO NOTHING
      RETURNING *
    `, [userId, videoId, category]);

    if (progressResult.rowCount === 0) {
      return ok(res, { awardedXp: 0 }, 'Already completed');
    }

    // Award XP and calculate streak
    const userResult = await pool.query('SELECT xp, current_streak, last_active_date FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    
    let { xp, current_streak, last_active_date } = userResult.rows[0];
    
    xp += 50;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!last_active_date) {
      current_streak = 1;
    } else {
      const lastActive = new Date(last_active_date);
      lastActive.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        current_streak += 1;
      } else if (diffDays > 1) {
        current_streak = 1;
      }
    }

    await pool.query(`
      UPDATE users 
      SET xp = $1, current_streak = $2, last_active_date = CURRENT_DATE 
      WHERE id = $3
    `, [xp, current_streak, userId]);

    ok(res, { awardedXp: 50, newXp: xp, newStreak: current_streak }, 'Progress saved');
  } catch (error) {
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT xp, current_streak FROM users WHERE id = $1', [userId]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'User not found' });
    
    ok(res, result.rows[0], 'OK');
  } catch (error) {
    next(error);
  }
};
