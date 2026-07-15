const { body } = require('express-validator');
const { email, password, phone } = require('./common.validator');

const signupRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  email(),
  password(),
  phone().optional(),
  body('role')
    .optional()
    .isIn(['student', 'teacher'])
    .withMessage('Role must be student or teacher'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
];

const loginRules = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .optional()
    .notEmpty()
    .withMessage('Password is required'),
  body('idToken')
    .optional()
    .notEmpty()
    .withMessage('ID token is required'),
  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.idToken) {
      throw new Error('Email or idToken is required');
    }
    if (req.body.email && !req.body.password && !req.body.idToken) {
      throw new Error('Password is required when using email');
    }
    return true;
  }),
];

const forgotPasswordRules = [
  email(),
];

const resetPasswordRules = [
  body('oobCode')
    .notEmpty()
    .withMessage('Reset code is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

const verifyEmailRules = [
  body('oobCode')
    .notEmpty()
    .withMessage('Verification code is required'),
];

const refreshTokenRules = [
  body('refreshToken')
    .optional()
    .notEmpty()
    .withMessage('Refresh token is required'),
];

module.exports = {
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  verifyEmailRules,
  refreshTokenRules,
};
