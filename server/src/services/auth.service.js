const jwt = require('jsonwebtoken');
const https = require('https');
const env = require('../config/env');
const User = require('../models/User.model');
const { getAuth } = require('../config/firebase');
const { ApiError, logger } = require('../utils');
const { httpStatus, messages, roles, USER_STATUS } = require('../constants');

class AuthService {
  async createFirebaseUser(email, password) {
    try {
      const auth = getAuth();
      const firebaseUser = await auth.createUser({
        email,
        password,
        emailVerified: false,
      });
      logger.info(`Firebase user created: ${firebaseUser.uid}`);
      return firebaseUser;
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ApiError(httpStatus.CONFLICT, messages.EMAIL_ALREADY_EXISTS);
      }
      if (error.code === 'auth/invalid-email') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email format');
      }
      if (error.code === 'auth/weak-password') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Password is too weak');
      }
      logger.error('Firebase createUser failed:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create account. Please try again.'
      );
    }
  }

  async generateEmailVerificationLink(email) {
    try {
      const auth = getAuth();
      const link = await auth.generateEmailVerificationLink(email, {
        url: `${env.frontendUrl}/verify-email`,
      });
      return link;
    } catch (error) {
      logger.error('Failed to generate verification link:', error);
      return null;
    }
  }

  async generatePasswordResetLink(email) {
    try {
      const auth = getAuth();
      const link = await auth.generatePasswordResetLink(email, {
        url: `${env.frontendUrl}/reset-password`,
      });
      return link;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      logger.error('Failed to generate password reset link:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to generate password reset link'
      );
    }
  }

  async verifyFirebaseIdToken(idToken) {
    try {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        throw new ApiError(httpStatus.UNAUTHORIZED, messages.TOKEN_EXPIRED);
      }
      if (error.code?.startsWith('auth/')) {
        throw new ApiError(httpStatus.UNAUTHORIZED, messages.TOKEN_INVALID);
      }
      throw new ApiError(httpStatus.UNAUTHORIZED, messages.INVALID_CREDENTIALS);
    }
  }

  async authenticateWithFirebase(email, password) {
    const firebaseApiKey = env.firebase.webApiKey;
    if (!firebaseApiKey) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Firebase authentication is not configured'
      );
    }

    return new Promise((resolve, reject) => {
      const requestBody = JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      });

      const options = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            if (response.error) {
              if (response.error.message === 'EMAIL_NOT_FOUND' ||
                  response.error.message === 'INVALID_PASSWORD' ||
                  response.error.message === 'INVALID_LOGIN_CREDENTIALS') {
                return reject(
                  new ApiError(httpStatus.UNAUTHORIZED, messages.INVALID_CREDENTIALS)
                );
              }
              if (response.error.message === 'USER_DISABLED') {
                return reject(
                  new ApiError(httpStatus.FORBIDDEN, messages.USER_BLOCKED)
                );
              }
              return reject(
                new ApiError(httpStatus.UNAUTHORIZED, messages.INVALID_CREDENTIALS)
              );
            }

            resolve(response);
          } catch (parseError) {
            reject(
              new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Authentication service error'
              )
            );
          }
        });
      });

      req.on('error', () => {
        reject(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Authentication service unavailable'
          )
        );
      });

      req.write(requestBody);
      req.end();
    });
  }

  generateTokens(payload) {
    const accessToken = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
      issuer: env.jwt.issuer,
    });

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      env.jwt.secret,
      {
        expiresIn: env.jwt.refreshExpiresIn,
        issuer: env.jwt.issuer,
      }
    );

    return { accessToken, refreshToken };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, env.jwt.secret, {
        issuer: env.jwt.issuer,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(httpStatus.UNAUTHORIZED, messages.TOKEN_EXPIRED);
      }
      throw new ApiError(httpStatus.UNAUTHORIZED, messages.TOKEN_INVALID);
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.jwt.secret, {
        issuer: env.jwt.issuer,
      });

      if (decoded.type !== 'refresh') {
        throw new ApiError(httpStatus.UNAUTHORIZED, messages.INVALID_REFRESH_TOKEN);
      }

      const user = await User.findById(decoded.id || decoded.sub);

      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, messages.USER_NOT_FOUND);
      }

      if (user.status === USER_STATUS.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, messages.USER_BLOCKED);
      }

      const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      const tokens = this.generateTokens(payload);

      user.refreshToken = tokens.refreshToken;
      await user.save({ validateBeforeSave: false });

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(httpStatus.UNAUTHORIZED, messages.INVALID_REFRESH_TOKEN);
    }
  }

  async updateLastLogin(userId) {
    try {
      await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    } catch (error) {
      logger.error('Failed to update last login:', error);
    }
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }
    return user.toPublicJSON();
  }

  getCookieOptions() {
    return {
      httpOnly: true,
      secure: env.cookie.secure,
      sameSite: env.cookie.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: env.cookie.secure,
      sameSite: env.cookie.sameSite,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    };
  }
}

module.exports = new AuthService();
