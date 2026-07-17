import api from './api';

export const teacherAcademicService = {
  // =================== COURSES ===================
  getMyCourses: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/courses/${teacherId}${q ? `?${q}` : ''}`);
  },

  getCourseDetails: (teacherId, courseId) => {
    return api.get(`/teacher/courses/${teacherId}/${courseId}`);
  },

  // =================== STUDENTS ===================
  getMyStudents: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/students/${teacherId}${q ? `?${q}` : ''}`);
  },

  // =================== ASSIGNMENTS ===================
  getAssignments: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/assignments/${teacherId}${q ? `?${q}` : ''}`);
  },

  getAssignmentById: (id) => {
    return api.get(`/teacher/assignments/detail/${id}`);
  },

  createAssignment: (data) => {
    return api.post('/teacher/assignments', data);
  },

  updateAssignment: (id, data) => {
    return api.put(`/teacher/assignments/${id}`, data);
  },

  deleteAssignment: (id) => {
    return api.delete(`/teacher/assignments/${id}`);
  },

  // =================== SCHEDULE ===================
  getSchedule: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/schedule/${teacherId}${q ? `?${q}` : ''}`);
  },

  // =================== COURSE MATERIALS ===================
  getCourseMaterials: (courseId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/courses/${courseId}/materials${q ? `?${q}` : ''}`);
  },

  addCourseMaterial: (courseId, data) => {
    return api.post(`/teacher/courses/${courseId}/materials`, data);
  },

  deleteCourseMaterial: (courseId, materialIndex) => {
    return api.delete(`/teacher/courses/${courseId}/materials/${materialIndex}`);
  },

  // =================== RESULTS / GRADEBOOK ===================
  getResults: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/academic/results/${teacherId}${q ? `?${q}` : ''}`);
  },

  createResult: (data) => {
    return api.post('/teacher/academic/results', data);
  },

  updateResult: (id, data) => {
    return api.put(`/teacher/academic/results/${id}`, data);
  },

  deleteResult: (id, teacherId) => {
    return api.delete(`/teacher/academic/results/${id}`, { body: { teacher: teacherId } });
  },

  publishResult: (id, teacherId) => {
    return api.patch(`/teacher/academic/results/${id}/publish`, { teacher: teacherId });
  },

  // =================== ANNOUNCEMENTS ===================
  getAnnouncements: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/academic/announcements/${teacherId}${q ? `?${q}` : ''}`);
  },

  createAnnouncement: (data) => {
    return api.post('/teacher/academic/announcements', data);
  },

  updateAnnouncement: (id, data) => {
    return api.put(`/teacher/academic/announcements/${id}`, data);
  },

  deleteAnnouncement: (id) => {
    return api.delete(`/teacher/academic/announcements/${id}`);
  },

  // =================== MESSAGES ===================
  getConversations: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/academic/conversations/${teacherId}${q ? `?${q}` : ''}`);
  },

  getMessages: (conversationId, teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/academic/messages/${conversationId}/${teacherId}${q ? `?${q}` : ''}`);
  },

  sendMessage: (data) => {
    return api.post('/teacher/academic/messages', data);
  },

  deleteConversation: (conversationId, teacherId) => {
    return api.delete(`/teacher/academic/conversations/${conversationId}/${teacherId}`);
  },

  // =================== NOTIFICATIONS ===================
  getNotifications: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/academic/notifications${q ? `?${q}` : ''}`);
  },

  markNotificationRead: (id) => {
    return api.patch(`/teacher/academic/notifications/${id}/read`);
  },

  markAllNotificationsRead: () => {
    return api.patch('/teacher/academic/notifications/read-all');
  },

  getUnreadCount: () => {
    return api.get('/teacher/academic/notifications/unread-count');
  },

  // =================== ANALYTICS ===================
  getDashboardAnalytics: (teacherId) => {
    return api.get(`/teacher/academic/analytics/${teacherId}`);
  },
};

export default teacherAcademicService;
