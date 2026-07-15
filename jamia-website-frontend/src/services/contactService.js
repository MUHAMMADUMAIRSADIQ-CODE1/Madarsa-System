import api from './api';

export const contactService = {
  getPublicContact: () => api.get('/public/contact'),

  getAdminContact: () => api.get('/admin/contact'),

  createContact: (data) => {
    const payload = { ...data };
    if (data.content && typeof data.content === 'object') {
      payload.content = JSON.stringify(data.content);
    }
    return api.post('/admin/contact', payload);
  },

  updateContact: (id, data) => {
    const payload = { ...data };
    if (data.content && typeof data.content === 'object') {
      payload.content = JSON.stringify(data.content);
    }
    return api.put(`/admin/contact/${id}`, payload);
  },

  publishContact: (id) => api.patch(`/admin/contact/${id}/publish`),

  unpublishContact: (id) => api.patch(`/admin/contact/${id}/unpublish`),

  restoreContact: (id) => api.patch(`/admin/contact/${id}/restore`),

  deleteContact: (id) => api.delete(`/admin/contact/${id}`),
};

export default contactService;
