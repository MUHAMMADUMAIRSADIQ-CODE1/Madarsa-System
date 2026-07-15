const { ApiResponse, asyncHandler, ApiError, logger } = require('../utils');
const { httpStatus, messages, roles, USER_STATUS } = require('../constants');
const { AuthService, UserService } = require('../services');
const User = require('../models/User.model');

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

  const firebaseUser = await AuthService.createFirebaseUser(email, password);

  const statusForRole = userRole === roles.TEACHER
    ? USER_STATUS.PENDING
    : USER_STATUS.ACTIVE;

  const nameParts = fullName.trim().split(/\s+/);
  const userData = {
    firebaseUid: firebaseUser.uid,
    email,
    fullName,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    phone: phone || '',
    role: userRole,
    status: statusForRole,
    country: country || '',
    city: city || '',
    gender: gender || '',
    isEmailVerified: false,
  };

  const user = await UserService.create(userData);

  try {
    await AuthService.generateEmailVerificationLink(email);
  } catch (linkError) {
    logger.error('Failed to send verification email:', linkError);
  }

  res.status(201).json(
    ApiResponse.created(messages.SIGNUP_SUCCESS, {
      user: user.toPublicJSON(),
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password, idToken } = req.body;

  let firebaseUid;
  let firebaseEmail;

  if (idToken) {
    const decodedToken = await AuthService.verifyFirebaseIdToken(idToken);
    firebaseUid = decodedToken.uid;
    firebaseEmail = decodedToken.email || email;
  } else if (email && password) {
    const authResponse = await AuthService.authenticateWithFirebase(email, password);
    firebaseUid = authResponse.localId;
    firebaseEmail = authResponse.email;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email and password or idToken are required');
  }

  let user = await UserService.findByFirebaseUidOrEmail(firebaseUid, firebaseEmail);

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, messages.USER_NOT_FOUND);
  }

  if (!user.isEmailVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, messages.EMAIL_NOT_VERIFIED);
  }

  if (user.status === USER_STATUS.BLOCKED) {
    throw new ApiError(httpStatus.FORBIDDEN, messages.USER_BLOCKED);
  }

  if (user.status === USER_STATUS.PENDING) {
    throw new ApiError(httpStatus.FORBIDDEN, messages.TEACHER_PENDING_APPROVAL);
  }

  if (!user.firebaseUid) {
    user.firebaseUid = firebaseUid;
    await user.save({ validateBeforeSave: false });
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

  const user = await UserService.getByEmail(email);

  if (!user) {
    res.status(200).json(
      ApiResponse.success(messages.PASSWORD_RESET_EMAIL_SENT)
    );
    return;
  }

  await AuthService.generatePasswordResetLink(email);

  res.status(200).json(
    ApiResponse.success(messages.PASSWORD_RESET_EMAIL_SENT)
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { oobCode, newPassword } = req.body;

  if (!oobCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reset code is required');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New password must be at least 8 characters');
  }

  const firebaseApiKey = require('../config/env').firebase.webApiKey;
  if (!firebaseApiKey) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Password reset is not configured'
    );
  }

  const https = require('https');
  const requestBody = JSON.stringify({
    oobCode,
    newPassword,
  });

  await new Promise((resolve, reject) => {
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:resetPassword?key=${firebaseApiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new ApiError(httpStatus.BAD_REQUEST, response.error.message || 'Invalid reset code'));
          } else {
            resolve(response);
          }
        } catch {
          reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Password reset service error'));
        }
      });
    });

    req.on('error', () => {
      reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Password reset service unavailable'));
    });

    req.write(requestBody);
    req.end();
  });

  res.status(200).json(
    ApiResponse.success(messages.PASSWORD_RESET_SUCCESS)
  );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { oobCode } = req.body;

  if (!oobCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Verification code is required');
  }

  const firebaseApiKey = require('../config/env').firebase.webApiKey;
  if (!firebaseApiKey) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Email verification is not configured'
    );
  }

  const https = require('https');
  const requestBody = JSON.stringify({ oobCode });

  const response = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:update?key=${firebaseApiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new ApiError(httpStatus.BAD_REQUEST, parsed.error.message || 'Invalid verification code'));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Verification service error'));
        }
      });
    });

    req.on('error', () => {
      reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Verification service unavailable'));
    });

    req.write(requestBody);
    req.end();
  });

  const email = response.email;

  if (email) {
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isEmailVerified: true }
    );
  }

  res.status(200).json(
    ApiResponse.success(messages.EMAIL_VERIFIED)
  );
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

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
  refreshToken,
};
