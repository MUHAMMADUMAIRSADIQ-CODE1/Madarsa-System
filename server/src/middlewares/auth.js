const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ApiError } = require('../utils');
const { httpStatus, messages, roles } = require('../constants');
const logger = require('../utils/logger');

const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  }

  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

const authenticate = async (req, _res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        messages.UNAUTHORIZED
      );
    }

    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded;
    req.userId = decoded.id || decoded.sub;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, messages.TOKEN_EXPIRED)
      );
    }
    if (error.name === 'JsonWebTokenError') {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, messages.TOKEN_INVALID)
      );
    }
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, messages.UNAUTHORIZED)
      );
    }

    if (!req.user.role) {
      return next(
        new ApiError(httpStatus.FORBIDDEN, messages.UNAUTHORIZED)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Unauthorized access attempt by user ${req.userId} with role ${req.user.role}`
      );
      return next(
        new ApiError(httpStatus.FORBIDDEN, messages.UNAUTHORIZED)
      );
    }

    next();
  };
};

const optionalAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = jwt.verify(token, env.jwt.secret);
      req.user = decoded;
      req.userId = decoded.id || decoded.sub;
    }
    next();
  } catch (_error) {
    next();
  }
};


const isAdmin = authorize(roles.ADMIN);
const isTeacher = authorize(roles.TEACHER);
const isStudent = authorize(roles.STUDENT);
const isAdminOrTeacher = authorize(roles.ADMIN, roles.TEACHER);
const isAdminOrStudent = authorize(roles.ADMIN, roles.STUDENT);

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  isAdmin,
  isTeacher,
  isStudent,
  isAdminOrTeacher,
  isAdminOrStudent,
};
