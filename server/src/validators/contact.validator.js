const { body, param } = require('express-validator');
const { CMS_STATUS } = require('../constants/cms');

const upsertContactRules = [
  body('status')
    .optional()
    .isIn(Object.values(CMS_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CMS_STATUS).join(', ')}`),
  body('content.email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  body('content.primaryPhone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid primary phone number is required'),
  body('content.secondaryPhone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid secondary phone number is required'),
  body('content.whatsapp')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid WhatsApp number is required'),
  body('content.address')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  body('content.mapUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid Google Maps URL is required'),
  body('content.officeTiming')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Office timing must not exceed 500 characters'),
  body('content.emergencyContact')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid emergency contact number is required'),
  body('content.admissionContact')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid admission contact number is required'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contact content ID'),
];

module.exports = { upsertContactRules, idParamRules };
