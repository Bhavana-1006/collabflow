import api from './api';

export const analyticsService = {
  getDashboardStats: async (workspaceId) => {
    const res = await api.get('/analytics/dashboard', { params: { workspaceId } });
    return res.data;
  },
};

export const searchService = {
  globalSearch: async (workspaceId, query) => {
    const res = await api.get('/search', { params: { workspaceId, q: query } });
    return res.data;
  },
};

export const eventService = {
  getEvents: async (workspaceId, projectId) => {
    const params = { workspaceId };
    if (projectId) params.projectId = projectId;
    const res = await api.get('/events', { params });
    return res.data;
  },

  createEvent: async (data) => {
    const res = await api.post('/events', data);
    return res.data;
  },

  updateEvent: async (eventId, data) => {
    const res = await api.put(`/events/${eventId}`, data);
    return res.data;
  },

  deleteEvent: async (eventId) => {
    const res = await api.delete(`/events/${eventId}`);
    return res.data;
  },
};

export const activityService = {
  getActivities: async (workspaceId, projectId, limit = 50) => {
    const params = { workspaceId, limit };
    if (projectId) params.projectId = projectId;
    const res = await api.get('/activity', { params });
    return res.data;
  },
};

export const userService = {
  searchUsers: async (q) => {
    const res = await api.get('/users/search', { params: { q } });
    return res.data;
  },

  getUserById: async (userId) => {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  },
};
