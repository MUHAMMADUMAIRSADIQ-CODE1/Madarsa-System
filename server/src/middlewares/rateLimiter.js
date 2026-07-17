const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const createRateLimiter = (options = {}) => {
  // Bypass all rate limiting in development mode for unlimited testing
  if (env.nodeEnv === 'development') {
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs: options.windowMs || env.rateLimit.windowMs,
    max: options.max || env.rateLimit.max,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

const globalLimiter = createRateLimiter();

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
});

const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
});

const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
});

module.exports = {
  createRateLimiter,
  globalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
};
