import api from './api';

export const aboutService = {
  getPublicAbout: () => api.get('/public/about'),

  getAdminAbout: () => api.get('/admin/about'),

  createAbout: (data) => {
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
    return api.upload('/admin/about', formData);
  },

  updateAbout: (id, data) => {
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
    return api.put(`/admin/about/${id}`, formData);
  },

  publishAbout: (id) => api.patch(`/admin/about/${id}/publish`),

  unpublishAbout: (id) => api.patch(`/admin/about/${id}/unpublish`),

  restoreAbout: (id) => api.patch(`/admin/about/${id}/restore`),

  deleteAbout: (id) => api.delete(`/admin/about/${id}`),
};

export default aboutService;
