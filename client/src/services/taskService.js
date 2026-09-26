import api from './api';

export const taskService = {
  getTasks: async (params) => {
    const res = await api.get('/tasks', { params });
    return res.data;
  },

  getTaskById: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data;
  },

  createTask: async (taskData) => {
    const res = await api.post('/tasks', taskData);
    return res.data;
  },

  updateTask: async (taskId, updateData) => {
    const res = await api.put(`/tasks/${taskId}`, updateData);
    return res.data;
  },

  moveTask: async (taskId, status, order) => {
    const res = await api.put(`/tasks/${taskId}/move`, { status, order });
    return res.data;
  },

  deleteTask: async (taskId) => {
    const res = await api.delete(`/tasks/${taskId}`);
    return res.data;
  },

  addSubtask: async (taskId, title) => {
    const res = await api.post(`/tasks/${taskId}/subtasks`, { title });
    return res.data;
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const res = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
    return res.data;
  },

  // Comments
  getComments: async (taskId) => {
    const res = await api.get('/comments', { params: { taskId } });
    return res.data;
  },

  createComment: async (data) => {
    const res = await api.post('/comments', data);
    return res.data;
  },

  addReply: async (commentId, data) => {
    const res = await api.post(`/comments/${commentId}/reply`, data);
    return res.data;
  },

  toggleResolveComment: async (commentId) => {
    const res = await api.put(`/comments/${commentId}/resolve`);
    return res.data;
  },

  deleteComment: async (commentId) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },
};
