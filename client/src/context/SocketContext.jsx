import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { realtime, info } = useToast();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      // Identify user on socket
      newSocket.emit('user:connect', {
        userId: user._id,
        user: {
          name: user.name,
          avatar: user.avatar,
          position: user.position,
        },
      });
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Presence update
    newSocket.on('presence:update', ({ userId, status, lastSeen }) => {
      setOnlineUsers((prev) => {
        const next = new Map(prev);
        next.set(userId, { status, lastSeen });
        return next;
      });
    });

    // Real-time Notification Listener
    newSocket.on('notification:new', (notification) => {
      realtime(notification.title || 'New Notification', notification.message);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?._id]);

  // Helper methods to join rooms
  const joinWorkspace = (workspaceId) => {
    if (socketRef.current && workspaceId) {
      socketRef.current.emit('workspace:join', { workspaceId, userId: user?._id });
    }
  };

  const leaveWorkspace = (workspaceId) => {
    if (socketRef.current && workspaceId) {
      socketRef.current.emit('workspace:leave', { workspaceId });
    }
  };

  const joinProject = (projectId) => {
    if (socketRef.current && projectId) {
      socketRef.current.emit('project:join', { projectId });
    }
  };

  const leaveProject = (projectId) => {
    if (socketRef.current && projectId) {
      socketRef.current.emit('project:leave', { projectId });
    }
  };

  const joinConversation = (conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('conversation:join', { conversationId });
    }
  };

  const leaveConversation = (conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('conversation:leave', { conversationId });
    }
  };

  const joinDocument = (documentId) => {
    if (socketRef.current && documentId) {
      socketRef.current.emit('document:join', { documentId, user });
    }
  };

  const leaveDocument = (documentId) => {
    if (socketRef.current && documentId) {
      socketRef.current.emit('document:leave', { documentId, user });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUsers,
        joinWorkspace,
        leaveWorkspace,
        joinProject,
        leaveProject,
        joinConversation,
        leaveConversation,
        joinDocument,
        leaveDocument,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
