const { Router } = require('express');
const heroController = require('../controllers/hero.controller');
const aboutController = require('../controllers/about.controller');
const contactController = require('../controllers/contact.controller');
const settingsController = require('../controllers/settings.controller');
const footerController = require('../controllers/footer.controller');
const courseController = require('../controllers/course.controller');
const teacherController = require('../controllers/teacher.controller');
const admissionController = require('../controllers/admission.controller');
const moduleController = require('../controllers/module.controller');
const lessonController = require('../controllers/lesson.controller');
const { uploadFields } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { admissionValidator } = require('../validators');

const router = Router();

router.get('/hero', heroController.getPublicHero);
router.get('/about', aboutController.getPublicAbout);
router.get('/contact', contactController.getPublicContact);
router.get('/settings', settingsController.getPublicSettings);
router.get('/footer', footerController.getPublicFooter);
router.get('/courses', courseController.getPublished);
router.get('/courses/:slug', courseController.getBySlug);
router.get('/teachers', teacherController.getPublished);
router.get('/teachers/:slug', teacherController.getBySlug);
router.get('/courses/:courseId/modules', moduleController.getPublished);
router.get('/modules/:moduleId/lessons', lessonController.getPublished);

router.post(
  '/admissions/apply',
  uploadFields([
    { name: 'studentPhoto', maxCount: 1 },
  ]),
  validate(admissionValidator.submitApplicationRules),
  admissionController.submitApplication
);

router.get(
  '/admissions/status/:applicationNumber',
  validate(admissionValidator.applicationNumberParamRules),
  admissionController.checkStatus
);

module.exports = router;
