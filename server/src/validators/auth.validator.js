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
  email(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordRules = [
  email(),
];

const resetPasswordRules = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  email(),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

const refreshTokenRules = [
  body('refreshToken')
    .optional()
    .notEmpty()
    .withMessage('Refresh token is required'),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

const changeEmailRules = [
  email('newEmail'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = {
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  refreshTokenRules,
  changePasswordRules,
  changeEmailRules,
};
