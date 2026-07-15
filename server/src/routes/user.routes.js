const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { userValidator, commonValidator } = require('../validators');
const { roles } = require('../constants');

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);

router.patch(
  '/profile',
  validate(userValidator.updateProfileRules),
  userController.updateProfile
);

router.post(
  '/change-password',
  userController.changePassword
);

router.get('/', authorize(roles.ADMIN), userController.getAll);
router.get('/:id', commonValidator.objectId(), userController.getById);
router.patch('/:id', authorize(roles.ADMIN), userController.update);
router.delete('/:id', authorize(roles.ADMIN), userController.delete);

router.get('/role/:role', authorize(roles.ADMIN), userController.getByRole);

router.get(
  '/students/all',
  authorize(roles.ADMIN, roles.TEACHER),
  userController.getStudents
);

router.get(
  '/teachers/all',
  authorize(roles.ADMIN),
  userController.getTeachers
);

module.exports = router;
