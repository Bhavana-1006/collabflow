import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  TrendingUp,
  Award,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { Avatar } from '../common/Avatar';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

export const AnalyticsDashboard = ({ workspaceId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getDashboardStats(workspaceId);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [workspaceId]);

  if (loading) {
    return <LoadingSkeleton count={3} type="card" />;
  }

  if (!data) return null;

  const { stats, statusChartData, priorityChartData, trendData, membersWorkload } = data;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.completionRate}%</h3>
            <span className="text-[11px] text-emerald-400 font-medium">
              {stats.completedTasks} of {stats.totalTasks} tasks done
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.activeProjects}</h3>
            <span className="text-[11px] text-brand-400 font-medium">{stats.totalProjects} total projects</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.pendingTasks}</h3>
            <span className="text-[11px] text-amber-400 font-medium">In sprint backlog & WIP</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Tasks</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.overdueTasks}</h3>
            <span className="text-[11px] text-rose-400 font-medium">Require team attention</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Row: Weekly Velocity + Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Productivity Velocity Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-400" />
                Productivity Trends
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Tasks created vs completed (Last 7 Days)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Tasks Completed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Tasks Created"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="p-6 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Status Breakdown</h4>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across Kanban columns</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {statusChartData.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}: <strong className="text-white">{item.count}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Priority Bar Chart & Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown Bar Chart */}
        <div className="p-6 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md">
          <h4 className="text-base font-bold text-white tracking-tight">Priority Distribution</h4>
          <p className="text-xs text-slate-400 mt-0.5">Tasks classified by urgency</p>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-priority-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Workload Breakdown */}
        <div className="p-6 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md">
          <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Team Member Productivity
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Workload & task completion by teammate</p>

          <div className="space-y-4 mt-4 max-h-56 overflow-y-auto pr-1">
            {membersWorkload.map((m) => {
              const percentage =
                m.totalAssigned > 0 ? Math.round((m.completed / m.totalAssigned) * 100) : 0;

              return (
                <div key={m._id} className="p-3 rounded-xl bg-surface-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={m.avatar} name={m.name} size="xs" />
                      <div>
                        <p className="text-xs font-bold text-white">{m.name}</p>
                        <p className="text-[10px] text-slate-400">{m.position}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-brand-300">
                      {m.completed}/{m.totalAssigned} done ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
