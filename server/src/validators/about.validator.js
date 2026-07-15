const { body, param } = require('express-validator');
const { CMS_STATUS } = require('../constants/cms');

const upsertAboutRules = [
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
  body('status')
    .optional()
    .isIn(Object.values(CMS_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CMS_STATUS).join(', ')}`),
  body('content.history')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('History must not exceed 10000 characters'),
  body('content.mission')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Mission must not exceed 5000 characters'),
  body('content.vision')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Vision must not exceed 5000 characters'),
  body('content.principalMessage')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Principal message must not exceed 10000 characters'),
  body('content.coreValues')
    .optional()
    .isArray()
    .withMessage('Core values must be an array'),
  body('content.coreValues.*.title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Core value title must not exceed 200 characters'),
  body('content.coreValues.*.description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Core value description must not exceed 1000 characters'),
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
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid about content ID'),
];

module.exports = { upsertAboutRules, idParamRules };
