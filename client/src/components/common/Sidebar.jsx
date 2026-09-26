import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Building2,
  MessageSquare,
  FileText,
  Calendar,
  Paperclip,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Avatar } from './Avatar';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeWorkspace, isAdmin, onlineMembers } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Workspaces', path: '/workspaces', icon: Building2 },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Files', path: '/files', icon: Paperclip },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    ...(isAdmin ? [{ label: 'Admin Panel', path: '/admin', icon: Shield, badge: 'Admin' }] : []),
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen flex flex-col justify-between bg-white/95 dark:bg-surface-950/95 border-r border-surface-200 dark:border-surface-800/80 backdrop-blur-xl transition-all duration-300 shadow-sm dark:shadow-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-surface-200 dark:border-surface-800/80">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-surface-950 dark:text-white flex items-center gap-1.5">
                    Collab<span className="text-brand-600 dark:text-brand-400">Flow</span>
                  </h1>
                  <span className="text-[10px] text-surface-500 dark:text-surface-400 font-medium tracking-wide uppercase">Real-Time SaaS</span>
                </div>
              )}
            </NavLink>

            {/* Collapse toggle button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 text-surface-500 dark:text-surface-400 hover:text-surface-950 dark:hover:text-white rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Current Workspace Pill */}
          {!collapsed && activeWorkspace && (
            <div className="mx-3 mt-3 p-2.5 rounded-xl bg-surface-100/90 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg flex-shrink-0">{activeWorkspace.icon || '⚡'}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-surface-900 dark:text-white truncate">{activeWorkspace.name}</p>
                  <p className="text-[10px] text-surface-500 dark:text-surface-400 truncate">
                    {activeWorkspace.members?.length || 1} team member{activeWorkspace.members?.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2 overflow-y-auto max-h-[calc(100vh-280px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 shadow-sm font-semibold'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-950 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/60'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Online Presence & User Card */}
        <div className="p-3 border-t border-surface-200 dark:border-surface-800/80 bg-surface-50/80 dark:bg-surface-950/60">
          {/* Active online members indicator */}
          {!collapsed && (
            <div className="mb-3 px-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Live Presence
                </span>
              </div>
              <span className="text-[11px] font-bold text-brand-700 dark:text-brand-400 bg-brand-100 dark:bg-brand-950/80 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-500/30">
                {Math.max(onlineMembers.length, 1)} online
              </span>
            </div>
          )}

          {/* User Profile Footer */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-surface-900/80 border border-surface-200 dark:border-surface-800 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={user?.avatar}
                name={user?.name}
                size="sm"
                status="online"
                showStatus
              />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-surface-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-surface-500 dark:text-surface-400 truncate">{user?.position || user?.email}</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="text-surface-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
