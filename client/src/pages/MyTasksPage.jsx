import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ListFilter, Kanban, Check, Plus, Search } from 'lucide-react';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { TaskDetailModal } from '../components/kanban/TaskDetailModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const MyTasksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const { success } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchMyTasks = async () => {
    if (!activeWorkspace?._id) return;
    try {
      setLoading(true);
      const res = await taskService.getTasks({
        workspaceId: activeWorkspace._id,
        myTasks: 'true',
      });
      if (res.success && res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [activeWorkspace?._id]);

  const handleToggleComplete = async (e, task) => {
    e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      const res = await taskService.updateTask(task._id, { status: newStatus });
      if (res.success && res.task) {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? res.task : t)));
        success(newStatus === 'completed' ? 'Task Completed! 🎉' : 'Task Reopened');
      }
    } catch (err) {}
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            My Assigned Tasks
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personal actionable to-do list across all projects in {activeWorkspace?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {tasks.filter((t) => t.status === 'completed').length} / {tasks.length} Completed
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          {['all', 'todo', 'in_progress', 'review', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my tasks..."
            className="w-full bg-surface-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Tasks Table / List */}
      {loading ? (
        <LoadingSkeleton count={4} type="row" />
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-surface-900/40 rounded-2xl border border-dashed border-slate-800">
          No tasks found matching your filter.
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-900/60 border border-slate-800 overflow-hidden backdrop-blur-md divide-y divide-slate-800/60">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';

            return (
              <div
                key={task._id}
                onClick={() => {
                  setSelectedTask(task);
                  setIsDetailOpen(true);
                }}
                className="p-4 hover:bg-slate-800/40 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => handleToggleComplete(e, task)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-brand-400'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-white group-hover:text-brand-300'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{task.project?.name || 'Project'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && (
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {isDetailOpen && selectedTask && (
        <TaskDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onTaskUpdated={(updated) => {
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
          }}
          onTaskDeleted={(deletedId) => {
            setTasks((prev) => prev.filter((t) => t._id !== deletedId));
          }}
        />
      )}
    </div>
  );
};
