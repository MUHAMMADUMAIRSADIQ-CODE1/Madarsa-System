import api from './api';

export const footerService = {
  getPublicFooter: () => api.get('/public/footer'),

  getAdminFooter: () => api.get('/admin/footer'),

  createFooter: (data) => {
    const payload = { ...data };
    if (data.content && typeof data.content === 'object') {
      payload.content = JSON.stringify(data.content);
    }
    return api.post('/admin/footer', payload);
  },

  updateFooter: (id, data) => {
    const payload = { ...data };
    if (data.content && typeof data.content === 'object') {
      payload.content = JSON.stringify(data.content);
    }
    return api.put(`/admin/footer/${id}`, payload);
  },

  publishFooter: (id) => api.patch(`/admin/footer/${id}/publish`),

  unpublishFooter: (id) => api.patch(`/admin/footer/${id}/unpublish`),

  restoreFooter: (id) => api.patch(`/admin/footer/${id}/restore`),

  deleteFooter: (id) => api.delete(`/admin/footer/${id}`),
};

export default footerService;
