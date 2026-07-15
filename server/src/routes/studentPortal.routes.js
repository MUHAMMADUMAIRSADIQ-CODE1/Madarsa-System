const { Router } = require('express');
const studentPortalController = require('../controllers/studentPortal.controller');
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, isStudent } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { studentPortalValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isStudent);

router.get('/profile', studentPortalController.getProfile);
router.get('/dashboard/:id', studentPortalController.getDashboard);

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

module.exports = router;
