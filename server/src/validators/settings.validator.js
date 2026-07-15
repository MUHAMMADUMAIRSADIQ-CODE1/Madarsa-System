const { body, param } = require('express-validator');
const { CMS_STATUS } = require('../constants/cms');

const upsertSettingsRules = [
  body('status')
    .optional()
    .isIn(Object.values(CMS_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CMS_STATUS).join(', ')}`),
  body('content.academyName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Academy name must not exceed 200 characters'),
  body('content.shortName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Short name must not exceed 50 characters'),
  body('content.primaryColor')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Primary color must be a valid hex color'),
  body('content.secondaryColor')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Secondary color must be a valid hex color'),
  body('content.accentColor')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Accent color must be a valid hex color'),
  body('content.websiteEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid website email is required'),
  body('content.websitePhone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid website phone number is required'),
  body('content.timezone')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Timezone must not exceed 100 characters'),
  body('content.language')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Language must not exceed 50 characters'),
  body('content.copyrightText')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Copyright text must not exceed 500 characters'),
  body('content.footerText')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Footer text must not exceed 1000 characters'),
  body('content.socialLinks')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
  body('content.socialLinks.facebook')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid Facebook URL is required'),
  body('content.socialLinks.instagram')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid Instagram URL is required'),
  body('content.socialLinks.youtube')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid YouTube URL is required'),
  body('content.socialLinks.twitter')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid Twitter URL is required'),
  body('content.socialLinks.whatsapp')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid WhatsApp URL is required'),
  body('content.socialLinks.telegram')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid Telegram URL is required'),
  body('content.socialLinks.linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid LinkedIn URL is required'),
  body('content.socialLinks.tiktok')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid TikTok URL is required'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid settings ID'),
];

module.exports = { upsertSettingsRules, idParamRules };
