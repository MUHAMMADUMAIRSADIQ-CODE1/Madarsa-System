import api from './api';

const buildFormData = (data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      fd.append(key, value);
    } else if (value !== undefined && value !== null && value !== '') {
      fd.append(key, value);
    }
  });
  return fd;
};

export const admissionService = {
  getAdminAdmissions: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/admin/admissions${q ? `?${q}` : ''}`);
  },

  getAdmissionById: (id) => api.get(`/admin/admissions/${id}`),

  updateAdmission: (id, data) => api.put(`/admin/admissions/${id}`, buildFormData(data)),

  deleteAdmission: (id) => api.delete(`/admin/admissions/${id}`),

  restoreAdmission: (id) => api.patch(`/admin/admissions/${id}/restore`),

  approveAdmission: (id, remarks) => api.patch(`/admin/admissions/${id}/approve`, { remarks }),

  rejectAdmission: (id, remarks) => api.patch(`/admin/admissions/${id}/reject`, { remarks }),

  waitlistAdmission: (id, remarks) => api.patch(`/admin/admissions/${id}/waitlist`, { remarks }),

  reviewAdmission: (id, remarks) => api.patch(`/admin/admissions/${id}/review`, { remarks }),

  getAdmissionStats: () => api.get('/admin/admissions/stats'),

  submitApplication: (data) => api.upload('/public/admissions/apply', buildFormData(data)),

  checkStatus: (applicationNumber) => api.get(`/public/admissions/status/${applicationNumber}`),

  convertToStudent: (id) => api.post(`/admin/admissions/${id}/convert-to-student`),
};

export default admissionService;
