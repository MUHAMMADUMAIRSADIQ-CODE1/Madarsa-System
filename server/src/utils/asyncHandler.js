const logger = require('./logger');

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Async handler caught error:', {
        message: error.message,
        stack: error.stack,
        path: req.originalUrl,
        method: req.method,
      });
      next(error);
    });
  };
}

module.exports = asyncHandler;
