const { Router } = require('express');
const teacherAcademicController = require('../controllers/teacherAcademic.controller');
const { authenticate, isTeacher } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { teacherAcademicValidator } = require('../validators');

const router = Router();

router.use(authenticate);
router.use(isTeacher);

// =================== RESULTS / GRADEBOOK ===================
router.get('/results/:teacherId', teacherAcademicController.getResults);
router.post('/results', validate(teacherAcademicValidator.createResultRules), teacherAcademicController.createResult);
router.put('/results/:id', teacherAcademicController.updateResult);
router.delete('/results/:id', teacherAcademicController.deleteResult);
router.patch('/results/:id/publish', teacherAcademicController.publishResult);

// =================== ANNOUNCEMENTS ===================
router.get('/announcements/course/:courseId', teacherAcademicController.getCourseAnnouncements);
router.get('/announcements/:teacherId', teacherAcademicController.getAnnouncements);
router.post('/announcements', validate(teacherAcademicValidator.createAnnouncementRules), teacherAcademicController.createAnnouncement);
router.put('/announcements/:id', teacherAcademicController.updateAnnouncement);
router.patch('/announcements/:id/pin', teacherAcademicController.togglePinAnnouncement);
router.patch('/announcements/:id/publish', teacherAcademicController.togglePublishAnnouncement);
router.delete('/announcements/:id', teacherAcademicController.deleteAnnouncement);

// =================== MESSAGES ===================
router.get('/conversations/:teacherId', teacherAcademicController.getConversations);
router.get('/messages/:conversationId/:teacherId', teacherAcademicController.getMessages);
router.post('/messages', validate(teacherAcademicValidator.sendMessageRules), teacherAcademicController.sendMessage);
router.delete('/conversations/:conversationId/:teacherId', teacherAcademicController.deleteConversation);

// =================== NOTIFICATIONS ===================
router.get('/notifications', teacherAcademicController.getNotifications);
router.patch('/notifications/:id/read', teacherAcademicController.markNotificationRead);
router.patch('/notifications/read-all', teacherAcademicController.markAllNotificationsRead);
router.get('/notifications/unread-count', teacherAcademicController.getUnreadCount);

// =================== ANALYTICS ===================
router.get('/analytics/:teacherId', teacherAcademicController.getDashboardAnalytics);

module.exports = router;
