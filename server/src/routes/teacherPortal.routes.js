const { Router } = require('express');
const teacherPortalController = require('../controllers/teacherPortal.controller');
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, isTeacher } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { teacherPortalValidator, attendanceValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isTeacher);

router.get('/profile', teacherPortalController.getProfile);
router.get('/dashboard/:id', teacherPortalController.getDashboard);
router.get('/courses/:id', teacherPortalController.getCourses);
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

module.exports = router;
