import api from './api';

export const newsService = {
  getAll: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/news${q ? `?${q}` : ''}`);
  },

  getById: (id) => api.get(`/news/${id}`),

  create: (data) => api.post('/news', data),

  update: (id, data) => api.patch(`/news/${id}`, data),

  delete: (id) => api.delete(`/news/${id}`),

  getStats: () => api.get('/news/stats'),

  getPublished: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/news/published${q ? `?${q}` : ''}`);
  },

  getFeatured: () => api.get('/news/featured'),

  getBySlug: (slug) => api.get(`/news/slug/${slug}`),
};

export default newsService;
