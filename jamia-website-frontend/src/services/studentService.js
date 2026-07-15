import api from './api';

export const studentService = {
  getAdminStudents: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/admin/students${q ? `?${q}` : ''}`);
  },

  getStudentById: (id) => api.get(`/admin/students/${id}`),

  createStudent: (data) => api.post('/admin/students', data),

  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),

  deleteStudent: (id) => api.delete(`/admin/students/${id}`),

  restoreStudent: (id) => api.patch(`/admin/students/${id}/restore`),

  activateStudent: (id) => api.patch(`/admin/students/${id}/activate`),

  deactivateStudent: (id) => api.patch(`/admin/students/${id}/deactivate`),

  getStudentStats: () => api.get('/admin/students/stats'),

  enrollCourse: (id, courseId) => api.post(`/admin/students/${id}/enroll`, { courseId }),

  getEnrolledCourses: (id) => api.get(`/admin/students/${id}/courses`),
};

export default studentService;
