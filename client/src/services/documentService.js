import api from './api';

export const documentService = {
  getDocs: async (workspaceId, projectId) => {
    const params = { workspaceId };
    if (projectId) params.projectId = projectId;
    const res = await api.get('/documents', { params });
    return res.data;
  },

  getDocById: async (documentId) => {
    const res = await api.get(`/documents/${documentId}`);
    return res.data;
  },

  createDoc: async (data) => {
    const res = await api.post('/documents', data);
    return res.data;
  },

  updateDoc: async (documentId, data) => {
    const res = await api.put(`/documents/${documentId}`, data);
    return res.data;
  },

  deleteDoc: async (documentId) => {
    const res = await api.delete(`/documents/${documentId}`);
    return res.data;
  },

  getVersions: async (documentId) => {
    const res = await api.get(`/documents/${documentId}/versions`);
    return res.data;
  },

  restoreVersion: async (documentId, versionId) => {
    const res = await api.post(`/documents/${documentId}/restore/${versionId}`);
    return res.data;
  },
};
