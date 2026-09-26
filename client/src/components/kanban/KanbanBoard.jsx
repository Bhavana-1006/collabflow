import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckCircle2, User, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { taskService } from '../../services/taskService';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateTaskModal } from './CreateTaskModal';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#71717a', badgeClass: 'bg-surface-500/20 text-surface-400' },
  { id: 'todo', title: 'To Do', color: '#f59e0b', badgeClass: 'bg-accent-500/20 text-accent-400' },
  { id: 'in_progress', title: 'In Progress', color: '#10b981', badgeClass: 'bg-brand-500/20 text-brand-400' },
  { id: 'review', title: 'Review', color: '#f97316', badgeClass: 'bg-orange-500/20 text-orange-400' },
  { id: 'completed', title: 'Completed', color: '#059669', badgeClass: 'bg-emerald-500/20 text-emerald-400' },
];

export const KanbanBoard = ({ workspaceId, projectId, projectMembers = [] }) => {
  const { socket, joinProject, leaveProject } = useSocket();
  const { success, error, info } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState('todo');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Drag state
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);

  // Fetch project tasks
  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await taskService.getTasks({ projectId });
      if (res.success && res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  // Real-Time Socket.IO Synchronization
  useEffect(() => {
    if (!projectId || !socket) return;
    joinProject(projectId);

    const handleTaskCreated = ({ task }) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === task._id)) return prev;
        return [...prev, task];
      });
      info('Real-Time Board Sync', `Task "${task.title}" was added`);
    };

    const handleTaskUpdated = ({ task }) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      if (selectedTask?._id === task._id) {
        setSelectedTask(task);
      }
    };

    const handleTaskMoved = ({ taskId, toStatus, fromStatus, task }) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: toStatus } : t))
      );
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      if (selectedTask?._id === taskId) {
        setIsDetailOpen(false);
      }
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      leaveProject(projectId);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [projectId, socket, selectedTask?._id]);

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(task._id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (e) => {
    // Only reset if leaving the column target itself
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverColumnId(null);
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (!taskId) return;

    const taskToMove = tasks.find((t) => t._id === taskId);
    if (!taskToMove || taskToMove.status === targetColumnId) return;

    const fromStatus = taskToMove.status;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetColumnId } : t))
    );

    // Trigger celebratory confetti when moved to completed
    if (targetColumnId === 'completed') {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b'],
        });
      } catch (e) {}
    }

    try {
      const res = await taskService.moveTask(taskId, targetColumnId);
      if (res.success && res.task) {
        // Broadcast move event over socket
        socket?.emit('task:move', {
          projectId,
          workspaceId,
          task: res.task,
          fromStatus,
          toStatus: targetColumnId,
        });
      }
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: fromStatus } : t))
      );
      error('Move Failed', 'Could not sync task movement to server');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAssignee =
      selectedAssignee === 'all' ||
      (selectedAssignee === 'unassigned' && !task.assignee) ||
      task.assignee?._id === selectedAssignee;

    const matchesPriority =
      selectedPriority === 'all' || task.priority === selectedPriority;

    return matchesSearch && matchesAssignee && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Board Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full bg-surface-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Assignee filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-surface-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {projectMembers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-surface-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Create Task Button */}
        <button
          onClick={() => {
            setCreateInitialStatus('todo');
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} count={1} type="kanban" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4.5 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter((t) => t.status === column.id);
            const isTarget = dragOverColumnId === column.id;

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex flex-col rounded-2xl bg-surface-950/70 border border-slate-800/80 p-3.5 transition-all duration-200 min-h-[500px] ${
                  isTarget ? 'drag-over-column ring-2 ring-brand-500/50' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="text-xs font-bold text-white tracking-tight uppercase">
                      {column.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${column.badgeClass}`}
                    >
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCreateInitialStatus(column.id);
                      setIsCreateOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title={`Add task in ${column.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onClick={(t) => {
                        setSelectedTask(t);
                        setIsDetailOpen(true);
                      }}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="h-28 border border-dashed border-slate-800/70 rounded-xl flex items-center justify-center text-xs text-slate-500 italic">
                      Drag tasks here
                    </div>
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
          projectMembers={projectMembers}
          onTaskUpdated={(updatedTask) => {
            setTasks((prev) =>
              prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            );
          }}
          onTaskDeleted={(deletedId) => {
            setTasks((prev) => prev.filter((t) => t._id !== deletedId));
          }}
        />
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          workspaceId={workspaceId}
          projectId={projectId}
          initialStatus={createInitialStatus}
          projectMembers={projectMembers}
          onTaskCreated={(newTask) => {
            setTasks((prev) => [...prev, newTask]);
          }}
        />
      )}
    </div>
  );
};
