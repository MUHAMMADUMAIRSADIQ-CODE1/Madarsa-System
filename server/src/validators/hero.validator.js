const { body, param } = require('express-validator');
const { CMS_STATUS } = require('../constants/cms');

const upsertHeroRules = [
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
  body('badge')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Badge text must not exceed 200 characters'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('features.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each feature must not exceed 200 characters'),
  body('status')
    .optional()
    .isIn(Object.values(CMS_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CMS_STATUS).join(', ')}`),
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
  body('buttons.*.isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid hero content ID'),
];

module.exports = {
  upsertHeroRules,
  idParamRules,
};
