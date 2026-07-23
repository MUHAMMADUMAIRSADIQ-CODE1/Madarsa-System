const { body, param, query } = require('express-validator');
const { commonValidator } = require('./common.validator');

const createRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Module title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('course')
    .isMongoId()
    .withMessage('Valid course ID is required'),
];

const updateRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
];

const idParamRules = [
  param('id').isMongoId().withMessage('Invalid module ID format'),
];

const courseIdParamRules = [
  param('courseId').isMongoId().withMessage('Invalid course ID format'),
];

const reorderRules = [
  param('courseId').isMongoId().withMessage('Invalid course ID format'),
  body('moduleIds')
    .isArray({ min: 1 })
    .withMessage('moduleIds must be a non-empty array'),
  body('moduleIds.*')
    .isMongoId()
    .withMessage('Each module ID must be a valid MongoDB ID'),
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
  courseIdParamRules,
  reorderRules,
  paginationRules,
};
