const { body, param } = require('express-validator');

const createTeacherRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('shortBio')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short bio must not exceed 300 characters'),
  body('biography')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Biography must not exceed 5000 characters'),
  body('qualification')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Qualification must not exceed 200 characters'),
  body('degree')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Degree must not exceed 200 characters'),
  body('experience')
    .optional()
    .isInt({ min: 0, max: 70 })
    .withMessage('Experience must be between 0 and 70 years'),
  body('specialization')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Specialization must not exceed 200 characters'),
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
  body('nationality')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nationality must not exceed 100 characters'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('availableForOnline')
    .optional()
    .isBoolean()
    .withMessage('Available for online must be a boolean'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('seoTitle')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('SEO title must not exceed 200 characters'),
  body('seoDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('SEO description must not exceed 500 characters'),
  body('seoKeywords')
    .optional()
    .isArray()
    .withMessage('SEO keywords must be an array'),
  body('seoKeywords.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each keyword must not exceed 50 characters'),
];

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
  body('biography')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Biography must not exceed 5000 characters'),
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
  body('availableForOnline')
    .optional()
    .isBoolean()
    .withMessage('Available for online must be a boolean'),
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

module.exports = {
  createTeacherRules,
  updateTeacherRules,
  idParamRules,
  slugParamRules,
};
