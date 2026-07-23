import api from './api';

export const moduleService = {
  /** Get all modules for a course (teacher) */
  getModules: (courseId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/modules/course/${courseId}${q ? `?${q}` : ''}`);
  },

  /** Get a single module by ID */
  getModuleById: (id) => api.get(`/teacher/modules/${id}`),

  /** Create a new module */
  createModule: (data) => api.post('/teacher/modules', data),

  /** Update a module */
  updateModule: (id, data) => api.put(`/teacher/modules/${id}`, data),

  /** Delete a module (soft delete) */
  deleteModule: (id) => api.delete(`/teacher/modules/${id}`),

  /** Reorder modules for a course */
  reorderModules: (courseId, moduleIds) =>
    api.patch(`/teacher/modules/reorder/${courseId}`, { moduleIds }),

  /** Publish a module */
  publishModule: (id) => api.patch(`/teacher/modules/${id}/publish`),

  /** Unpublish a module */
  unpublishModule: (id) => api.patch(`/teacher/modules/${id}/unpublish`),

  /** Get published modules for a course (public/student) */
  getPublishedModules: (courseId) =>
    api.get(`/public/courses/${courseId}/modules`),
};

export default moduleService;
