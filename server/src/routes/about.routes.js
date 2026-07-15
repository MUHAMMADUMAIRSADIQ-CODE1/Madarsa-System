const { Router } = require('express');
const aboutController = require('../controllers/about.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { aboutValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/', aboutController.getAbout);

router.post(
  '/',
  uploadSingle('image'),
  validate(aboutValidator.upsertAboutRules),
  aboutController.createAbout
);

router.put(
  '/:id',
  uploadSingle('image'),
  validate(aboutValidator.upsertAboutRules),
  validate(aboutValidator.idParamRules),
  aboutController.updateAbout
);

router.delete(
  '/:id',
  validate(aboutValidator.idParamRules),
  aboutController.deleteAbout
);

router.patch(
  '/:id/publish',
  validate(aboutValidator.idParamRules),
  aboutController.publishAbout
);

router.patch(
  '/:id/unpublish',
  validate(aboutValidator.idParamRules),
  aboutController.unpublishAbout
);

router.patch(
  '/:id/restore',
  validate(aboutValidator.idParamRules),
  aboutController.restoreAbout
);

module.exports = router;
