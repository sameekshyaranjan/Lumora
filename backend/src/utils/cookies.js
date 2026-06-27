const env = require('../config/env');

const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const refreshCookieOptions = () => ({
  httpOnly: true,                              // JS cannot read it
  secure: env.nodeEnv === 'production',        // HTTPS-only in prod; off on localhost
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  path: env.refreshCookiePath,                 // only sent to /auth/* routes
  maxAge: REFRESH_MAX_AGE_MS,
});

module.exports = { refreshCookieOptions, REFRESH_MAX_AGE_MS };
