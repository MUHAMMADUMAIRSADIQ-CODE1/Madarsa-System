const { Router } = require('express');
const studentPortalController = require('../controllers/studentPortal.controller');
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, isStudent, requireProfileComplete } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { studentPortalValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isStudent);

// Profile completion check on all routes except profile data endpoints
router.get('/profile', studentPortalController.getProfile);
router.get('/dashboard/:id', requireProfileComplete, studentPortalController.getDashboard);

router.get(
  '/profile/:id',
  validate(studentPortalValidator.idParamRules),
  studentPortalController.getProfileById
);

router.put(
  '/profile/:id',
  validate(studentPortalValidator.idParamRules),
  validate(studentPortalValidator.updateProfileRules),
  studentPortalController.updateProfile
);

router.get(
  '/attendance/:studentId',
  attendanceController.getStudentAttendance
);

// =================== ASSIGNMENTS ===================

router.get(
  '/assignments/course/:courseId',
  studentPortalController.getCourseAssignments
);

router.post(
  '/assignments/:id/submit',
  studentPortalController.submitAssignment
);

router.get(
  '/submissions',
  studentPortalController.getMySubmissions
);

// =================== RESULTS ===================

router.get(
  '/results/course/:courseId',
  studentPortalController.getCourseResults
);

// =================== ANNOUNCEMENTS ===================

router.get(
  '/announcements/course/:courseId',
  studentPortalController.getCourseAnnouncements
);

module.exports = router;
