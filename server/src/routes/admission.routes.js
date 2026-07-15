const { Router } = require('express');
const admissionController = require('../controllers/admission.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { uploadFields } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { admissionValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/stats', admissionController.getStats);

router.get('/', admissionController.getAll);

router.get('/:id', validate(admissionValidator.idParamRules), admissionController.getById);

router.put(
  '/:id',
  uploadFields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'cnicFront', maxCount: 1 },
    { name: 'cnicBack', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
  ]),
  validate(admissionValidator.updateAdmissionRules),
  validate(admissionValidator.idParamRules),
  admissionController.update
);

router.delete(
  '/:id',
  validate(admissionValidator.idParamRules),
  admissionController.deleteAdmission
);

router.patch(
  '/:id/restore',
  validate(admissionValidator.idParamRules),
  admissionController.restoreAdmission
);

router.patch(
  '/:id/approve',
  validate(admissionValidator.idParamRules),
  validate(admissionValidator.statusActionRules),
  admissionController.approveAdmission
);

router.patch(
  '/:id/reject',
  validate(admissionValidator.idParamRules),
  validate(admissionValidator.statusActionRules),
  admissionController.rejectAdmission
);

router.patch(
  '/:id/waitlist',
  validate(admissionValidator.idParamRules),
  validate(admissionValidator.statusActionRules),
  admissionController.waitlistAdmission
);

router.patch(
  '/:id/review',
  validate(admissionValidator.idParamRules),
  validate(admissionValidator.statusActionRules),
  admissionController.reviewAdmission
);

router.post(
  '/:id/convert-to-student',
  validate(admissionValidator.idParamRules),
  admissionController.convertToStudent
);

module.exports = router;
