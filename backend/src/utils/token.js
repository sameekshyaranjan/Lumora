const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signAccess = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.accessTtl,
  });

const signRefresh = (user) =>
  jwt.sign({ sub: user.id }, env.refreshSecret, {
    expiresIn: env.refreshTtl,
  });

const verifyAccess = (token) => jwt.verify(token, env.jwtSecret);
const verifyRefresh = (token) => jwt.verify(token, env.refreshSecret);

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
