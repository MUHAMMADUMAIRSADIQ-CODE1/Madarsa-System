const { Router } = require('express');
const moduleController = require('../controllers/module.controller');
const { authenticate, isTeacher } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { moduleValidator } = require('../validators');

const router = Router();

// ─── Teacher Routes (authenticated + teacher-only) ─────────
router.use(authenticate);
router.use(isTeacher);

// IMPORTANT: Specific routes must come before parameterized ones

// Reorder must be before :id routes to avoid matching 'reorder' as an id
router.patch(
  '/reorder/:courseId',
  validate(moduleValidator.courseIdParamRules),
  validate(moduleValidator.reorderRules),
  moduleController.reorder
);

router.get(
  '/course/:courseId',
  validate(moduleValidator.courseIdParamRules),
  validate(moduleValidator.paginationRules),
  moduleController.getAll
);

router.get(
  '/:id',
  validate(moduleValidator.idParamRules),
  moduleController.getById
);

router.post(
  '/',
  validate(moduleValidator.createRules),
  moduleController.create
);

router.put(
  '/:id',
  validate(moduleValidator.idParamRules),
  validate(moduleValidator.updateRules),
  moduleController.update
);

router.delete(
  '/:id',
  validate(moduleValidator.idParamRules),
  moduleController.deleteModule
);

router.patch(
  '/:id/publish',
  validate(moduleValidator.idParamRules),
  moduleController.publish
);

router.patch(
  '/:id/unpublish',
  validate(moduleValidator.idParamRules),
  moduleController.unpublish
);

module.exports = router;
