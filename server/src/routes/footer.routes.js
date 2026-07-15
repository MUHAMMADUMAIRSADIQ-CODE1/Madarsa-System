const { Router } = require('express');
const footerController = require('../controllers/footer.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { footerValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/', footerController.getFooter);

router.post(
  '/',
  validate(footerValidator.upsertFooterRules),
  footerController.createFooter
);

router.put(
  '/:id',
  validate(footerValidator.upsertFooterRules),
  validate(footerValidator.idParamRules),
  footerController.updateFooter
);

router.delete(
  '/:id',
  validate(footerValidator.idParamRules),
  footerController.deleteFooter
);

router.patch(
  '/:id/publish',
  validate(footerValidator.idParamRules),
  footerController.publishFooter
);

router.patch(
  '/:id/unpublish',
  validate(footerValidator.idParamRules),
  footerController.unpublishFooter
);

router.patch(
  '/:id/restore',
  validate(footerValidator.idParamRules),
  footerController.restoreFooter
);

module.exports = router;
