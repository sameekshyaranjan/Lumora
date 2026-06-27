const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const env = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const videoRoutes = require('./routes/video.routes');
const bookmarkRoutes = require('./routes/bookmark.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

function buildApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          mediaSrc: ["'self'", 'blob:'],         // our /uploads videos
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'", env.frontendOrigin],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use(
    '/uploads',
    express.static(path.join(__dirname, '..', 'uploads'), {
      setHeaders: (res) => res.set('Accept-Ranges', 'bytes'),
    })
  );

  app.get('/health', (_req, res) =>
    res.json({ success: true, data: { status: 'up' }, message: 'OK' })
  );

  app.use('/auth', authRoutes);
  app.use('/videos', videoRoutes);
  app.use('/bookmarks', bookmarkRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { buildApp };
