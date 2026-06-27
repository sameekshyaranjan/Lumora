const { AppError } = require('../utils/errors');

function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, _req, res, _next) {

  if (err.code === '23505') {
    return res.status(409).json({ success: false, data: null, message: 'Already exists' });
  }

  if (err.code === '23503') {
    return res.status(404).json({ success: false, data: null, message: 'Related resource not found' });
  }

  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error';

  if (status >= 500) console.error('[error]', err);

  return res.status(status).json({
    success: false,
    data: err.details ? { errors: err.details } : null,
    message,
  });
}

module.exports = { notFound, errorHandler };
