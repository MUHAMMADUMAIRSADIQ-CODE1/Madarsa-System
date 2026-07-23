import api from './api';

export const lessonService = {
  /** Get all lessons for a module (teacher) */
  getLessons: (moduleId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/teacher/lessons/module/${moduleId}${q ? `?${q}` : ''}`);
  },

  /** Get a single lesson by ID */
  getLessonById: (id) => api.get(`/teacher/lessons/${id}`),

  /** Create a new lesson */
  createLesson: (data) => api.post('/teacher/lessons', data),

  /** Update a lesson */
  updateLesson: (id, data) => api.put(`/teacher/lessons/${id}`, data),

  /** Delete a lesson */
  deleteLesson: (id) => api.delete(`/teacher/lessons/${id}`),

  /** Reorder lessons within a module */
  reorderLessons: (moduleId, lessonIds) =>
    api.patch(`/teacher/lessons/reorder/${moduleId}`, { lessonIds }),

  /** Publish a lesson */
  publishLesson: (id) => api.patch(`/teacher/lessons/${id}/publish`),

  /** Unpublish a lesson */
  unpublishLesson: (id) => api.patch(`/teacher/lessons/${id}/unpublish`),

  /** Get published lessons for a module (public/student) */
  getPublishedLessons: (moduleId) =>
    api.get(`/public/modules/${moduleId}/lessons`),
};

export default lessonService;
