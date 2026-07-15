const { Router } = require('express');
const settingsController = require('../controllers/settings.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { settingsValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/', settingsController.getSettings);

router.post(
  '/',
  uploadSingle('image'),
  validate(settingsValidator.upsertSettingsRules),
  settingsController.createSettings
);

router.put(
  '/:id',
  uploadSingle('image'),
  validate(settingsValidator.upsertSettingsRules),
  validate(settingsValidator.idParamRules),
  settingsController.updateSettings
);

router.delete(
  '/:id',
  validate(settingsValidator.idParamRules),
  settingsController.deleteSettings
);

router.patch(
  '/:id/publish',
  validate(settingsValidator.idParamRules),
  settingsController.publishSettings
);

router.patch(
  '/:id/unpublish',
  validate(settingsValidator.idParamRules),
  settingsController.unpublishSettings
);

router.patch(
  '/:id/restore',
  validate(settingsValidator.idParamRules),
  settingsController.restoreSettings
);

module.exports = router;
