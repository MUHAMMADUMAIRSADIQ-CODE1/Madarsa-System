const { Router } = require('express');
const newsController = require('../controllers/news.controller');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');
const { commonValidator } = require('../validators');
const { roles } = require('../constants');

const router = Router();

router.get('/published', newsController.getPublished);
router.get('/featured', newsController.getFeatured);
router.get('/stats', newsController.getStats);
router.get('/slug/:slug', newsController.getBySlug);
router.get('/:id', optionalAuth, commonValidator.objectId(), newsController.getById);

router.use(authenticate);

router.post('/', authorize(roles.ADMIN), newsController.create);
router.patch('/:id', authorize(roles.ADMIN), commonValidator.objectId(), newsController.update);
router.delete('/:id', authorize(roles.ADMIN), commonValidator.objectId(), newsController.delete);

module.exports = router;
