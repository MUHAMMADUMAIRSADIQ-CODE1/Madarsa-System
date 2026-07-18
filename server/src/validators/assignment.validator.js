const { body, param } = require('express-validator');

const assignStudentRules = [
  body('teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid student ID'),
];

const removeStudentRules = [
  body('teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid student ID'),
];

const reassignStudentRules = [
  body('teacherId')
    .notEmpty()
    .withMessage('New teacher ID is required')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid student ID'),
];

const bulkAssignRules = [
  body('teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('Student IDs must be a non-empty array'),
  body('studentIds.*')
    .isMongoId()
    .withMessage('Each student ID must be a valid Mongo ID'),
];

const teacherIdParamRules = [
  param('teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
];

const studentIdParamRules = [
  param('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid student ID'),
];

module.exports = {
  assignStudentRules,
  removeStudentRules,
  reassignStudentRules,
  bulkAssignRules,
  teacherIdParamRules,
  studentIdParamRules,
};
