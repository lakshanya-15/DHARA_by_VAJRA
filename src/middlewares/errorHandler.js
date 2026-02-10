/**
 * Global error handler. Avoids leaking stack traces in production.
 */
const config = require('../config');

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const payload = { success: false, error: message };
  if (config.nodeEnv === 'development' && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}

module.exports = { errorHandler };
