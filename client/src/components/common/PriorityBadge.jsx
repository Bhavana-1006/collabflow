import React from 'react';
import { Flame, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

const priorityConfig = {
  urgent: {
    label: 'Urgent',
    bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    icon: Flame,
    iconColor: 'text-rose-400',
  },
  high: {
    label: 'High',
    bg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    icon: ArrowUp,
    iconColor: 'text-orange-400',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: ArrowRight,
    iconColor: 'text-amber-400',
  },
  low: {
    label: 'Low',
    bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    icon: ArrowDown,
    iconColor: 'text-sky-400',
  },
};

export const PriorityBadge = ({ priority, showIcon = true, className = '' }) => {
  const config = priorityConfig[priority?.toLowerCase()] || priorityConfig.medium;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      {showIcon && <Icon className={`w-3 h-3 ${config.iconColor}`} />}
      {config.label}
    </span>
  );
};
