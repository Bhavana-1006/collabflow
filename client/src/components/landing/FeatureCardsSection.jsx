import React from 'react';
import {
  Zap,
  FolderKanban,
  FileText,
  MessageSquare,
  Bell,
  UploadCloud,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Radio,
} from 'lucide-react';

const FEATURES = [
  {
    id: 'realtime',
    title: 'Real-Time Collaboration',
    description: 'Sub-50ms WebSocket synchronization pushes card moves, comments, and document edits across all clients immediately.',
    icon: Zap,
    color: '#10b981', // Emerald
    badge: 'Socket.IO Active',
  },
  {
    id: 'kanban',
    title: 'Project & Sprint Management',
    description: 'Dynamic Kanban boards with subtasks, multi-priority levels, overdue warnings, and assignee avatars.',
    icon: FolderKanban,
    color: '#f59e0b', // Amber
    badge: 'Drag & Drop',
  },
  {
    id: 'docs',
    title: 'Collaborative Documents',
    description: 'Co-author specifications with live cursor indicators, active collaborator presence, and 1-click version history rollbacks.',
    icon: FileText,
    color: '#14b8a6', // Teal
    badge: 'Version History',
  },
  {
    id: 'chat',
    title: 'Multi-Channel Team Chat',
    description: 'Workspace-wide general channels, project rooms, and direct messages with live typing notifications and emoji reactions.',
    icon: MessageSquare,
    color: '#059669', // Forest Emerald
    badge: 'Channels & DMs',
  },
  {
    id: 'notifications',
    title: 'Smart Push Notifications',
    description: 'Instant scoped alerts for task assignments, comment mentions, project updates, and approaching deadlines.',
    icon: Bell,
    color: '#d97706', // Warm Gold
    badge: 'Real-Time Alerts',
  },
  {
    id: 'files',
    title: 'Cloud File & Asset Storage',
    description: 'Upload, preview, download, and categorize assets with Cloudinary integration and safe disk storage fallback.',
    icon: UploadCloud,
    color: '#f97316', // Tangerine/Orange
    badge: 'Cloudinary CDN',
  },
  {
    id: 'analytics',
    title: 'Productivity & Velocity Analytics',
    description: 'Interactive Recharts dashboards tracking sprint velocity, task status breakdowns, and teammate workloads.',
    icon: BarChart3,
    color: '#84cc16', // Lime
    badge: 'Recharts Graphs',
  },
  {
    id: 'admin',
    title: 'Role-Based Workspace Governance',
    description: 'Granular permissions for Owners, Admins, Members, and Viewers with full audit timelines and settings.',
    icon: Shield,
    color: '#047857', // Deep Jade
    badge: 'Role Authorization',
  },
];

export const FeatureCardsSection = () => {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Built For Production Performance
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-surface-950 dark:text-white tracking-tight mt-2">
          An all-in-one suite designed to keep teams moving fast
        </h2>
        <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 mt-3">
          Every tool engineered to work harmoniously together with zero latency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="group p-6 rounded-2xl bg-white dark:bg-surface-900/80 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-xl dark:shadow-none flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                    style={{
                      backgroundColor: `${f.color}15`,
                      color: f.color,
                      border: `1px solid ${f.color}30`,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${f.color}15`,
                      color: f.color,
                      border: `1px solid ${f.color}30`,
                    }}
                  >
                    {f.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight">
                  {f.title}
                </h3>
                <p className="text-xs text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  {f.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-800/80 flex items-center justify-between text-xs text-surface-500">
                <span className="flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform font-semibold">
                  Explore feature <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
