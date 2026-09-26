import React, { useState } from 'react';
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  BarChart3,
  CheckSquare,
  Users,
  Radio,
  Sparkles,
  Paperclip,
  Check,
  Send,
  Flame,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Avatar } from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';

const sampleChartData = [
  { day: 'Mon', completed: 4, created: 3 },
  { day: 'Tue', completed: 7, created: 5 },
  { day: 'Wed', completed: 11, created: 6 },
  { day: 'Thu', completed: 14, created: 8 },
  { day: 'Fri', completed: 19, created: 9 },
  { day: 'Sat', completed: 24, created: 10 },
  { day: 'Sun', completed: 28, created: 11 },
];

export const InteractiveProductShowcase = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'docs' | 'chat' | 'analytics'
  const [interactiveMessages, setInteractiveMessages] = useState([
    { sender: 'Alex Rivera', role: 'Lead Architect', text: 'Sprint 24 goals deployed! WebSockets running at top speed. ⚡', time: '10:42 AM' },
    { sender: 'Bhavana Sharma', role: 'Frontend Lead', text: 'Live cursor tracking and Kanban drag transitions are ultra smooth.', time: '10:44 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setInteractiveMessages((prev) => [
      ...prev,
      {
        sender: 'You (Visitor)',
        role: 'Live Demo Explorer',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="relative rounded-3xl bg-white/95 dark:bg-surface-900/90 border border-surface-200 dark:border-surface-700/80 shadow-2xl backdrop-blur-2xl overflow-hidden text-left transition-colors duration-200">
      {/* Top Workspace Header Bar */}
      <div className="p-4 sm:p-5 border-b border-surface-200 dark:border-surface-800 bg-surface-50/80 dark:bg-surface-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-bold text-sm shadow-md">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-surface-900 dark:text-white tracking-tight">Acme Product Cloud</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-brand-500" /> 5 online
              </span>
            </div>
            <p className="text-[11px] text-surface-500 dark:text-surface-400">Mobile App V2 Launch • Sprint Backlog</p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-950 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Kanban Board
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-950 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Live Docs
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-950 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Team Chat
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-950 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </div>
      </div>

      {/* Showcase Viewport */}
      <div className="p-4 sm:p-6 min-h-[420px] flex flex-col justify-between">
        {/* Tab 1: Kanban Board Preview */}
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Column 1: To Do */}
            <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-950/70 border border-surface-200 dark:border-surface-800 space-y-3 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider">To Do</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-500/20 text-accent-700 dark:text-accent-300 font-bold">2</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-2 shadow-sm dark:shadow-none">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-500/15 text-accent-700 dark:text-accent-300">Feature</span>
                <h5 className="text-xs font-bold text-surface-900 dark:text-white">Setup MongoDB change stream indexes</h5>
                <p className="text-[11px] text-surface-500 dark:text-surface-400">Optimize compound index queries for sub-ms replies</p>
                <div className="flex items-center justify-between pt-2 text-[10px] text-surface-500">
                  <span>Tejaswi R.</span>
                  <span>Due in 3d</span>
                </div>
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-950/70 border border-accent-500/30 space-y-3 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider">In Progress</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-500/20 text-accent-700 dark:text-accent-300 font-bold">1</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-surface-900 border border-accent-500/40 shadow-lg shadow-accent-500/10 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 flex items-center gap-1 w-max">
                  <Flame className="w-3 h-3 text-rose-500" /> Urgent
                </span>
                <h5 className="text-xs font-bold text-surface-900 dark:text-white">Implement Socket.IO live cursor tracking</h5>
                <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 w-4/5 rounded-full" />
                </div>
                <div className="flex items-center justify-between pt-2 text-[10px] text-surface-500 dark:text-surface-400">
                  <span className="text-brand-600 dark:text-brand-400 font-semibold">Bhavana S.</span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold">Live Updating</span>
                </div>
              </div>
            </div>

            {/* Column 3: Completed */}
            <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-950/70 border border-brand-500/30 space-y-3 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Completed</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold">3</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-surface-900 border border-brand-500/30 space-y-2 shadow-sm dark:shadow-none">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center gap-1 w-max">
                  <Check className="w-3 h-3" /> Done
                </span>
                <h5 className="text-xs font-bold text-surface-900 dark:text-white">Design high-fidelity wireframes in Figma</h5>
                <div className="flex items-center justify-between pt-2 text-[10px] text-surface-500 dark:text-surface-400">
                  <span className="text-accent-600 dark:text-accent-400">Harsha V.</span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold">Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Collaborative Docs */}
        {activeTab === 'docs' && (
          <div className="rounded-2xl bg-surface-50 dark:bg-surface-950 p-5 border border-surface-200 dark:border-surface-800 space-y-4 transition-colors duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📘</span>
                <h4 className="text-sm font-bold text-surface-900 dark:text-white">CollabFlow Product Architecture & Vision</h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-brand-700 dark:text-brand-300 bg-brand-500/15 px-2.5 py-1 rounded-full border border-brand-500/30 font-semibold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse text-brand-500 dark:text-brand-400" />
                  3 people editing live
                </span>
              </div>
            </div>

            <div className="font-mono text-xs text-surface-800 dark:text-surface-300 space-y-2.5 leading-relaxed bg-white dark:bg-surface-900/60 p-4 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm dark:shadow-none">
              <p className="text-surface-900 dark:text-white font-bold text-sm">## 1. Executive Summary</p>
              <p className="text-surface-600 dark:text-surface-400">
                CollabFlow is engineered for high-velocity software engineering and product teams who demand instantaneous real-time collaboration without page refreshes.
              </p>
              <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 animate-pulse font-sans">
                <span className="w-1.5 h-3.5 bg-brand-500 dark:text-brand-400 inline-block animate-bounce" />
                <span className="text-[11px]">Bhavana Sharma is typing section 2.4...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Multi-Channel Team Chat */}
        {activeTab === 'chat' && (
          <div className="rounded-2xl bg-surface-50 dark:bg-surface-950 p-4 border border-surface-200 dark:border-surface-800 flex flex-col justify-between h-[360px] transition-colors duration-200">
            {/* Messages Feed */}
            <div className="space-y-3 overflow-y-auto pr-1">
              {interactiveMessages.map((msg, i) => (
                <div key={i} className="p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800/80 text-xs shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-brand-600 dark:text-brand-400">{msg.sender}</span>
                    <span className="text-[10px] text-surface-500">{msg.time}</span>
                  </div>
                  <p className="text-surface-800 dark:text-surface-200">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendChat} className="mt-3 flex gap-2 pt-2 border-t border-surface-200 dark:border-surface-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message to test real-time chat..."
                className="flex-1 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-xl px-3.5 py-2 text-xs text-surface-900 dark:text-white focus:outline-none focus:border-brand-500 shadow-sm dark:shadow-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-brand-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Analytics Preview */}
        {activeTab === 'analytics' && (
          <div className="rounded-2xl bg-surface-50 dark:bg-surface-950 p-5 border border-surface-200 dark:border-surface-800 space-y-4 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-surface-900 dark:text-white">Sprint Velocity & Throughput</h4>
                <p className="text-[11px] text-surface-500 dark:text-surface-400">Weekly task completion tracking (Last 7 Days)</p>
              </div>
              <span className="text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/80 px-2.5 py-1 rounded-full border border-brand-200 dark:border-brand-500/30">
                +34% Velocity
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampleChartData}>
                  <defs>
                    <linearGradient id="showcaseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke={isDark ? '#a1a1aa' : '#71717a'} fontSize={11} />
                  <YAxis stroke={isDark ? '#a1a1aa' : '#71717a'} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#18181b' : '#ffffff',
                      borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                      color: isDark ? '#f4f4f5' : '#18181b',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#showcaseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
