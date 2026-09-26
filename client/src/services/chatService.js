import api from './api';

export const chatService = {
  getConversations: async (workspaceId) => {
    const res = await api.get('/messages/conversations', { params: { workspaceId } });
    return res.data;
  },

  getOrCreateDirectChat: async (workspaceId, recipientId) => {
    const res = await api.post('/messages/conversations/direct', { workspaceId, recipientId });
    return res.data;
  },

  getMessages: async (conversationId, limit = 50, before) => {
    const params = { limit };
    if (before) params.before = before;
    const res = await api.get(`/messages/${conversationId}`, { params });
    return res.data;
  },

  sendMessage: async (conversationId, messageData) => {
    const res = await api.post(`/messages/${conversationId}`, messageData);
    return res.data;
  },

  reactToMessage: async (messageId, emoji) => {
    const res = await api.post(`/messages/message/${messageId}/react`, { emoji });
    return res.data;
  },

  markAsRead: async (conversationId) => {
    const res = await api.put(`/messages/${conversationId}/read`);
    return res.data;
  },

  editMessage: async (messageId, text) => {
    const res = await api.put(`/messages/message/${messageId}`, { text });
    return res.data;
  },

  deleteMessage: async (messageId) => {
    const res = await api.delete(`/messages/message/${messageId}`);
    return res.data;
  },
};
