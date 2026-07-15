const { Router } = require('express');
const settingController = require('../controllers/setting.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { commonValidator } = require('../validators');
const { roles } = require('../constants');

const router = Router();

router.get('/public', settingController.getPublic);
router.get('/group/:group', settingController.getGroup);
router.get('/:key', settingController.getByKey);

router.use(authenticate);
router.use(authorize(roles.ADMIN));

router.get('/', settingController.getAll);
router.post('/', settingController.create);
router.patch('/:key', settingController.updateByKey);
router.put('/bulk/update', settingController.updateBulk);
router.delete('/:id', commonValidator.objectId(), settingController.delete);

module.exports = router;
