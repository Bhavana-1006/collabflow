import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { workspaceService } from '../services/workspaceService';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { socket, joinWorkspace, leaveWorkspace } = useSocket();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineMembers, setOnlineMembers] = useState([]);

  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await workspaceService.getMyWorkspaces();
      if (res.success && res.workspaces) {
        setWorkspaces(res.workspaces);

        // Determine active workspace: from user.activeWorkspace or local storage or first workspace
        const savedId = localStorage.getItem('collabflow_active_workspace_id');
        const found =
          res.workspaces.find((w) => w._id === savedId) ||
          res.workspaces.find((w) => w._id === user?.activeWorkspace?._id || w._id === user?.activeWorkspace) ||
          res.workspaces[0];

        if (found) {
          setActiveWorkspaceState(found);
          localStorage.setItem('collabflow_active_workspace_id', found._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Join workspace socket room and manage presence
  useEffect(() => {
    if (activeWorkspace && socket) {
      joinWorkspace(activeWorkspace._id);

      // Presence list from server
      const handlePresenceList = ({ workspaceId, onlineMembers: list }) => {
        if (workspaceId === activeWorkspace._id) {
          setOnlineMembers(list || []);
        }
      };

      const handleMemberOnline = ({ workspaceId, userId }) => {
        if (workspaceId === activeWorkspace._id) {
          setOnlineMembers((prev) => {
            if (prev.some((m) => m.userId === userId)) return prev;
            return [...prev, { userId, status: 'online' }];
          });
        }
      };

      const handleMemberOffline = ({ workspaceId, userId }) => {
        if (workspaceId === activeWorkspace._id) {
          setOnlineMembers((prev) => prev.filter((m) => m.userId !== userId));
        }
      };

      socket.on('workspace:presence:list', handlePresenceList);
      socket.on('workspace:member:online', handleMemberOnline);
      socket.on('workspace:member:offline', handleMemberOffline);

      return () => {
        leaveWorkspace(activeWorkspace._id);
        socket.off('workspace:presence:list', handlePresenceList);
        socket.off('workspace:member:online', handleMemberOnline);
        socket.off('workspace:member:offline', handleMemberOffline);
      };
    }
  }, [activeWorkspace?._id, socket]);

  const setActiveWorkspace = (ws) => {
    setActiveWorkspaceState(ws);
    if (ws && ws._id) {
      localStorage.setItem('collabflow_active_workspace_id', ws._id);
    }
  };

  // Determine current user's role in active workspace
  const currentRole = React.useMemo(() => {
    if (!activeWorkspace || !user) return 'viewer';
    if (activeWorkspace.owner?._id === user._id || activeWorkspace.owner === user._id) {
      return 'owner';
    }
    const member = (activeWorkspace.members || []).find(
      (m) => (m.user?._id || m.user) === user._id
    );
    return member ? member.role : 'viewer';
  }, [activeWorkspace, user]);

  const isAdmin = currentRole === 'owner' || currentRole === 'admin';

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        currentRole,
        isAdmin,
        loading,
        fetchWorkspaces,
        onlineMembers,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
