import api from './api';

export const settingsService = {
  getPublicSettings: () => api.get('/public/settings'),

  getAdminSettings: () => api.get('/admin/settings'),

  createSettings: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'content' && typeof value === 'object') {
        formData.append('content', JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return api.upload('/admin/settings', formData);
  },

  updateSettings: (id, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'content' && typeof value === 'object') {
        formData.append('content', JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return api.put(`/admin/settings/${id}`, formData);
  },

  publishSettings: (id) => api.patch(`/admin/settings/${id}/publish`),

  unpublishSettings: (id) => api.patch(`/admin/settings/${id}/unpublish`),

  restoreSettings: (id) => api.patch(`/admin/settings/${id}/restore`),

  deleteSettings: (id) => api.delete(`/admin/settings/${id}`),
};

export default settingsService;
