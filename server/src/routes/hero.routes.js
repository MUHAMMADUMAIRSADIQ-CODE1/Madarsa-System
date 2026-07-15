const { Router } = require('express');
const heroController = require('../controllers/hero.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { heroValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/', heroController.getHero);

router.post(
  '/',
  uploadSingle('image'),
  validate(heroValidator.upsertHeroRules),
  heroController.createHero
);

router.put(
  '/:id',
  uploadSingle('image'),
  validate(heroValidator.upsertHeroRules),
  validate(heroValidator.idParamRules),
  heroController.updateHero
);

router.delete(
  '/:id',
  validate(heroValidator.idParamRules),
  heroController.deleteHero
);

router.patch(
  '/:id/publish',
  validate(heroValidator.idParamRules),
  heroController.publishHero
);

router.patch(
  '/:id/unpublish',
  validate(heroValidator.idParamRules),
  heroController.unpublishHero
);

router.patch(
  '/:id/restore',
  validate(heroValidator.idParamRules),
  heroController.restoreHero
);

module.exports = router;
