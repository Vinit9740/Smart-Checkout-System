const config = require('../config');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log error
  if (!isOperational || config.nodeEnv === 'development') {
    console.error(`[ERROR] ${err.message}`, {
      statusCode,
      stack: config.nodeEnv === 'development' ? err.stack : undefined,
      path: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'An unexpected error occurred.',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
