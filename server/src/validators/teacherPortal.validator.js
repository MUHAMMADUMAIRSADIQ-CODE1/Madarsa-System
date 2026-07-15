const { body, param, query } = require('express-validator');

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
  body('biography')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Biography must not exceed 5000 characters'),
  body('shortBio')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short bio must not exceed 300 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array'),
  body('teachingLanguages')
    .optional()
    .isArray()
    .withMessage('Teaching languages must be an array'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
];

module.exports = {
  updateProfileRules,
  idParamRules,
};
