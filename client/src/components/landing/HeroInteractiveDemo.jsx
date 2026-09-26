import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
  MessageSquare,
  Bell,
  Check,
  MousePointer,
  RotateCcw,
} from 'lucide-react';

export const HeroInteractiveDemo = () => {
  // Steps: 0 = In Progress, 1 = Moving, 2 = Completed with Notification & Chat
  const [step, setStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 45, y: 55 });
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const sequence = async () => {
      // Step 0: Idle at In Progress
      setStep(0);
      setCursorPos({ x: 45, y: 55 });

      await new Promise((r) => setTimeout(r, 2200));

      // Step 1: Cursor moves and grabs card
      setCursorPos({ x: 80, y: 55 });
      setStep(1);

      await new Promise((r) => setTimeout(r, 1400));

      // Step 2: Card drops in Completed, notification & chat pop up
      setStep(2);

      await new Promise((r) => setTimeout(r, 3800));
    };

    const interval = setInterval(() => {
      sequence();
    }, 7800);

    sequence();

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div className="relative w-full rounded-2xl bg-white/95 dark:bg-surface-900/90 border border-surface-200 dark:border-surface-700/80 shadow-2xl backdrop-blur-2xl overflow-hidden p-4 sm:p-6 text-left transition-colors duration-200">
      {/* Top Demo Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-xs font-bold text-surface-900 dark:text-white tracking-tight">
            Live Interactive Product Demonstration
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 font-semibold border border-brand-500/30">
            Real-Time Engine Active
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
            <Radio className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 animate-pulse" />
            <span>4 Peers Connected</span>
          </div>

          <button
            onClick={() => {
              setIsAutoPlaying(false);
              setStep((s) => (s + 1) % 3);
            }}
            className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 hover:text-surface-950 dark:hover:text-white transition-colors"
            title="Step simulation manually"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Simulated Canvas */}
      <div className="relative pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[340px]">
        {/* Animated Live Cursor representing Bhavana */}
        <div
          className="absolute z-30 transition-all duration-1000 ease-out pointer-events-none hidden sm:flex items-center gap-1.5"
          style={{
            left: `${cursorPos.x}%`,
            top: `${cursorPos.y}%`,
          }}
        >
          <MousePointer className="w-5 h-5 text-brand-500 dark:text-brand-400 fill-brand-500 drop-shadow-md" />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-600 text-white shadow-lg whitespace-nowrap">
            Bhavana Sharma (Lead)
          </span>
        </div>

        {/* Column 1: Backlog */}
        <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-950/60 border border-surface-200 dark:border-surface-800/80 flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Backlog</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-400 font-bold">1</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-1.5 opacity-90 shadow-sm dark:shadow-none">
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 font-semibold">Design</span>
              <h5 className="text-xs font-semibold text-surface-900 dark:text-white">Create token styleguide</h5>
              <div className="flex items-center justify-between pt-2 text-[10px] text-surface-500">
                <span>Harsha V.</span>
                <span>Oct 12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-950/60 border border-surface-200 dark:border-surface-800/80 flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider">In Progress</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-500/20 text-accent-700 dark:text-accent-300 font-bold">
                {step === 0 ? '1' : '0'}
              </span>
            </div>

            {step === 0 && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-surface-900 border border-accent-500/40 shadow-lg shadow-accent-500/10 space-y-2 animate-fade-in transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-500/20 text-accent-700 dark:text-accent-300">
                    High Priority
                  </span>
                  <span className="text-[10px] text-surface-500 dark:text-surface-400">2/2 subtasks</span>
                </div>
                <h5 className="text-xs font-bold text-surface-900 dark:text-white">Design & Animate Homepage</h5>
                <p className="text-[11px] text-surface-500 dark:text-surface-400">3D interactive hero with live Socket.IO sync</p>
                <div className="flex items-center justify-between pt-2 border-t border-surface-200 dark:border-surface-800 text-[10px] text-surface-600 dark:text-surface-400">
                  <span className="text-brand-600 dark:text-brand-400 font-semibold">Bhavana S.</span>
                  <span className="text-accent-600 dark:text-accent-400 font-bold">WIP</span>
                </div>
              </div>
            )}

            {step > 0 && (
              <div className="h-28 border border-dashed border-surface-300 dark:border-surface-800 rounded-xl flex items-center justify-center text-[11px] text-surface-400 dark:text-surface-500 italic">
                Card moving in real time...
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-950/60 border border-surface-200 dark:border-surface-800/80 flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Completed</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold">
                {step === 2 ? '2' : '1'}
              </span>
            </div>

            <div className="space-y-2">
              {step >= 1 && (
                <div
                  className={`p-3.5 rounded-xl bg-white dark:bg-surface-900 border space-y-2 transition-all duration-500 shadow-md ${
                    step === 2
                      ? 'border-brand-500 shadow-xl shadow-brand-500/20 scale-100 ring-2 ring-brand-500/40'
                      : 'border-surface-300 dark:border-surface-700 opacity-60 scale-95'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-700 dark:text-brand-300 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">Instant Sync</span>
                  </div>
                  <h5 className="text-xs font-bold text-surface-900 dark:text-white">Design & Animate Homepage</h5>
                  <div className="flex items-center justify-between pt-2 border-t border-surface-200 dark:border-surface-800 text-[10px] text-surface-600 dark:text-surface-400">
                    <span className="text-brand-600 dark:text-brand-400 font-semibold">Bhavana S.</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">100%</span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white/70 dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800/70 opacity-70">
                <h5 className="text-xs font-medium text-surface-700 dark:text-surface-300">Setup Project Architecture</h5>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 mt-1 block font-medium">Completed yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Real-Time Event Feed (Bottom Toasts & Chat preview) */}
      <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Live Notification Indicator */}
        <div className="flex items-center gap-2">
          {step === 2 ? (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-brand-50 dark:bg-brand-950/80 border border-brand-300 dark:border-brand-500/40 text-brand-900 dark:text-brand-200 animate-slide-up">
              <Bell className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 animate-bounce" />
              <span><strong>Alex Rivera:</strong> Received notification "Design Homepage completed"</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
              <span>Watching live WebSocket room: <code>workspace:acme-cloud</code></span>
            </div>
          )}
        </div>

        {/* Live Chat Broadcast */}
        {step === 2 && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-accent-50 dark:bg-accent-950/80 border border-accent-300 dark:border-accent-500/40 text-accent-900 dark:text-accent-200 animate-slide-up">
            <MessageSquare className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
            <span><strong>Alex:</strong> "Awesome velocity! Document specs updated. 🚀"</span>
          </div>
        )}
      </div>
    </div>
  );
};
