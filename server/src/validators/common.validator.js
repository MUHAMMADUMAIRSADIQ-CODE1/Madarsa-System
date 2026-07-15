const { body, param, query } = require('express-validator');

const objectId = (field = 'id') =>
  param(field).isMongoId().withMessage(`Invalid ${field} format`);

const email = (field = 'email') =>
  body(field)
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .toLowerCase();

const password = (field = 'password') =>
  body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number');

const phone = (field = 'phone') =>
  body(field)
    .optional()
    .matches(/^\+?[\d\s-]{10,15}$/)
    .withMessage('Please provide a valid phone number');

const pagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  objectId,
  email,
  password,
  phone,
  pagination,
};
