import React from 'react';
import { Calendar, CheckSquare, MessageSquare, Paperclip, Clock } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { PriorityBadge } from '../common/PriorityBadge';

export const TaskCard = ({ task, onClick, onDragStart, onDragEnd }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className="group p-4 bg-surface-900/90 hover:bg-surface-800 border border-slate-800/80 hover:border-slate-700/90 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-brand-950/20 transition-all duration-200 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Priority and Tags */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <PriorityBadge priority={task.priority} />
        {task.labels && task.labels.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.labels.slice(0, 2).map((label, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${label.color || '#6366f1'}20`,
                  color: label.color || '#a5b4fc',
                  border: `1px solid ${label.color || '#6366f1'}40`,
                }}
              >
                {label.text}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors line-clamp-2 tracking-tight">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress Bar (if present) */}
      {subtasksCount > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-brand-400" />
              Subtasks
            </span>
            <span>
              {completedSubtasks}/{subtasksCount}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${(completedSubtasks / subtasksCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-slate-400 text-xs">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <Avatar
              src={task.assignee.avatar}
              name={task.assignee.name}
              size="xs"
              status={task.assignee.status}
              showStatus
            />
          ) : (
            <span className="text-[11px] text-slate-500 italic">Unassigned</span>
          )}
        </div>

        {/* Due Date & Badges */}
        <div className="flex items-center gap-3">
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px]" title="Attachments">
              <Paperclip className="w-3.5 h-3.5" />
              {task.attachments.length}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                isOverdue
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
