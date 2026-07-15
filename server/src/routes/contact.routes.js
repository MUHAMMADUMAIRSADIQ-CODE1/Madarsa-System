const { Router } = require('express');
const contactController = require('../controllers/contact.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { contactValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/', contactController.getContact);

router.post(
  '/',
  validate(contactValidator.upsertContactRules),
  contactController.createContact
);

router.put(
  '/:id',
  validate(contactValidator.upsertContactRules),
  validate(contactValidator.idParamRules),
  contactController.updateContact
);

router.delete(
  '/:id',
  validate(contactValidator.idParamRules),
  contactController.deleteContact
);

router.patch(
  '/:id/publish',
  validate(contactValidator.idParamRules),
  contactController.publishContact
);

router.patch(
  '/:id/unpublish',
  validate(contactValidator.idParamRules),
  contactController.unpublishContact
);

router.patch(
  '/:id/restore',
  validate(contactValidator.idParamRules),
  contactController.restoreContact
);

module.exports = router;
