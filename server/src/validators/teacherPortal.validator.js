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
  body('canTeachCourses')
    .optional()
    .isArray()
    .withMessage('Courses must be an array'),
  body('canTeachCourses.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid course ID'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID'),
];

const teacherIdParamRules = [
  param('teacherId')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
];

const createAssignmentRules = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  body('course')
    .notEmpty()
    .withMessage('Course is required')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('teacher')
    .notEmpty()
    .withMessage('Teacher is required')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('totalMarks')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total marks must be a positive number'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
];

const updateAssignmentRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  body('teacher')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('totalMarks')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total marks must be a positive number'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
];

const addMaterialRules = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('fileUrl')
    .notEmpty()
    .withMessage('File URL is required'),
  body('fileType')
    .optional()
    .trim()
    .isIn(['pdf', 'document', 'image', 'video', 'audio', 'other'])
    .withMessage('Invalid file type'),
];

module.exports = {
  updateProfileRules,
  idParamRules,
  teacherIdParamRules,
  createAssignmentRules,
  updateAssignmentRules,
  addMaterialRules,
};
