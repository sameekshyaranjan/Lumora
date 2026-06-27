const authService = require('../services/auth.service');
const { refreshCookieOptions } = require('../utils/cookies');
const { ok, created } = require('../utils/respond');

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({
      email, password, name,
    });
    res.cookie('refresh_token', refreshToken, refreshCookieOptions());
    return created(res, { user, accessToken }, 'Account created');
  } catch (e) { next(e); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({
      email, password,
    });
    res.cookie('refresh_token', refreshToken, refreshCookieOptions());
    return ok(res, { user, accessToken }, 'Logged in');
  } catch (e) { next(e); }
}

async function me(req, res, next) {
  try {
    const user = await authService.me(req.user.id); // set by authMiddleware
    return ok(res, { user }, 'OK');
  } catch (e) { next(e); }
}

async function refresh(req, res, next) {
  try {
    const { accessToken } = await authService.refresh(req.cookies.refresh_token);
    return ok(res, { accessToken }, 'Token refreshed');
  } catch (e) { next(e); }
}

async function logout(req, res, next) {
  try {

    const opts = refreshCookieOptions();
    opts.maxAge = 0;
    opts.expires = new Date(0);
    res.cookie('refresh_token', '', opts);
    return ok(res, null, 'Logged out');
  } catch (e) { next(e); }
}

module.exports = { register, login, me, refresh, logout };
