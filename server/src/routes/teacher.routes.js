const { Router } = require('express');
const teacherController = require('../controllers/teacher.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { uploadFields } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { teacherValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/stats', teacherController.getStats);

router.get('/', teacherController.getAll);

router.put(
  '/:id',
  uploadFields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  validate(teacherValidator.updateTeacherRules),
  validate(teacherValidator.idParamRules),
  teacherController.update
);

router.delete(
  '/:id',
  validate(teacherValidator.idParamRules),
  teacherController.deleteTeacher
);

router.patch(
  '/:id/publish',
  validate(teacherValidator.idParamRules),
  teacherController.publishTeacher
);

router.patch(
  '/:id/unpublish',
  validate(teacherValidator.idParamRules),
  teacherController.unpublishTeacher
);

router.patch(
  '/:id/archive',
  validate(teacherValidator.idParamRules),
  teacherController.archiveTeacher
);

router.patch(
  '/:id/restore',
  validate(teacherValidator.idParamRules),
  teacherController.restoreTeacher
);

router.post(
  '/:id/duplicate',
  validate(teacherValidator.idParamRules),
  teacherController.duplicateTeacher
);

router.post(
  '/:id/assign-course',
  validate(teacherValidator.idParamRules),
  teacherController.assignCourse
);

router.post(
  '/:id/remove-course',
  validate(teacherValidator.idParamRules),
  teacherController.removeCourse
);

router.post(
  '/:id/bulk-assign-courses',
  validate(teacherValidator.idParamRules),
  validate(teacherValidator.bulkAssignCoursesRules),
  teacherController.bulkAssignCourses
);

router.get(
  '/:id/assigned-courses',
  validate(teacherValidator.idParamRules),
  teacherController.getAssignedCourses
);

router.get(
  '/:id/assignable-courses',
  validate(teacherValidator.idParamRules),
  teacherController.getAssignableCourses
);

module.exports = router;
