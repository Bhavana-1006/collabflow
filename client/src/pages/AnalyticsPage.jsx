import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';

export const AnalyticsPage = () => {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md">
        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Productivity & Velocity Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics on sprint progress, completion velocity, and team distribution for {activeWorkspace?.name}
        </p>
      </div>

      <AnalyticsDashboard workspaceId={activeWorkspace?._id} />
    </div>
  );
};
