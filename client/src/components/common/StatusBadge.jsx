import React from 'react';

const statusConfig = {
  // Task statuses (No blue, no purple)
  backlog: { label: 'Backlog', bg: 'bg-surface-500/10 text-surface-400 border-surface-500/20' },
  todo: { label: 'To Do', bg: 'bg-accent-500/15 text-accent-400 border-accent-500/30' },
  in_progress: { label: 'In Progress', bg: 'bg-brand-500/15 text-brand-400 border-brand-500/30' },
  review: { label: 'Review', bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  completed: { label: 'Completed', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },

  // Project statuses
  planning: { label: 'Planning', bg: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
  active: { label: 'Active', bg: 'bg-brand-500/15 text-brand-400 border-brand-500/30' },
  on_hold: { label: 'On Hold', bg: 'bg-accent-500/15 text-accent-400 border-accent-500/30' },

  // Workspace Roles
  owner: { label: 'Owner', bg: 'bg-brand-500/20 text-brand-300 border-brand-500/40' },
  admin: { label: 'Admin', bg: 'bg-accent-500/20 text-accent-300 border-accent-500/40' },
  member: { label: 'Member', bg: 'bg-surface-500/15 text-surface-300 border-surface-500/30' },
  viewer: { label: 'Viewer', bg: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' },
};

export const StatusBadge = ({ status, className = '' }) => {
  const config = statusConfig[status?.toLowerCase()] || {
    label: status || 'Unknown',
    bg: 'bg-surface-500/10 text-surface-400 border-surface-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {config.label}
    </span>
  );
};
