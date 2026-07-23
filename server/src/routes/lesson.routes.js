const { Router } = require('express');
const lessonController = require('../controllers/lesson.controller');
const { authenticate, isTeacher } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { lessonValidator } = require('../validators');

const router = Router();

// ─── Teacher Routes (authenticated + teacher-only) ─────────
router.use(authenticate);
router.use(isTeacher);

// IMPORTANT: Specific routes must come before parameterized ones

// Reorder must be before :id routes
router.patch(
  '/reorder/:moduleId',
  validate(lessonValidator.moduleIdParamRules),
  validate(lessonValidator.reorderRules),
  lessonController.reorder
);

router.get(
  '/module/:moduleId',
  validate(lessonValidator.moduleIdParamRules),
  validate(lessonValidator.paginationRules),
  lessonController.getAll
);

router.get(
  '/:id',
  validate(lessonValidator.idParamRules),
  lessonController.getById
);

router.post(
  '/',
  validate(lessonValidator.createRules),
  lessonController.create
);

router.put(
  '/:id',
  validate(lessonValidator.idParamRules),
  validate(lessonValidator.updateRules),
  lessonController.update
);

router.delete(
  '/:id',
  validate(lessonValidator.idParamRules),
  lessonController.deleteLesson
);

router.patch(
  '/:id/publish',
  validate(lessonValidator.idParamRules),
  lessonController.publish
);

router.patch(
  '/:id/unpublish',
  validate(lessonValidator.idParamRules),
  lessonController.unpublish
);

module.exports = router;
