const teacherAcademicService = require('../services/teacherAcademic.service');
const { ApiResponse, asyncHandler } = require('../utils');

// =================== RESULTS / GRADEBOOK ===================
const getResults = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.getResults(req.params.teacherId, req.query);
  res.status(200).json(ApiResponse.success('Results fetched successfully', data));
});

const createResult = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.createResult(req.body, req.user.id);
  res.status(201).json(ApiResponse.created('Result created successfully', data));
});

const updateResult = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.updateResult(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success('Result updated successfully', data));
});

const deleteResult = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.deleteResult(req.params.id, req.body.teacher || req.user.id);
  res.status(200).json(ApiResponse.success('Result deleted successfully', data));
});

const publishResult = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.publishResult(req.params.id, req.body.teacher || req.user.id);
  res.status(200).json(ApiResponse.success('Result published successfully', data));
});

// =================== ANNOUNCEMENTS ===================
const getAnnouncements = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.getAnnouncements(req.params.teacherId, req.query);
  res.status(200).json(ApiResponse.success('Announcements fetched successfully', data));
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.createAnnouncement(req.body, req.user.id);
  res.status(201).json(ApiResponse.created('Announcement created successfully', data));
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.updateAnnouncement(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success('Announcement updated successfully', data));
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.deleteAnnouncement(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success('Announcement deleted successfully', data));
});

const togglePinAnnouncement = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.togglePin(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success('Announcement pin status toggled successfully', data));
});

const togglePublishAnnouncement = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.togglePublish(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success('Announcement publish status toggled successfully', data));
});

const getCourseAnnouncements = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.getCourseAnnouncements(req.params.courseId);
  res.status(200).json(ApiResponse.success('Course announcements fetched successfully', data));
});

// =================== MESSAGES ===================
const getConversations = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.getConversations(req.params.teacherId, req.query);
  res.status(200).json(ApiResponse.success('Conversations fetched successfully', data));
});

const getMessages = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.getMessages(req.params.conversationId, req.params.teacherId, req.query);
  res.status(200).json(ApiResponse.success('Messages fetched successfully', data));
});

const sendMessage = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.sendMessage(req.body, req.user.id);
  res.status(201).json(ApiResponse.created('Message sent successfully', data));
});

const deleteConversation = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.deleteConversation(req.params.conversationId, req.params.teacherId);
  res.status(200).json(ApiResponse.success('Conversation deleted successfully', data));
});

// =================== NOTIFICATIONS ===================
const getNotifications = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.getNotifications(req.user.id, req.query);
  res.status(200).json(ApiResponse.success('Notifications fetched successfully', data));
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.markNotificationRead(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success('Notification marked as read', data));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.markAllNotificationsRead(req.user.id);
  res.status(200).json(ApiResponse.success(data.message, data));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await teacherAcademicService.getUnreadCount(req.user.id);
  res.status(200).json(ApiResponse.success('Unread count fetched', { count }));
});

// =================== ANALYTICS ===================
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.getDashboardAnalytics(req.params.teacherId);
  res.status(200).json(ApiResponse.success('Dashboard analytics fetched successfully', data));
});

module.exports = {
  getResults, createResult, updateResult, deleteResult, publishResult,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  togglePinAnnouncement, togglePublishAnnouncement, getCourseAnnouncements,
  getConversations, getMessages, sendMessage, deleteConversation,
  getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount,
  getDashboardAnalytics,
};
