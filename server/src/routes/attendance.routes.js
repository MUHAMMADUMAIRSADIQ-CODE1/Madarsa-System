const { Router } = require('express');
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, isAdmin, isAdminOrTeacher } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { attendanceValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/stats', attendanceController.getStats);

router.get('/', attendanceController.getAll);

router.get('/:id',
  validate(attendanceValidator.idParamRules),
  attendanceController.getById
);

router.post('/',
  validate(attendanceValidator.createAttendanceRules),
  attendanceController.create
);

router.put('/:id',
  validate(attendanceValidator.idParamRules),
  validate(attendanceValidator.updateAttendanceRules),
  attendanceController.update
);

router.delete('/:id',
  validate(attendanceValidator.idParamRules),
  attendanceController.remove
);

router.patch('/:id/restore',
  validate(attendanceValidator.idParamRules),
  attendanceController.restore
);

module.exports = router;
