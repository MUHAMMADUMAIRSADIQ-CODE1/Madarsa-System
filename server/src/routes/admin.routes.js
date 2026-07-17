const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const cmsRoutes = require('./cms.routes');
const { authenticate, isAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { cmsValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/pending-users', adminController.getPendingUsers);
router.get('/rejected-users', adminController.getRejectedUsers);
router.patch('/approve-user/:userId', adminController.approveUser);
router.patch('/reject-user/:userId', adminController.rejectUser);
router.patch('/block-user/:userId', adminController.blockUser);
router.patch('/unblock-user/:userId', adminController.unblockUser);
router.patch('/deactivate-user/:userId', adminController.deactivateUser);
router.patch('/activate-user/:userId', adminController.activateUser);

// Profile verification routes
router.get('/pending-profile-verifications', adminController.getPendingProfileVerifications);
router.patch('/approve-profile-verification/:userId', adminController.approveProfileVerification);
router.patch('/reject-profile-verification/:userId', adminController.rejectProfileVerification);

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/audit-logs/stats', adminController.getAuditLogStats);

router.get('/permissions', adminController.getPermissions);

router.put(
  '/settings',
  validate(cmsValidator.updateSettingsRules),
  adminController.updateSettings
);
router.get('/settings/group/:group', adminController.getSettingsByGroup);

router.use('/cms', cmsRoutes);
router.use('/hero', require('./hero.routes'));
router.use('/about', require('./about.routes'));
router.use('/contact', require('./contact.routes'));
router.use('/settings', require('./settings.routes'));
router.use('/footer', require('./footer.routes'));
router.use('/courses', require('./course.routes'));
router.use('/teachers', require('./teacher.routes'));
router.use('/admissions', require('./admission.routes'));
router.use('/students', require('./student.routes'));
router.use('/attendance', require('./attendance.routes'));

module.exports = router;
