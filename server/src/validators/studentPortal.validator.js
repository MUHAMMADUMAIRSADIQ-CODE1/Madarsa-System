const { body, param } = require('express-validator');

const updateProfileRules = [
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{7,30}$/)
    .withMessage('Invalid phone number'),
  body('whatsapp')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{7,30}$/)
    .withMessage('Invalid WhatsApp number'),
  body('guardianPhone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{7,30}$/)
    .withMessage('Invalid guardian phone number'),
  body('guardianEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid guardian email'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
  body('preferredBatch')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Preferred batch must not exceed 100 characters'),
  body('preferredTiming')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Preferred timing must not exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters'),
  body('selectedCourses')
    .optional()
    .isArray()
    .withMessage('Selected courses must be an array'),
  body('selectedCourses.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid course ID in selectedCourses'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid student ID'),
];

module.exports = {
  updateProfileRules,
  idParamRules,
};
