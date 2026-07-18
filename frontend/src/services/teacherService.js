import api from './api';

const buildFormData = (data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      fd.append(key, value);
    } else if (key === 'subjects' && Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (key === 'teachingLanguages' && Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (key === 'skills' && Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (key === 'certificates' && Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (key === 'awards' && Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (key === 'seoKeywords' && Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null && value !== '') {
      fd.append(key, value);
    }
  });
  return fd;
};

export const teacherService = {
  getAdminTeachers: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/admin/teachers${q ? `?${q}` : ''}`);
  },

  getTeacherById: (id) => api.get(`/admin/teachers/${id}`),

  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, buildFormData(data)),

  publishTeacher: (id) => api.patch(`/admin/teachers/${id}/publish`),

  unpublishTeacher: (id) => api.patch(`/admin/teachers/${id}/unpublish`),

  archiveTeacher: (id) => api.patch(`/admin/teachers/${id}/archive`),

  restoreTeacher: (id) => api.patch(`/admin/teachers/${id}/restore`),

  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),

  duplicateTeacher: (id) => api.post(`/admin/teachers/${id}/duplicate`),

  getTeacherStats: () => api.get('/admin/teachers/stats'),

  assignCourse: (id, courseId) => api.post(`/admin/teachers/${id}/assign-course`, { courseId }),

  removeCourse: (id, courseId) => api.post(`/admin/teachers/${id}/remove-course`, { courseId }),

  bulkAssignCourses: (id, courseIds) => api.post(`/admin/teachers/${id}/bulk-assign-courses`, { courseIds }),

  getAssignedCourses: (id) => api.get(`/admin/teachers/${id}/assigned-courses`),

  getAssignableCourses: (id) => api.get(`/admin/teachers/${id}/assignable-courses`),

  // User-level admin actions
  blockUser: (userId, reason) => api.patch(`/admin/block-user/${userId}`, { reason }),

  unblockUser: (userId) => api.patch(`/admin/unblock-user/${userId}`),

  activateUser: (userId) => api.patch(`/admin/activate-user/${userId}`),

  deactivateUser: (userId, reason) => api.patch(`/admin/deactivate-user/${userId}`, { reason }),
};

export default teacherService;
