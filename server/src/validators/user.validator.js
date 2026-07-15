const { body } = require('express-validator');
const { phone } = require('./common.validator');

const updateProfileRules = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  phone().optional(),
  body('profileImage')
    .optional()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
];

module.exports = { updateProfileRules };
