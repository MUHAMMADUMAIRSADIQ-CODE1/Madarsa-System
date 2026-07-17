const bcrypt = require('bcrypt');
const { ApiResponse, asyncHandler, ApiError, logger } = require('../utils');
const { httpStatus, messages, roles, USER_STATUS } = require('../constants');
const { AuthService, UserService, StudentService, TeacherService, AuditService } = require('../services');
const User = require('../models/User.model');
const emailService = require('../services/email.service');

const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, country, city, gender, role } = req.body;
  const userRole = role || roles.STUDENT;

  if (userRole === roles.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Admin accounts cannot be created through signup');
  }

  const existingUser = await UserService.getByEmail(email);
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, messages.EMAIL_ALREADY_EXISTS);
  }

  // Both teachers and students start as PENDING
  const statusForRole = USER_STATUS.PENDING;

  const nameParts = fullName.trim().split(/\s+/);
  const userData = {
    email,
    fullName,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    password,
    phone: phone || '',
    role: userRole,
    status: statusForRole,
    country: country || '',
    city: city || '',
    gender: gender || '',
  };

  const user = await UserService.create(userData);

  // Send registration pending email
  const { subject, html } = emailService.getRegistrationPendingEmail(fullName, userRole);
  await emailService.sendEmail({ to: email, subject, html });

  // Audit log
  // Create corresponding Student or Teacher profile record
  try {
    if (userRole === roles.STUDENT) {
      await StudentService.create({
        user: user._id,
        studentName: fullName,
        email,
        phone: phone || '',
        country: country || '',
        city: city || '',
        gender: gender || '',
        createdBy: user._id,
        updatedBy: user._id,
      });
    } else if (userRole === roles.TEACHER) {
      await TeacherService.create({
        user: user._id,
        fullName,
        email,
        phone: phone || '',
        country: country || '',
        city: city || '',
        gender: gender || '',
        createdBy: user._id,
        updatedBy: user._id,
      });
    }
  } catch (profileError) {
    logger.error(`Failed to create ${userRole} profile for ${email}:`, profileError.message);
  }

  AuditService.log({
    user: user._id,
    action: 'signup',
    module: 'auth',
    resourceId: user._id,
    resourceType: 'User',
    description: `${userRole} signed up (pending): ${email}`,
    metadata: { role: userRole, email },
  });

  logger.info(`${userRole} created (pending): ${email}`);

  res.status(201).json(
    ApiResponse.created(messages.SIGNUP_SUCCESS, {
      user: user.toPublicJSON(),
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password +refreshToken'
  );

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, messages.INVALID_CREDENTIALS);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, messages.INVALID_CREDENTIALS);
  }

  // Check status
  if (user.status === USER_STATUS.PENDING) {
    throw new ApiError(httpStatus.FORBIDDEN, messages.TEACHER_PENDING_APPROVAL);
  }

  if (user.status === USER_STATUS.REJECTED) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Your account has been rejected. Reason: ${user.rejectionReason || 'Not specified'}`
    );
  }

  if (user.status === USER_STATUS.BLOCKED) {
    throw new ApiError(httpStatus.FORBIDDEN, messages.USER_BLOCKED);
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, messages.USER_BLOCKED);
  }

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const tokens = AuthService.generateTokens(payload);

  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  AuthService.updateLastLogin(user._id);

  res.cookie('refreshToken', tokens.refreshToken, AuthService.getRefreshCookieOptions());
  res.cookie('accessToken', tokens.accessToken, AuthService.getCookieOptions());

  res.status(200).json(
    ApiResponse.success(messages.LOGIN_SUCCESS, {
      user: user.toPublicJSON(),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    })
  );
});

const logout = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
  }

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.clearCookie('accessToken');

  res.status(200).json(ApiResponse.success(messages.LOGOUT_SUCCESS));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await AuthService.forgotPassword(email);

  res.status(200).json(ApiResponse.success(result.message));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, newPassword } = req.body;

  if (!token || !email || !newPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token, email, and new password are required');
  }

  if (newPassword.length < 8) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New password must be at least 8 characters');
  }

  const result = await AuthService.resetPassword(token, email, newPassword);

  res.status(200).json(ApiResponse.success(result.message));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getUserProfile(req.user.id);

  res.status(200).json(
    ApiResponse.success('Profile fetched successfully', user)
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, messages.SESSION_EXPIRED);
  }

  const tokens = await AuthService.refreshAccessToken(incomingRefreshToken);

  res.cookie('refreshToken', tokens.refreshToken, AuthService.getRefreshCookieOptions());
  res.cookie('accessToken', tokens.accessToken, AuthService.getCookieOptions());

  res.status(200).json(
    ApiResponse.success(messages.TOKEN_REFRESHED, {
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    })
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json(ApiResponse.success(result.message));
});

const completeProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.completeProfile(req.user.id);
  res.status(200).json(
    ApiResponse.success('Profile marked as complete successfully', user)
  );
});

const changeEmail = asyncHandler(async (req, res) => {
  const { newEmail, password } = req.body;

  const user = await AuthService.changeEmail(req.user.id, newEmail, password);

  res.status(200).json(
    ApiResponse.success('Email changed successfully', user)
  );
});

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  refreshToken,
  changePassword,
  changeEmail,
  completeProfile,
};
