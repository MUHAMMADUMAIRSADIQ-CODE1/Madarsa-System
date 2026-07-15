const { body, param, query } = require('express-validator');

const createCourseRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description must not exceed 300 characters'),
  body('fullDescription')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Full description must not exceed 10000 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('categoryName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters'),
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'all'])
    .withMessage('Level must be one of: beginner, intermediate, advanced, all'),
  body('language')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Language must not exceed 50 characters'),
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Duration must not exceed 100 characters'),
  body('totalLessons')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total lessons must be a non-negative integer'),
  body('certificateAvailable')
    .optional()
    .isBoolean()
    .withMessage('Certificate available must be a boolean'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('popular')
    .optional()
    .isBoolean()
    .withMessage('Popular must be a boolean'),
  body('trending')
    .optional()
    .isBoolean()
    .withMessage('Trending must be a boolean'),
  body('maxStudents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max students must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('introVideoUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Intro video URL must be a valid URL'),
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

const updateCourseRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description must not exceed 300 characters'),
  body('fullDescription')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Full description must not exceed 10000 characters'),
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'all'])
    .withMessage('Level must be one of: beginner, intermediate, advanced, all'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('popular')
    .optional()
    .isBoolean()
    .withMessage('Popular must be a boolean'),
  body('trending')
    .optional()
    .isBoolean()
    .withMessage('Trending must be a boolean'),
  body('certificateAvailable')
    .optional()
    .isBoolean()
    .withMessage('Certificate available must be a boolean'),
  body('maxStudents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max students must be a non-negative integer'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('introVideoUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Intro video URL must be a valid URL'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid course ID'),
];

const slugParamRules = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Course slug is required'),
];

const categoryRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Category description must not exceed 500 characters'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
];

module.exports = {
  createCourseRules,
  updateCourseRules,
  idParamRules,
  slugParamRules,
  categoryRules,
};
