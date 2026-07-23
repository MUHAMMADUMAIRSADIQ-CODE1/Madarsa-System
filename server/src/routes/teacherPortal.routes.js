const { Router } = require('express');
const teacherPortalController = require('../controllers/teacherPortal.controller');
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, isTeacher, requireProfileComplete } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { teacherPortalValidator, attendanceValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isTeacher);

router.get('/profile', teacherPortalController.getProfile);
router.get('/dashboard/:id', requireProfileComplete, teacherPortalController.getDashboard);
router.get('/courses/:id', teacherPortalController.getCourses);

// IMPORTANT: Specific routes must come before parameterized ones to avoid Express matching ':id' as 'assigned'
router.get('/students/assigned/:teacherId', teacherPortalController.getAssignedStudents);
router.get('/students/:id', teacherPortalController.getStudents);

router.get(
  '/profile/:id',
  validate(teacherPortalValidator.idParamRules),
  teacherPortalController.getProfileById
);

router.put(
  '/profile/:id',
  validate(teacherPortalValidator.idParamRules),
  validate(teacherPortalValidator.updateProfileRules),
  teacherPortalController.updateProfile
);

router.get(
  '/attendance/:teacherId',
  attendanceController.getTeacherAttendance
);

router.post(
  '/attendance',
  validate(attendanceValidator.createAttendanceRules),
  attendanceController.create
);

router.put(
  '/attendance/:id',
  validate(attendanceValidator.idParamRules),
  validate(attendanceValidator.updateAttendanceRules),
  attendanceController.update
);

router.post(
  '/attendance/bulk',
  attendanceController.bulkMark
);

router.post(
  '/attendance/mark-all-present',
  attendanceController.markAll
);

// =================== ASSIGNMENTS ===================

router.get(
  '/assignments/:teacherId',
  validate(teacherPortalValidator.teacherIdParamRules),
  teacherPortalController.getAssignments
);

router.get(
  '/assignments/detail/:id',
  validate(teacherPortalValidator.idParamRules),
  teacherPortalController.getAssignment
);

router.post(
  '/assignments',
  validate(teacherPortalValidator.createAssignmentRules),
  teacherPortalController.createAssignment
);

router.put(
  '/assignments/:id',
  validate(teacherPortalValidator.idParamRules),
  validate(teacherPortalValidator.updateAssignmentRules),
  teacherPortalController.updateAssignment
);

router.delete(
  '/assignments/:id',
  validate(teacherPortalValidator.idParamRules),
  teacherPortalController.deleteAssignment
);

// ─── Grade Submission ───────────────────────────────────
router.post(
  '/assignments/:id/grade/:studentId',
  validate(teacherPortalValidator.idParamRules),
  teacherPortalController.gradeSubmission
);

// =================== COURSE DETAILS ===================

router.get(
  '/courses/:teacherId/:courseId',
  teacherPortalController.getCourseDetails
);

// =================== SCHEDULE ===================

router.get(
  '/schedule/:teacherId',
  validate(teacherPortalValidator.teacherIdParamRules),
  teacherPortalController.getSchedule
);

// =================== COURSE MATERIALS ===================

router.get(
  '/courses/:courseId/materials',
  teacherPortalController.getCourseMaterials
);

router.post(
  '/courses/:courseId/materials',
  validate(teacherPortalValidator.addMaterialRules),
  teacherPortalController.addCourseMaterial
);

router.delete(
  '/courses/:courseId/materials/:materialIndex',
  teacherPortalController.deleteCourseMaterial
);

module.exports = router;
