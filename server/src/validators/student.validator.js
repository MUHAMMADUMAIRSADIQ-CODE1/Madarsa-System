const { body, param } = require('express-validator');

const createStudentRules = [
  body('studentName')
    .trim()
    .notEmpty()
    .withMessage('Student name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  body('fatherName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Father name must not exceed 100 characters'),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^[\d\s\-\+\(\)]{7,30}$/)
    .withMessage('Invalid phone number'),
  body('whatsapp')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{7,30}$/)
    .withMessage('Invalid WhatsApp number'),
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
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('nationality')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nationality must not exceed 100 characters'),
  body('cnicPassport')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('CNIC/Passport must not exceed 50 characters'),
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
  body('previousEducation')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Previous education must not exceed 500 characters'),
  body('currentQualification')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Current qualification must not exceed 500 characters'),
  body('selectedCourse')
    .optional()
    .isMongoId()
    .withMessage('Invalid course ID'),
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
  body('learningMode')
    .optional()
    .isIn(['online', 'physical', 'both'])
    .withMessage('Learning mode must be online, physical, or both'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'graduated', 'suspended', 'transferred'])
    .withMessage('Status must be one of: active, inactive, graduated, suspended, transferred'),
];

const updateStudentRules = [
  body('studentName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{7,30}$/)
    .withMessage('Invalid phone number'),
  body('learningMode')
    .optional()
    .isIn(['online', 'physical', 'both'])
    .withMessage('Learning mode must be online, physical, or both'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'graduated', 'suspended', 'transferred'])
    .withMessage('Status must be one of: active, inactive, graduated, suspended, transferred'),
  body('rollNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Roll number must not exceed 50 characters'),
  body('enrollmentNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Enrollment number must not exceed 50 characters'),
];

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid student ID'),
];

const enrollCourseRules = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Invalid course ID'),
];

module.exports = {
  createStudentRules,
  updateStudentRules,
  idParamRules,
  enrollCourseRules,
};
