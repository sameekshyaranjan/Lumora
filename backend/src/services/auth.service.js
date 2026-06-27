const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/token');
const { AuthError, ConflictError } = require('../utils/errors');

const SALT_ROUNDS = 12;

const publicUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  created_at: row.created_at,
});

async function register({ email, password, name }) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) throw new ConflictError('Email already registered');

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at`,
    [email, password_hash, name]
  );
  const user = rows[0];
  return {
    user: publicUser(user),
    accessToken: signAccess(user),
    refreshToken: signRefresh(user),
  };
}

async function login({ email, password }) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user) throw new AuthError('Invalid email or password');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new AuthError('Invalid email or password');

  return {
    user: publicUser(user),
    accessToken: signAccess(user),
    refreshToken: signRefresh(user),
  };
}

async function me(userId) {
  const { rows } = await query(
    'SELECT id, email, name, created_at FROM users WHERE id = $1',
    [userId]
  );
  if (!rows[0]) throw new AuthError('User no longer exists');
  return publicUser(rows[0]);
}

async function refresh(refreshToken) {
  if (!refreshToken) throw new AuthError('Missing refresh token');
  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    throw new AuthError('Invalid or expired refresh token');
  }
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [payload.sub]);
  const user = rows[0];
  if (!user) throw new AuthError('User no longer exists');
  return { accessToken: signAccess(user) };
}

module.exports = { register, login, me, refresh };
