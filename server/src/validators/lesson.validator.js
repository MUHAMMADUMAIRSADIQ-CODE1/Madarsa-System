const { body, param, query } = require('express-validator');

const createRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('lessonType')
    .trim()
    .notEmpty()
    .withMessage('Lesson type is required')
    .isIn(['video', 'pdf', 'document', 'external_link', 'text'])
    .withMessage('Invalid lesson type'),
  body('videoUrl')
    .if(body('lessonType').equals('video'))
    .trim()
    .notEmpty()
    .withMessage('YouTube URL is required for video lessons'),
  body('pdfUrl')
    .if(body('lessonType').equals('pdf'))
    .trim()
    .notEmpty()
    .withMessage('PDF URL is required for PDF lessons'),
  body('documentUrl')
    .if(body('lessonType').equals('document'))
    .trim()
    .notEmpty()
    .withMessage('Document URL is required for document lessons'),
  body('externalUrl')
    .if(body('lessonType').equals('external_link'))
    .trim()
    .notEmpty()
    .withMessage('URL is required for external link lessons'),
  body('textContent')
    .if(body('lessonType').equals('text'))
    .trim()
    .notEmpty()
    .withMessage('Content is required for text lessons'),
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Duration must not exceed 50 characters'),
  body('module')
    .isMongoId()
    .withMessage('Valid module ID is required'),
  body('isPreviewFree')
    .optional()
    .isBoolean()
    .withMessage('isPreviewFree must be a boolean'),
];

const updateRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('lessonType')
    .optional()
    .trim()
    .isIn(['video', 'pdf', 'document', 'external_link', 'text'])
    .withMessage('Invalid lesson type'),
  body('videoUrl')
    .optional()
    .trim(),
  body('pdfUrl')
    .optional()
    .trim(),
  body('documentUrl')
    .optional()
    .trim(),
  body('externalUrl')
    .optional()
    .trim(),
  body('textContent')
    .optional()
    .trim(),
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Duration must not exceed 50 characters'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('isPreviewFree')
    .optional()
    .isBoolean()
    .withMessage('isPreviewFree must be a boolean'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
];

const idParamRules = [
  param('id').isMongoId().withMessage('Invalid lesson ID format'),
];

const moduleIdParamRules = [
  param('moduleId').isMongoId().withMessage('Invalid module ID format'),
];

const reorderRules = [
  param('moduleId').isMongoId().withMessage('Invalid module ID format'),
  body('lessonIds')
    .isArray({ min: 1 })
    .withMessage('lessonIds must be a non-empty array'),
  body('lessonIds.*')
    .isMongoId()
    .withMessage('Each lesson ID must be a valid MongoDB ID'),
];

const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createRules,
  updateRules,
  idParamRules,
  moduleIdParamRules,
  reorderRules,
  paginationRules,
};
