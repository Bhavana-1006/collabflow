import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card', className = '' }) => {
  return (
    <div className={`space-y-3 w-full animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx}>
          {type === 'card' && (
            <div className="h-32 bg-surface-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-5 bg-slate-800 rounded w-1/3" />
                <div className="h-5 bg-slate-800 rounded-full w-16" />
              </div>
              <div className="h-3 bg-slate-800/80 rounded w-2/3" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-6 bg-slate-800 rounded-full" />
                <div className="h-4 bg-slate-800 rounded w-20" />
              </div>
            </div>
          )}

          {type === 'row' && (
            <div className="h-14 bg-surface-900/60 border border-slate-800 rounded-xl px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="h-4 bg-slate-800 rounded w-32" />
              </div>
              <div className="h-4 bg-slate-800 rounded w-24" />
              <div className="h-5 bg-slate-800 rounded-full w-20" />
            </div>
          )}

          {type === 'kanban' && (
            <div className="h-80 bg-surface-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="h-6 bg-slate-800 rounded w-1/2 mb-4" />
              <div className="h-20 bg-slate-800/60 rounded-xl" />
              <div className="h-20 bg-slate-800/60 rounded-xl" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
