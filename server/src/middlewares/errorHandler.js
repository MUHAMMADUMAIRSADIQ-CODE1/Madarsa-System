const mongoose = require('mongoose');
const env = require('../config/env');
const { ApiError, logger } = require('../utils');
const { httpStatus, messages } = require('../constants');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(httpStatus.BAD_REQUEST, message);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value for ${field}: ${value}. Please use another value.`;
  return new ApiError(httpStatus.CONFLICT, message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  const message = `Validation failed: ${errors.map((e) => e.message).join(', ')}`;
  return new ApiError(httpStatus.UNPROCESSABLE_ENTITY, message, errors);
};

const handleJWTError = () =>
  new ApiError(httpStatus.UNAUTHORIZED, messages.TOKEN_INVALID);

const handleJWTExpiredError = () =>
  new ApiError(httpStatus.UNAUTHORIZED, messages.TOKEN_EXPIRED);

const handleRateLimitError = () =>
  new ApiError(httpStatus.TOO_MANY_REQUESTS, messages.TOO_MANY_REQUESTS);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || undefined,
    });
  } else {
    logger.error('Unexpected error:', err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: messages.INTERNAL_ERROR,
    });
  }
};

const errorHandler = (err, _req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;
  error.errors = err.errors;

  if (err instanceof mongoose.Error.CastError) {
    error = handleCastErrorDB(err);
  }

  if (err.code === 11000) {
    error = handleDuplicateFieldsDB(err);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationErrorDB(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  if (err.name === 'RateLimitError') {
    error = handleRateLimitError();
  }

  if (!error.statusCode) {
    error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  }

  if (env.nodeEnv === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

const notFoundHandler = (req, _res, next) => {
  const message = `Route not found: ${req.originalUrl}`;
  next(new ApiError(httpStatus.NOT_FOUND, message));
};

module.exports = { errorHandler, notFoundHandler };
