import React, { useState, useEffect } from 'react';
import {
  FileText,
  MessageSquare,
  Bell,
  CheckCircle2,
  MousePointer,
  Sparkles,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';

export const RealTimeSyncVisualizer = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => (s + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      id: 0,
      user: 'Alex Rivera',
      role: 'Lead Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      action: 'Edits Architecture Specs Doc',
      type: 'document',
      badge: 'Live Mutation Broadcasted',
      color: '#10b981', // Emerald
    },
    {
      id: 1,
      user: 'Bhavana Sharma',
      role: 'Frontend Lead',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      action: 'Sees live cursor & diffs at 60fps',
      type: 'cursor',
      badge: 'Zero-Latency Viewport Sync',
      color: '#14b8a6', // Teal
    },
    {
      id: 2,
      user: 'Tejaswi Rao',
      role: 'Principal Backend',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      action: 'Comments "@Harsha review UI endpoints"',
      type: 'comment',
      badge: 'Threaded Discussion Synced',
      color: '#f59e0b', // Amber
    },
    {
      id: 3,
      user: 'Harsha Vardhan',
      role: 'Product Designer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      action: 'Receives instant Push Notification',
      type: 'notification',
      badge: 'Scoped Alert Dispatched',
      color: '#f97316', // Warm Orange/Coral
    },
  ];

  return (
    <div className="relative p-8 sm:p-12 rounded-3xl bg-white/90 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-800 shadow-2xl backdrop-blur-xl overflow-hidden text-left transition-colors duration-200">
      {/* Background glow mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[250px] bg-brand-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Continuous Synchronization Loop
        </span>
        <h3 className="text-2xl sm:text-4xl font-extrabold text-surface-950 dark:text-white tracking-tight mt-2">
          Everyone stays in sync. Always.
        </h3>
        <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">
          When one teammate acts, WebSocket channels push scoped event payloads to all connected peers in milliseconds.
        </p>
      </div>

      {/* 4 Connected Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        {steps.map((item, idx) => {
          const isActive = activeStep === idx;

          return (
            <div
              key={item.id}
              onClick={() => setActiveStep(idx)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative shadow-sm ${
                isActive
                  ? 'bg-white dark:bg-surface-950 border-brand-500 shadow-xl shadow-brand-500/20 scale-[1.03] ring-1 ring-brand-500/50'
                  : 'bg-surface-50 dark:bg-surface-950/50 hover:bg-white dark:hover:bg-surface-950/80 border-surface-200 dark:border-surface-800/80 opacity-70 hover:opacity-100'
              }`}
            >
              {isActive && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md animate-pulse">
                  Step {idx + 1}
                </span>
              )}

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={item.avatar} name={item.user} size="sm" status="online" showStatus />
                  <div>
                    <h5 className="text-xs font-bold text-surface-900 dark:text-white tracking-tight">{item.user}</h5>
                    <p className="text-[10px] text-surface-500 dark:text-surface-400">{item.role}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-xs font-medium text-surface-800 dark:text-surface-200 min-h-[50px] flex items-center shadow-sm dark:shadow-none">
                  {item.action}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-200 dark:border-surface-800/60 flex items-center justify-between">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                    border: `1px solid ${item.color}40`,
                  }}
                >
                  {item.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Central Interactive Document Node */}
      <div className="mt-8 p-4 rounded-2xl bg-surface-50 dark:bg-surface-950/80 border border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-700 dark:text-surface-300 transition-colors duration-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-surface-900 dark:text-white">Central State: CollabFlow Architecture & Vision</span>
            <span className="text-surface-500 block text-[11px]">Synced across 4 clients with sub-50ms WebSocket latency</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/80 px-3 py-1.5 rounded-xl border border-brand-200 dark:border-brand-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          Socket.IO Scope: room(workspace:1)
        </div>
      </div>
    </div>
  );
};
