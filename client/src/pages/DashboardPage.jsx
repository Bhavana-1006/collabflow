import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  Radio,
  ArrowRight,
  Plus,
  Calendar,
  Activity as ActivityIcon,
  TrendingUp,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { Avatar } from '../components/common/Avatar';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeWorkspace, onlineMembers } = useWorkspace();

  const [statsData, setStatsData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace?._id) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, projectsRes, tasksRes, actRes] = await Promise.all([
          analyticsService.getDashboardStats(activeWorkspace._id),
          projectService.getProjects(activeWorkspace._id),
          taskService.getTasks({ workspaceId: activeWorkspace._id, myTasks: 'true' }),
          analyticsService.getDashboardStats(activeWorkspace._id), // or activityService
        ]);

        if (statsRes.success) setStatsData(statsRes);
        if (projectsRes.success) setProjects(projectsRes.projects || []);
        if (tasksRes.success) setMyTasks(tasksRes.tasks || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [activeWorkspace?._id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={4} type="card" />
        <LoadingSkeleton count={3} type="row" />
      </div>
    );
  }

  const stats = statsData?.stats || {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    totalTasks: myTasks.length,
    completedTasks: myTasks.filter((t) => t.status === 'completed').length,
    pendingTasks: myTasks.filter((t) => t.status !== 'completed').length,
    overdueTasks: 0,
    completionRate: 0,
  };

  const upcomingDeadlines = statsData?.upcomingDeadlines || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-950/90 via-surface-900 to-accent-950/40 light:from-brand-50 light:via-white light:to-surface-100 border border-brand-500/25 light:border-brand-200 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            {activeWorkspace?.name || 'Personal Workspace'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            You have <strong className="text-white">{myTasks.filter((t) => t.status !== 'completed').length} pending tasks</strong> and{' '}
            <strong className="text-brand-300">{projects.length} active projects</strong> in this workspace.
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.totalProjects}</h3>
            <span className="text-[11px] text-brand-400 font-medium">{stats.activeProjects} in progress</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.completedTasks}</h3>
            <span className="text-[11px] text-emerald-400 font-medium">{stats.completionRate}% completion rate</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.pendingTasks}</h3>
            <span className="text-[11px] text-amber-400 font-medium">Assigned to you</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Online Teammates</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{Math.max(onlineMembers.length, 1)}</h3>
            <span className="text-[11px] text-emerald-400 font-medium">Live presence active</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & My Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-brand-400" />
              Active Projects ({projects.length})
            </h3>
            <Link
              to="/projects"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="group p-5 rounded-2xl bg-surface-900/80 hover:bg-surface-800 border border-slate-800 hover:border-brand-500/40 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={project.status} />
                    <PriorityBadge priority={project.priority} />
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors tracking-tight">
                    {project.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-semibold text-white">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                    <span>{project.completedTasks || 0}/{project.totalTasks || 0} tasks</span>
                    <div className="flex -space-x-1.5">
                      {(project.members || []).slice(0, 3).map((m, i) => (
                        <Avatar key={i} src={m.avatar} name={m.name} size="xs" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* My Tasks Quick Access */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                My Assigned Tasks ({myTasks.length})
              </h3>
              <Link
                to="/my-tasks"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                Go to My Tasks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {myTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-surface-900/40 rounded-2xl border border-slate-800">
                  No tasks assigned to you currently.
                </div>
              ) : (
                myTasks.slice(0, 5).map((t) => (
                  <div
                    key={t._id}
                    onClick={() => navigate(`/projects/${t.project?._id || t.project}?task=${t._id}`)}
                    className="p-3.5 rounded-xl bg-surface-900/80 hover:bg-surface-800 border border-slate-800/80 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.project?.color || '#6366f1' }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                        <p className="text-[11px] text-slate-400">{t.project?.name || 'Project'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Online Teammates & Upcoming Deadlines */}
        <div className="space-y-6">
          {/* Online Teammates */}
          <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md">
            <h4 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Workspace Members
            </h4>

            <div className="space-y-3">
              {(activeWorkspace?.members || []).map((m) => {
                const u = m.user;
                if (!u) return null;
                const isOnline = onlineMembers.some((om) => om.userId === u._id);

                return (
                  <div key={u._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={u.avatar}
                        name={u.name}
                        size="xs"
                        status={isOnline ? 'online' : 'offline'}
                        showStatus
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.position || 'Member'}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isOnline
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isOnline ? 'Active' : 'Offline'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md">
            <h4 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Upcoming Deadlines
            </h4>

            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((d) => (
                  <div key={d._id} className="p-2.5 rounded-xl bg-surface-950/60 border border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">{d.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>Due: {new Date(d.dueDate).toLocaleDateString()}</span>
                      <PriorityBadge priority={d.priority} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
