class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized', errors = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = 'Forbidden', errors = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = 'Resource not found', errors = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = 'Resource already exists', errors = []) {
    return new ApiError(409, message, errors);
  }

  static unprocessable(message = 'Unprocessable entity', errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = 'Too many requests', errors = []) {
    return new ApiError(429, message, errors);
  }

  static internal(message = 'Internal server error', errors = []) {
    return new ApiError(500, message, errors);
  }
}

module.exports = ApiError;
