import api from './api';

export const studentService = {
  getAdminStudents: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/admin/students${q ? `?${q}` : ''}`);
  },

  getStudentById: (id) => api.get(`/admin/students/${id}`),

  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),

  deleteStudent: (id) => api.delete(`/admin/students/${id}`),

  restoreStudent: (id) => api.patch(`/admin/students/${id}/restore`),

  getStudentStats: () => api.get('/admin/students/stats'),

  enrollCourse: (id, courseId) => api.post(`/admin/students/${id}/enroll`, { courseId }),

  getEnrolledCourses: (id) => api.get(`/admin/students/${id}/courses`),

  // User-level admin actions (block/unblock/activate/deactivate)
  blockUser: (userId, reason) => api.patch(`/admin/block-user/${userId}`, { reason }),

  unblockUser: (userId) => api.patch(`/admin/unblock-user/${userId}`),

  activateUser: (userId) => api.patch(`/admin/activate-user/${userId}`),

  deactivateUser: (userId, reason) => api.patch(`/admin/deactivate-user/${userId}`, { reason }),
};

export default studentService;
