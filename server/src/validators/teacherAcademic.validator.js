const { body, param } = require('express-validator');

const createResultRules = [
  body('student').notEmpty().isMongoId().withMessage('Valid student ID is required'),
  body('course').notEmpty().isMongoId().withMessage('Valid course ID is required'),
  body('teacher').notEmpty().isMongoId().withMessage('Valid teacher ID is required'),
  body('examName').notEmpty().trim().isLength({ max: 200 }).withMessage('Exam name is required'),
  body('totalMarks').notEmpty().isInt({ min: 1 }).withMessage('Total marks must be a positive number'),
  body('obtainedMarks').optional().isInt({ min: 0 }).withMessage('Obtained marks must be a non-negative number'),
  body('examDate').optional().isISO8601().withMessage('Invalid date format'),
  body('remarks').optional().trim().isLength({ max: 1000 }),
];

const createAnnouncementRules = [
  body('teacher').notEmpty().isMongoId().withMessage('Valid teacher ID is required'),
  body('title').notEmpty().trim().isLength({ max: 300 }).withMessage('Title is required'),
  body('content').notEmpty().trim().isLength({ max: 10000 }).withMessage('Content is required'),
  body('targetType').optional().isIn(['all', 'course', 'batch', 'class']).withMessage('Invalid target type'),
  body('targetCourse').optional().isMongoId().withMessage('Invalid course ID'),
  body('targetBatch').optional().trim().isLength({ max: 100 }),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be boolean'),
];

const sendMessageRules = [
  body('content').notEmpty().trim().isLength({ max: 5000 }).withMessage('Message content is required'),
  body('conversationId').optional().isMongoId().withMessage('Invalid conversation ID'),
  body('recipientId').optional().isMongoId().withMessage('Invalid recipient ID'),
  body('recipientRole').optional().isIn(['teacher', 'student', 'admin']).withMessage('Invalid recipient role'),
  body('senderRole').optional().isIn(['teacher', 'student', 'admin']).withMessage('Invalid sender role'),
  body('subject').optional().trim().isLength({ max: 300 }),
];

module.exports = {
  createResultRules,
  createAnnouncementRules,
  sendMessageRules,
};
