const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const env = require('../config/env');
const User = require('../models/User.model');
const { ApiError, logger } = require('../utils');
const { httpStatus, messages, roles, USER_STATUS } = require('../constants');
const emailService = require('./email.service');
const AuditService = require('./audit.service');

class AuthService {
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

      if (user.status === USER_STATUS.PENDING) {
        throw new ApiError(httpStatus.FORBIDDEN, messages.TEACHER_PENDING_APPROVAL);
      }

      if (user.status === USER_STATUS.REJECTED) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account has been rejected');
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

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password +refreshToken');

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (!user.password) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password not set for this account');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Current password is incorrect');
    }

    // Update password (pre-save hook handles hashing)
    user.password = newPassword;
    // Invalidate all existing refresh tokens so user must login again
    user.refreshToken = null;
    await user.save();

    // Audit log
    AuditService.log({
      user: userId,
      action: 'change_password',
      module: 'auth',
      resourceId: userId,
      resourceType: 'User',
      description: 'Password changed',
      metadata: {},
    });

    // Send password changed email
    const { subject, html } = emailService.getPasswordChangedEmail(user.fullName);
    await emailService.sendEmail({ to: user.email, subject, html });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  async changeEmail(userId, newEmail, password) {
    const user = await User.findById(userId).select('+password +refreshToken');

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (!user.password) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password not set for this account');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password is incorrect');
    }

    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new ApiError(httpStatus.CONFLICT, messages.EMAIL_ALREADY_EXISTS);
    }

    const oldEmail = user.email;
    user.email = newEmail.toLowerCase();
    // Invalidate refresh tokens so user must login again with new email
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    // Audit log
    AuditService.log({
      user: userId,
      action: 'change_email',
      module: 'auth',
      resourceId: userId,
      resourceType: 'User',
      description: `Email changed from ${oldEmail} to ${newEmail}`,
      metadata: { oldEmail, newEmail },
    });

    // Send email changed notification
    const { subject, html } = emailService.getEmailChangedEmail(user.fullName, newEmail);
    await emailService.sendEmail({ to: user.email, subject, html });

    return user.toPublicJSON();
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return { message: messages.PASSWORD_RESET_EMAIL_SENT };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}&email=${user.email}`;

    const { subject, html } = emailService.getPasswordResetEmail(user.fullName, resetUrl);
    await emailService.sendEmail({ to: user.email, subject, html });

    logger.info(`Password reset email sent to: ${email}`);
    return { message: messages.PASSWORD_RESET_EMAIL_SENT };
  }

  async resetPassword(token, email, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    // Send password changed email
    const { subject: changedSubject, html: changedHtml } = emailService.getPasswordChangedEmail(user.fullName);
    await emailService.sendEmail({ to: user.email, subject: changedSubject, html: changedHtml });

    return { message: messages.PASSWORD_RESET_SUCCESS };
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
