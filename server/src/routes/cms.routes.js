const { Router } = require('express');
const cmsController = require('../controllers/cms.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { cmsValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/sections', cmsController.getAllSections);
router.get('/stats', cmsController.getStats);

router.get('/published/:section', cmsController.getPublished);
router.get('/:section', cmsController.getBySection);

router.put(
  '/:section',
  validate(cmsValidator.upsertContentRules),
  cmsController.upsertBySection
);

router.patch(
  '/:section/publish',
  validate(cmsValidator.publishRules),
  cmsController.publish
);

router.patch(
  '/:section/unpublish',
  validate(cmsValidator.publishRules),
  cmsController.unpublish
);

router.delete('/:id', cmsController.softDelete);
router.patch('/:id/restore', cmsController.restore);

module.exports = router;
