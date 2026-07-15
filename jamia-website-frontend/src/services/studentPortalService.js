import api from './api';

export const studentPortalService = {
  getProfile: () => api.get('/student/profile'),

  getProfileById: (id) => api.get(`/student/profile/${id}`),

  updateProfile: (id, data) => api.put(`/student/profile/${id}`, data),

  getDashboard: (id) => api.get(`/student/dashboard/${id}`),
};

export default studentPortalService;
