import api from './api';

export const fileService = {
  getFiles: async (workspaceId, projectId, category) => {
    const params = { workspaceId };
    if (projectId) params.projectId = projectId;
    if (category) params.category = category;
    const res = await api.get('/files', { params });
    return res.data;
  },

  uploadFile: async (formData) => {
    const res = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteFile: async (fileId) => {
    const res = await api.delete(`/files/${fileId}`);
    return res.data;
  },
};
