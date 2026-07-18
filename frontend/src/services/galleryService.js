import api from './api';

export const galleryService = {
  getAll: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/gallery${q ? `?${q}` : ''}`);
  },

  getById: (id) => api.get(`/gallery/${id}`),

  upload: (data) => api.upload('/gallery', data),

  update: (id, data) => api.patch(`/gallery/${id}`, data),

  delete: (id) => api.delete(`/gallery/${id}`),

  getStats: () => api.get('/gallery/stats'),

  getByCategory: (category) => api.get(`/gallery/category/${category}`),

  getPublished: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/gallery/published${q ? `?${q}` : ''}`);
  },
};

export default galleryService;
