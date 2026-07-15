const { body, param, query } = require('express-validator');
const { CMS_SECTIONS, CMS_STATUS } = require('../constants/cms');

const sectionParam = (name = 'section') =>
  param(name)
    .isIn(Object.values(CMS_SECTIONS))
    .withMessage(`Section must be one of: ${Object.values(CMS_SECTIONS).join(', ')}`);

const upsertContentRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Title must not exceed 500 characters'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Subtitle must not exceed 500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Description must not exceed 10000 characters'),
  body('identifier')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Identifier must not exceed 100 characters'),
  body('status')
    .optional()
    .isIn(Object.values(CMS_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CMS_STATUS).join(', ')}`),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*.url')
    .optional()
    .isString()
    .withMessage('Image URL must be a string'),
  body('images.*.alt')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Image alt text must not exceed 200 characters'),
  body('buttons')
    .optional()
    .isArray()
    .withMessage('Buttons must be an array'),
  body('buttons.*.label')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Button label must not exceed 100 characters'),
  body('buttons.*.url')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Button URL must not exceed 500 characters'),
  body('buttons.*.variant')
    .optional()
    .isIn(['primary', 'secondary', 'outline', 'ghost'])
    .withMessage('Button variant must be primary, secondary, outline, or ghost'),
  body('content')
    .optional()
    .isObject()
    .withMessage('Content must be an object'),
];

const publishRules = [
  sectionParam(),
];

const auditLogQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('module')
    .optional()
    .trim(),
  query('action')
    .optional()
    .trim(),
];

const updateSettingsRules = [
  body('settings')
    .isArray({ min: 1 })
    .withMessage('Settings must be a non-empty array'),
  body('settings.*.key')
    .notEmpty()
    .withMessage('Setting key is required')
    .trim(),
  body('settings.*.value')
    .notEmpty()
    .withMessage('Setting value is required'),
];

module.exports = {
  sectionParam,
  upsertContentRules,
  publishRules,
  auditLogQueryRules,
  updateSettingsRules,
};
