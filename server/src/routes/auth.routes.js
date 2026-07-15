const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { authValidator } = require('../validators');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = Router();

router.post(
  '/signup',
  authLimiter,
  validate(authValidator.signupRules),
  authController.signup
);

router.post(
  '/login',
  authLimiter,
  validate(authValidator.loginRules),
  authController.login
);

router.post('/logout', authenticate, authController.logout);

router.post(
  '/forgot-password',
  authLimiter,
  validate(authValidator.forgotPasswordRules),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validate(authValidator.resetPasswordRules),
  authController.resetPassword
);

router.post(
  '/verify-email',
  authLimiter,
  validate(authValidator.verifyEmailRules),
  authController.verifyEmail
);

router.get('/me', authenticate, authController.getMe);

router.post(
  '/refresh-token',
  validate(authValidator.refreshTokenRules),
  authController.refreshToken
);

module.exports = router;
