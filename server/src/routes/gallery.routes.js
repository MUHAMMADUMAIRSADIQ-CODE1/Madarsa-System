const { Router } = require('express');
const galleryController = require('../controllers/gallery.controller');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');
const { commonValidator } = require('../validators');
const { roles } = require('../constants');

const router = Router();

router.get('/published', galleryController.getPublished);
router.get('/stats', galleryController.getStats);
router.get('/category/:category', galleryController.getByCategory);
router.get('/:id', commonValidator.objectId(), galleryController.getById);

router.use(authenticate);

router.post(
  '/',
  authorize(roles.ADMIN, roles.TEACHER),
  uploadSingle('image'),
  galleryController.upload
);

router.patch(
  '/:id',
  authorize(roles.ADMIN),
  commonValidator.objectId(),
  galleryController.update
);

router.delete(
  '/:id',
  authorize(roles.ADMIN),
  commonValidator.objectId(),
  galleryController.delete
);

module.exports = router;
