const User = require('../models/User');

const activeUsers = new Map(); // socketId -> { userId, userName, avatar, workspaces: Set }
const userSocketMap = new Map(); // userId -> Set(socketIds)

const setupSockets = (io) => {
  io.on('connection', (socket) => {
    // 1. Authenticate / Identify User
    socket.on('user:connect', async ({ userId, user }) => {
      if (!userId) return;

      socket.userId = userId;
      socket.join(`user:${userId}`);

      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId).add(socket.id);

      activeUsers.set(socket.id, {
        userId,
        name: user?.name || 'Anonymous',
        avatar: user?.avatar || '',
        workspaces: new Set(),
      });

      // Update in database
      try {
        await User.findByIdAndUpdate(userId, {
          status: 'online',
          lastSeen: new Date(),
        });
      } catch (e) {}

      io.emit('presence:update', {
        userId,
        status: 'online',
        lastSeen: new Date(),
      });
    });

    // 2. Workspace Presence & Rooms
    socket.on('workspace:join', ({ workspaceId, userId }) => {
      if (!workspaceId) return;
      socket.join(`workspace:${workspaceId}`);

      const userSession = activeUsers.get(socket.id);
      if (userSession) {
        userSession.workspaces.add(workspaceId);
      }

      // Collect currently active users in this workspace
      const onlineMembersInWorkspace = [];
      for (const [sId, session] of activeUsers.entries()) {
        if (session.workspaces.has(workspaceId)) {
          onlineMembersInWorkspace.push({
            userId: session.userId,
            name: session.name,
            avatar: session.avatar,
            status: 'online',
          });
        }
      }

      io.to(`workspace:${workspaceId}`).emit('workspace:presence:list', {
        workspaceId,
        onlineMembers: onlineMembersInWorkspace,
      });

      socket.to(`workspace:${workspaceId}`).emit('workspace:member:online', {
        workspaceId,
        userId: socket.userId || userId,
      });
    });

    socket.on('workspace:leave', ({ workspaceId }) => {
      if (!workspaceId) return;
      socket.leave(`workspace:${workspaceId}`);
      const userSession = activeUsers.get(socket.id);
      if (userSession) {
        userSession.workspaces.delete(workspaceId);
      }
      socket.to(`workspace:${workspaceId}`).emit('workspace:member:offline', {
        workspaceId,
        userId: socket.userId,
      });
    });

    // 3. Project Rooms
    socket.on('project:join', ({ projectId }) => {
      if (projectId) socket.join(`project:${projectId}`);
    });

    socket.on('project:leave', ({ projectId }) => {
      if (projectId) socket.leave(`project:${projectId}`);
    });

    // 4. Real-Time Kanban Task Events
    socket.on('task:create', ({ workspaceId, projectId, task }) => {
      if (projectId) {
        socket.to(`project:${projectId}`).emit('task:created', { projectId, task });
      }
      if (workspaceId) {
        socket.to(`workspace:${workspaceId}`).emit('task:created', { projectId, task });
      }
    });

    socket.on('task:update', ({ workspaceId, projectId, task }) => {
      if (projectId) {
        socket.to(`project:${projectId}`).emit('task:updated', { projectId, task });
      }
      if (workspaceId) {
        socket.to(`workspace:${workspaceId}`).emit('task:updated', { projectId, task });
      }
    });

    socket.on('task:move', ({ workspaceId, projectId, task, fromStatus, toStatus, order }) => {
      if (projectId) {
        socket.to(`project:${projectId}`).emit('task:moved', {
          projectId,
          taskId: task._id || task.id,
          task,
          fromStatus,
          toStatus,
          order,
        });
      }
      if (workspaceId) {
        socket.to(`workspace:${workspaceId}`).emit('task:moved', {
          projectId,
          taskId: task._id || task.id,
          task,
          fromStatus,
          toStatus,
          order,
        });
      }
    });

    socket.on('task:delete', ({ workspaceId, projectId, taskId }) => {
      if (projectId) {
        socket.to(`project:${projectId}`).emit('task:deleted', { projectId, taskId });
      }
      if (workspaceId) {
        socket.to(`workspace:${workspaceId}`).emit('task:deleted', { projectId, taskId });
      }
    });

    // 5. Real-Time Chat & Messaging
    socket.on('conversation:join', ({ conversationId }) => {
      if (conversationId) socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', ({ conversationId }) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    socket.on('message:send', ({ conversationId, message, workspaceId }) => {
      socket.to(`conversation:${conversationId}`).emit('message:received', {
        conversationId,
        message,
      });

      if (workspaceId) {
        socket.to(`workspace:${workspaceId}`).emit('conversation:updated', {
          conversationId,
          lastMessage: message,
        });
      }
    });

    socket.on('message:typing:start', ({ conversationId, user }) => {
      socket.to(`conversation:${conversationId}`).emit('message:typing', {
        conversationId,
        user,
        isTyping: true,
      });
    });

    socket.on('message:typing:stop', ({ conversationId, user }) => {
      socket.to(`conversation:${conversationId}`).emit('message:typing', {
        conversationId,
        user,
        isTyping: false,
      });
    });

    socket.on('message:react', ({ conversationId, messageId, reactions }) => {
      socket.to(`conversation:${conversationId}`).emit('message:reacted', {
        conversationId,
        messageId,
        reactions,
      });
    });

    // 6. Collaborative Documents & Live Cursor Sync
    socket.on('document:join', ({ documentId, user }) => {
      if (!documentId) return;
      socket.join(`document:${documentId}`);
      socket.to(`document:${documentId}`).emit('document:collaborator:joined', {
        documentId,
        user,
      });
    });

    socket.on('document:leave', ({ documentId, user }) => {
      if (!documentId) return;
      socket.leave(`document:${documentId}`);
      socket.to(`document:${documentId}`).emit('document:collaborator:left', {
        documentId,
        user,
      });
    });

    socket.on('document:change', ({ documentId, content, title, version, user }) => {
      socket.to(`document:${documentId}`).emit('document:updated', {
        documentId,
        content,
        title,
        version,
        user,
      });
    });

    socket.on('document:cursor', ({ documentId, user, position, selection }) => {
      socket.to(`document:${documentId}`).emit('document:cursor:moved', {
        documentId,
        user,
        position,
        selection,
      });
    });

    // 7. Instant Notifications
    socket.on('notification:send', ({ recipientId, notification }) => {
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('notification:new', notification);
      }
    });

    // 8. Activity Timeline Live Broadcast
    socket.on('activity:new', ({ workspaceId, activity }) => {
      if (workspaceId) {
        io.to(`workspace:${workspaceId}`).emit('activity:created', activity);
      }
    });

    // 9. Disconnect
    socket.on('disconnect', async () => {
      const userSession = activeUsers.get(socket.id);
      if (userSession) {
        const { userId, workspaces } = userSession;

        // Broadcast offline to workspaces
        workspaces.forEach((wId) => {
          socket.to(`workspace:${wId}`).emit('workspace:member:offline', {
            workspaceId: wId,
            userId,
          });
        });

        activeUsers.delete(socket.id);

        if (userSocketMap.has(userId)) {
          userSocketMap.get(userId).delete(socket.id);
          if (userSocketMap.get(userId).size === 0) {
            userSocketMap.delete(userId);
            try {
              await User.findByIdAndUpdate(userId, {
                status: 'offline',
                lastSeen: new Date(),
              });
            } catch (e) {}

            io.emit('presence:update', {
              userId,
              status: 'offline',
              lastSeen: new Date(),
            });
          }
        }
      }
    });
  });
};

module.exports = { setupSockets };
