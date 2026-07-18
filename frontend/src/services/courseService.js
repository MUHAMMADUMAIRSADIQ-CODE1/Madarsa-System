import api from './api';

const buildFormData = (data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      fd.append(key, value);
    } else if (key === 'seoKeywords' && Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null && value !== '') {
      fd.append(key, value);
    }
  });
  return fd;
};

export const courseService = {
  getAdminCourses: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/admin/courses${q ? `?${q}` : ''}`);
  },

  getCourseById: (id) => api.get(`/admin/courses/${id}`),

  createCourse: (data) => api.upload('/admin/courses', buildFormData(data)),

  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, buildFormData(data)),

  publishCourse: (id) => api.patch(`/admin/courses/${id}/publish`),

  unpublishCourse: (id) => api.patch(`/admin/courses/${id}/unpublish`),

  archiveCourse: (id) => api.patch(`/admin/courses/${id}/archive`),

  restoreCourse: (id) => api.patch(`/admin/courses/${id}/restore`),

  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),

  duplicateCourse: (id) => api.post(`/admin/courses/${id}/duplicate`),

  getCourseStats: () => api.get('/admin/courses/stats'),

  getCategories: () => api.get('/admin/courses/categories'),

  createCategory: (data) => api.post('/admin/courses/categories', data),

  updateCategory: (id, data) => api.put(`/admin/courses/categories/${id}`, data),

  deleteCategory: (id) => api.delete(`/admin/courses/categories/${id}`),

  getPublishedCourses: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/public/courses${q ? `?${q}` : ''}`);
  },

  getCourseDetailWithStats: (id) => api.get(`/admin/courses/${id}/detail-with-stats`),
};

export default courseService;
