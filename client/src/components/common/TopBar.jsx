import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Check,
  Trash2,
  ChevronDown,
  Building2,
  CheckSquare,
  FolderKanban,
  FileText,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useSocket } from '../../context/SocketContext';
import { notificationService } from '../../services/notificationService';
import { Avatar } from './Avatar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { ThemeToggle } from './ThemeToggle';

export const TopBar = ({ setIsMobileOpen, onOpenCreateTask, onOpenCreateProject }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { socket } = useSocket();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const wsRef = useRef(null);
  const userRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for live socket notifications
  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotif);
    return () => socket.off('notification:new', handleNewNotif);
  }, [socket]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotificationOpen(false);
      if (wsRef.current && !wsRef.current.contains(e.target)) setIsWorkspaceMenuOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleMarkRead = async (id, link) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) {
        navigate(link);
        setIsNotificationOpen(false);
      }
    } catch (e) {}
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {}
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors duration-200 shadow-sm dark:shadow-none">
        {/* Left Section: Mobile Menu + Workspace Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 text-surface-600 dark:text-surface-400 hover:text-surface-950 dark:hover:text-white rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Workspace Switcher */}
          <div className="relative" ref={wsRef}>
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-900/90 hover:bg-surface-200 dark:hover:bg-surface-800/90 border border-surface-300 dark:border-surface-800 text-left transition-all group"
            >
              <span className="text-base">{activeWorkspace?.icon || '⚡'}</span>
              <span className="text-sm font-semibold text-surface-900 dark:text-white max-w-[140px] sm:max-w-[200px] truncate">
                {activeWorkspace?.name || 'Select Workspace'}
              </span>
              <ChevronDown className="w-4 h-4 text-surface-500 dark:text-surface-400 group-hover:text-surface-950 dark:group-hover:text-white transition-transform" />
            </button>

            {/* Dropdown */}
            {isWorkspaceMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-slide-up">
                <div className="px-3 py-2 text-[11px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Your Workspaces
                </div>
                <div className="space-y-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws._id}
                      onClick={() => {
                        setActiveWorkspace(ws);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-sm transition-colors ${
                        activeWorkspace?._id === ws._id
                          ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 font-semibold border border-brand-200 dark:border-brand-500/30'
                          : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800/80 hover:text-surface-950 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{ws.icon || '⚡'}</span>
                        <span className="truncate">{ws.name}</span>
                      </div>
                      {activeWorkspace?._id === ws._id && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-surface-200 dark:border-surface-800 mt-2 pt-2">
                  <button
                    onClick={() => {
                      navigate('/workspaces');
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Manage & Create Workspaces
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center / Search Launcher */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 max-w-md hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-900/60 hover:bg-surface-200 dark:hover:bg-surface-900 border border-surface-300 dark:border-surface-800/80 text-surface-500 dark:text-surface-400 text-sm transition-all group"
        >
          <Search className="w-4 h-4 text-surface-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" />
          <span className="flex-1 text-left truncate text-surface-600 dark:text-surface-400">Search projects, tasks, docs...</span>
          <kbd className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-surface-600 dark:text-surface-400 font-mono shadow-sm dark:shadow-none">
            ⌘K
          </kbd>
        </button>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Quick Search mobile icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 text-surface-600 dark:text-surface-400 hover:text-surface-950 dark:hover:text-white rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-surface-600 dark:text-surface-300 hover:text-surface-950 dark:hover:text-white rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-500 rounded-full ring-2 ring-white dark:ring-surface-950 animate-pulse" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/60">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-surface-400 text-xs">
                      No notifications yet. You're all caught up!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleMarkRead(n._id, n.link)}
                        className={`p-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/70 cursor-pointer transition-colors flex items-start gap-3 ${
                          !n.read ? 'bg-brand-50/70 dark:bg-brand-950/20' : ''
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-brand-500 opacity-90" style={{ visibility: n.read ? 'hidden' : 'visible' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-surface-900 dark:text-white">{n.title}</p>
                          <p className="text-xs text-surface-600 dark:text-surface-300 mt-0.5 break-words">{n.message}</p>
                          <span className="text-[10px] text-surface-400 dark:text-surface-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteNotif(e, n._id)}
                          className="text-surface-400 hover:text-rose-500 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <Avatar src={user?.avatar} name={user?.name} size="sm" status="online" showStatus />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-slide-up">
                <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-800">
                  <p className="text-sm font-bold text-surface-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user?.email}</p>
                </div>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-surface-700 dark:text-surface-300 hover:text-surface-950 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
