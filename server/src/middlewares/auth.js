const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ApiError } = require('../utils');
const { httpStatus, messages, roles, USER_STATUS } = require('../constants');
const logger = require('../utils/logger');
const User = require('../models/User.model');

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

    // Check if user has been blocked since token was issued
    // Skip status check for admin users
    if (decoded.role !== roles.ADMIN) {
      try {
        const currentUser = await User.findById(req.userId).select('status isActive').lean();
        if (currentUser) {
          if (currentUser.status === USER_STATUS.BLOCKED || !currentUser.isActive) {
            throw new ApiError(httpStatus.FORBIDDEN, messages.USER_BLOCKED);
          }
        }
      } catch (blockError) {
        if (blockError instanceof ApiError) throw blockError;
        // If DB lookup fails, log but allow request (don't break auth for transient issues)
        logger.error('Failed to check user block status:', blockError.message);
      }
    }

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

const requireProfileComplete = async (req, _res, next) => {
  try {
    const user = await User.findById(req.userId).select('profileComplete role profileVerified profileVerificationStatus');

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    // Admins are always allowed
    if (user.role === roles.ADMIN) {
      return next();
    }

    if (!user.profileComplete) {
      logger.warn(
        `User ${req.userId} with incomplete profile attempted to access ${req.originalUrl}`
      );
      throw new ApiError(httpStatus.FORBIDDEN, messages.PROFILE_COMPLETION_REQUIRED);
    }

    // Check profile verification status
    if (user.profileVerificationStatus !== 'verified') {
      logger.warn(
        `User ${req.userId} with unverified profile (${user.profileVerificationStatus}) attempted to access ${req.originalUrl}`
      );
      throw new ApiError(httpStatus.FORBIDDEN, 'Your profile must be verified before accessing the dashboard');
    }

    if (!user.profileVerified) {
      logger.warn(
        `User ${req.userId} with unverified profile attempted to access ${req.originalUrl}`
      );
      throw new ApiError(httpStatus.FORBIDDEN, 'Your profile has not been verified yet');
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error checking profile completion'));
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  isAdmin,
  isTeacher,
  isStudent,
  isAdminOrTeacher,
  isAdminOrStudent,
  requireProfileComplete,
};
