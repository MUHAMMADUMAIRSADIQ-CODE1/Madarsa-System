import api from './api';

export const studentPortalService = {
  getProfile: () => api.get('/student/profile'),

  getProfileById: (id) => api.get(`/student/profile/${id}`),

  updateProfile: (id, data) => api.put(`/student/profile/${id}`, data),

  getDashboard: (id) => api.get(`/student/dashboard/${id}`),

  // =================== ASSIGNMENTS ===================

  getCourseAssignments: (courseId) => {
    return api.get(`/student/assignments/course/${courseId}`);
  },

  submitAssignment: (assignmentId, data) => {
    return api.post(`/student/assignments/${assignmentId}/submit`, data);
  },

  getMySubmissions: () => {
    return api.get('/student/submissions');
  },

  // =================== RESULTS ===================

  getCourseResults: (courseId) => {
    return api.get(`/student/results/course/${courseId}`);
  },

  // =================== ANNOUNCEMENTS ===================

  getCourseAnnouncements: (courseId) => {
    return api.get(`/student/announcements/course/${courseId}`);
  },
};

export default studentPortalService;
