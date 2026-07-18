import api from './api';

export const teacherPortalService = {
  getProfile: () => api.get('/teacher/profile'),

  getProfileById: (id) => api.get(`/teacher/profile/${id}`),

  updateProfile: (id, data) => api.put(`/teacher/profile/${id}`, data),

  getDashboard: (id) => api.get(`/teacher/dashboard/${id}`),

  getCourses: (id, params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/teacher/courses/${id}${q ? `?${q}` : ''}`);
  },

  getStudents: (id, params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/teacher/students/${id}${q ? `?${q}` : ''}`);
  },

  getAssignedStudents: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/students/assigned/${teacherId}${q ? `?${q}` : ''}`);
  },
};

export default teacherPortalService;
