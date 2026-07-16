import api from './api';

export const heroService = {
  getPublicHero: () => api.get('/public/hero'),

  getAdminHero: () => api.get('/admin/hero'),

  createHero: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'features' && Array.isArray(value)) {
        formData.append('features', JSON.stringify(value));
      } else if (key === 'buttons' && Array.isArray(value)) {
        formData.append('buttons', JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return api.upload('/admin/hero', formData);
  },

  updateHero: (id, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'features' && Array.isArray(value)) {
        formData.append('features', JSON.stringify(value));
      } else if (key === 'buttons' && Array.isArray(value)) {
        formData.append('buttons', JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return api.put(`/admin/hero/${id}`, formData);
  },

  publishHero: (id) => api.patch(`/admin/hero/${id}/publish`),

  unpublishHero: (id) => api.patch(`/admin/hero/${id}/unpublish`),

  restoreHero: (id) => api.patch(`/admin/hero/${id}/restore`),

  deleteHero: (id) => api.delete(`/admin/hero/${id}`),
};

export default heroService;
