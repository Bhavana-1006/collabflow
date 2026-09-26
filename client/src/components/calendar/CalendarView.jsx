import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { eventService } from '../../services/analyticsService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';

export const CalendarView = ({ workspaceId, workspaceMembers = [] }) => {
  const { success, error } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Event Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [type, setType] = useState('meeting');
  const [color, setColor] = useState('#6366f1');

  const fetchEvents = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const res = await eventService.getEvents(workspaceId);
      if (res.success && res.events) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [workspaceId]);

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !workspaceId) return;

    try {
      const start = new Date(startDate);
      const end = new Date(start.getTime() + 3600000); // 1 hr default

      const res = await eventService.createEvent({
        workspaceId,
        title: title.trim(),
        description: description.trim(),
        start,
        end,
        type,
        color,
      });

      if (res.success && res.event) {
        setEvents((prev) => [...prev, res.event]);
        success('Event Scheduled', title);
        setTitle('');
        setDescription('');
        setStartDate('');
        setIsModalOpen(false);
      }
    } catch (err) {
      error('Failed to schedule event');
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-slate-400">Deadlines, milestones, and team meetings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Today
          </button>
          <div className="flex items-center border border-slate-800 rounded-xl bg-surface-950 overflow-hidden">
            <button
              onClick={prevMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Month Days Grid */}
      <div className="rounded-2xl bg-surface-900/60 border border-slate-800 overflow-hidden backdrop-blur-md">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-surface-950/60 text-center py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/60 min-h-[560px]">
          {/* Empty prefix slots */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 bg-surface-950/30 opacity-40 min-h-[90px]" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const thisDate = new Date(year, month, dayNum);
            const isToday =
              new Date().toDateString() === thisDate.toDateString();

            const dayEvents = events.filter((e) => {
              const d = new Date(e.start);
              return (
                d.getDate() === dayNum &&
                d.getMonth() === month &&
                d.getFullYear() === year
              );
            });

            return (
              <div
                key={dayNum}
                className={`p-2 min-h-[90px] flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-brand-600/10' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/40'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* Event Pills */}
                <div className="space-y-1 mt-1">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt._id}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md truncate cursor-pointer shadow-sm"
                      style={{
                        backgroundColor: `${evt.color || '#6366f1'}25`,
                        color: evt.color || '#a5b4fc',
                        border: `1px solid ${evt.color || '#6366f1'}40`,
                      }}
                      title={`${evt.title} (${evt.type})`}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Event / Meeting"
        subtitle="Set milestones, sprint syncs, or project deadlines"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint Demo & Retrospective"
              className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="meeting">Team Meeting</option>
                <option value="deadline">Task Deadline</option>
                <option value="milestone">Milestone</option>
                <option value="other">Other Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Color Tag
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="#10b981">Emerald (Default)</option>
                <option value="#34d399">Mint (Milestone)</option>
                <option value="#f59e0b">Amber (Important)</option>
                <option value="#ef4444">Rose (Urgent)</option>
                <option value="#14b8a6">Teal (Design)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add meeting agenda or video link..."
              className="w-full bg-surface-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-600/30 transition-all"
            >
              Save Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
