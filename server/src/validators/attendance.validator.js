const { body, param, query } = require('express-validator');

const createAttendanceRules = [
  body('student')
    .notEmpty()
    .withMessage('Student is required')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('course')
    .notEmpty()
    .withMessage('Course is required')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('classDate')
    .notEmpty()
    .withMessage('Class date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['present', 'absent', 'late', 'excused'])
    .withMessage('Status must be present, absent, late, or excused'),
  body('batch')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('classTime')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('onlineSessionId')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters'),
];

const updateAttendanceRules = [
  body('status')
    .optional()
    .isIn(['present', 'absent', 'late', 'excused'])
    .withMessage('Status must be present, absent, late, or excused'),
  body('batch')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('classTime')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('onlineSessionId')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid attendance record ID'),
];

module.exports = {
  createAttendanceRules,
  updateAttendanceRules,
  idParamRules,
};
