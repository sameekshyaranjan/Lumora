const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,           // 15 minutes
  max: 10,                            // 10 login attempts / IP / window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, message: 'Too many attempts, try later' },
});

const engagementLimiter = rateLimit({
  windowMs: 60 * 1000,                // 1 minute
  max: 60,                            // 60 actions / IP / minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, message: 'Slow down a little' },
});

module.exports = { authLimiter, engagementLimiter };
