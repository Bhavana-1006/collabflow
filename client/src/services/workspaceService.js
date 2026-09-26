import api from './api';

export const workspaceService = {
  getMyWorkspaces: async () => {
    const res = await api.get('/workspaces');
    return res.data;
  },

  getWorkspaceById: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}`);
    return res.data;
  },

  createWorkspace: async (data) => {
    const res = await api.post('/workspaces', data);
    return res.data;
  },

  updateWorkspace: async (workspaceId, data) => {
    const res = await api.put(`/workspaces/${workspaceId}`, data);
    return res.data;
  },

  deleteWorkspace: async (workspaceId) => {
    const res = await api.delete(`/workspaces/${workspaceId}`);
    return res.data;
  },

  inviteMember: async (workspaceId, email, role) => {
    const res = await api.post(`/workspaces/${workspaceId}/members`, { email, role });
    return res.data;
  },

  removeMember: async (workspaceId, userId) => {
    const res = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return res.data;
  },

  updateMemberRole: async (workspaceId, userId, role) => {
    const res = await api.put(`/workspaces/${workspaceId}/members/${userId}/role`, { role });
    return res.data;
  },
};
