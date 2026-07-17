const { Router } = require('express');
const courseController = require('../controllers/course.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { uploadFields } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { courseValidator } = require('../validators');

const router = Router();

/**
 * Middleware to parse JSON-stringified array/object fields from multipart FormData.
 * Multer parses all non-file FormData fields as strings, so seoKeywords (sent as JSON.stringify(array))
 * arrives as a string instead of an array. This middleware converts it back before validation.
 */
function parseFormDataJsonFields(req, _res, next) {
  if (req.body && typeof req.body.seoKeywords === 'string') {
    try {
      req.body.seoKeywords = JSON.parse(req.body.seoKeywords);
    } catch (_) {
      // If JSON parsing fails, leave as-is — validation will catch the error
    }
  }
  next();
}

router.use(authenticate);
router.use(isAdmin);

router.get('/stats', courseController.getStats);

router.get('/', courseController.getAll);

router.get('/categories', courseController.getAllCategories);

router.post(
  '/categories',
  validate(courseValidator.categoryRules),
  courseController.createCategory
);

router.put(
  '/categories/:id',
  validate(courseValidator.categoryRules),
  courseController.updateCategory
);

router.delete(
  '/categories/:id',
  courseController.deleteCategory
);

router.post(
  '/',
  uploadFields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  parseFormDataJsonFields,
  validate(courseValidator.createCourseRules),
  courseController.create
);

router.put(
  '/:id',
  uploadFields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  parseFormDataJsonFields,
  validate(courseValidator.updateCourseRules),
  validate(courseValidator.idParamRules),
  courseController.update
);

router.delete(
  '/:id',
  validate(courseValidator.idParamRules),
  courseController.deleteCourse
);

router.patch(
  '/:id/publish',
  validate(courseValidator.idParamRules),
  courseController.publishCourse
);

router.patch(
  '/:id/unpublish',
  validate(courseValidator.idParamRules),
  courseController.unpublishCourse
);

router.patch(
  '/:id/archive',
  validate(courseValidator.idParamRules),
  courseController.archiveCourse
);

router.patch(
  '/:id/restore',
  validate(courseValidator.idParamRules),
  courseController.restoreCourse
);

router.post(
  '/:id/duplicate',
  validate(courseValidator.idParamRules),
  courseController.duplicateCourse
);

module.exports = router;
