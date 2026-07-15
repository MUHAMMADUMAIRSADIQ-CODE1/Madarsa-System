const { body, param } = require('express-validator');
const { CMS_STATUS } = require('../constants/cms');

const upsertFooterRules = [
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Footer description must not exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(Object.values(CMS_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CMS_STATUS).join(', ')}`),
  body('content.quickLinks')
    .optional()
    .isArray()
    .withMessage('Quick links must be an array'),
  body('content.quickLinks.*.label')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Quick link label must not exceed 100 characters'),
  body('content.quickLinks.*.url')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Quick link URL must not exceed 500 characters'),
  body('content.usefulLinks')
    .optional()
    .isArray()
    .withMessage('Useful links must be an array'),
  body('content.usefulLinks.*.label')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Useful link label must not exceed 100 characters'),
  body('content.usefulLinks.*.url')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Useful link URL must not exceed 500 characters'),
  body('content.supportLinks')
    .optional()
    .isArray()
    .withMessage('Support links must be an array'),
  body('content.supportLinks.*.label')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Support link label must not exceed 100 characters'),
  body('content.supportLinks.*.url')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Support link URL must not exceed 500 characters'),
  body('content.contactBlock.email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid contact email is required'),
  body('content.contactBlock.phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid contact phone is required'),
  body('content.contactBlock.address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Contact address must not exceed 500 characters'),
  body('content.socialLinks')
    .optional()
    .isArray()
    .withMessage('Social links must be an array'),
  body('content.socialLinks.*.platform')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Social platform name must not exceed 50 characters'),
  body('content.socialLinks.*.url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid social link URL is required'),
  body('content.socialLinks.*.icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Social icon name must not exceed 50 characters'),
  body('content.copyright')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Copyright text must not exceed 500 characters'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid footer content ID'),
];

module.exports = { upsertFooterRules, idParamRules };
