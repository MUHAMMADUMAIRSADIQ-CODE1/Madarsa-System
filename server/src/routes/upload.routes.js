const { Router } = require('express');
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middlewares/auth');
const { uploadSingle, uploadMultiple } = require('../middlewares/upload');
const { uploadLimiter } = require('../middlewares/rateLimiter');

const router = Router();

router.use(authenticate);

router.post(
  '/single',
  uploadLimiter,
  uploadSingle('file'),
  uploadController.uploadFile
);

router.post(
  '/multiple',
  uploadLimiter,
  uploadMultiple('files', 10),
  uploadController.uploadMultipleFiles
);

module.exports = router;
