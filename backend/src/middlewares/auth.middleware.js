const { verifyAccess } = require('../utils/token');
const { AuthError } = require('../utils/errors');

module.exports = function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AuthError('Missing or malformed Authorization header'));
  }
  try {
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {

    next(new AuthError('Invalid or expired access token'));
  }
};
