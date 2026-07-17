import api from './api';

export const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/upload/single', formData);
  },

  uploadMultiple: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.upload('/upload/multiple', formData);
  },
};

export default uploadService;
