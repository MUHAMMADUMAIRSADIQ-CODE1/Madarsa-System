const { Router } = require('express');
const studentController = require('../controllers/student.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { studentValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/stats', studentController.getStats);

router.get('/', studentController.getAll);

router.get(
  '/:id',
  validate(studentValidator.idParamRules),
  studentController.getById
);

router.put(
  '/:id',
  validate(studentValidator.updateStudentRules),
  validate(studentValidator.idParamRules),
  studentController.update
);

router.delete(
  '/:id',
  validate(studentValidator.idParamRules),
  studentController.deleteStudent
);

router.patch(
  '/:id/restore',
  validate(studentValidator.idParamRules),
  studentController.restoreStudent
);

router.patch(
  '/:id/activate',
  validate(studentValidator.idParamRules),
  studentController.activateStudent
);

router.patch(
  '/:id/deactivate',
  validate(studentValidator.idParamRules),
  studentController.deactivateStudent
);

router.post(
  '/:id/enroll',
  validate(studentValidator.idParamRules),
  validate(studentValidator.enrollCourseRules),
  studentController.enrollCourse
);

router.get(
  '/:id/courses',
  validate(studentValidator.idParamRules),
  studentController.getEnrolledCourses
);

module.exports = router;
