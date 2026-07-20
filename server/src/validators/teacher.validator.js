const { body, param } = require('express-validator');

const updateTeacherRules = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('shortBio')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short bio must not exceed 300 characters'),
  body('experience')
    .optional()
    .isInt({ min: 0, max: 70 })
    .withMessage('Experience must be between 0 and 70 years'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
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
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('LinkedIn must be a valid URL'),
  body('facebook')
    .optional()
    .trim()
    .isURL()
    .withMessage('Facebook must be a valid URL'),
  body('instagram')
    .optional()
    .trim()
    .isURL()
    .withMessage('Instagram must be a valid URL'),
  body('youtube')
    .optional()
    .trim()
    .isURL()
    .withMessage('YouTube must be a valid URL'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website must be a valid URL'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
];

const slugParamRules = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Teacher slug is required'),
];

const bulkAssignCoursesRules = [
  body('courseIds')
    .isArray({ min: 1 })
    .withMessage('Course IDs must be a non-empty array'),
  body('courseIds.*')
    .isMongoId()
    .withMessage('Each course ID must be a valid Mongo ID'),
];

module.exports = {
  updateTeacherRules,
  idParamRules,
  slugParamRules,
  bulkAssignCoursesRules,
};
