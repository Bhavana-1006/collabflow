import api from './api';

export const projectService = {
  getProjects: async (workspaceId, status) => {
    const params = { workspaceId };
    if (status) params.status = status;
    const res = await api.get('/projects', { params });
    return res.data;
  },

  getProjectById: async (projectId) => {
    const res = await api.get(`/projects/${projectId}`);
    return res.data;
  },

  createProject: async (data) => {
    const res = await api.post('/projects', data);
    return res.data;
  },

  updateProject: async (projectId, data) => {
    const res = await api.put(`/projects/${projectId}`, data);
    return res.data;
  },

  deleteProject: async (projectId) => {
    const res = await api.delete(`/projects/${projectId}`);
    return res.data;
  },
};
