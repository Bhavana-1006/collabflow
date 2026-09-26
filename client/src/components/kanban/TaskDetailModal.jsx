import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Clock,
  CheckSquare,
  Plus,
  Send,
  MessageSquare,
  Check,
  Trash2,
  Paperclip,
  Tag,
  CornerDownRight,
  Flame,
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { Avatar } from '../common/Avatar';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { Modal } from '../common/Modal';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task: initialTask,
  onTaskUpdated,
  onTaskDeleted,
  projectMembers = [],
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { socket } = useSocket();

  const [task, setTask] = useState(initialTask);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTask(initialTask);
      setDescriptionText(initialTask.description || '');
      fetchComments(initialTask._id);
    }
  }, [initialTask]);

  const fetchComments = async (taskId) => {
    try {
      setLoadingComments(true);
      const res = await taskService.getComments(taskId);
      if (res.success) {
        setComments(res.comments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  if (!isOpen || !task) return null;

  // Handle Field Updates
  const handleUpdateField = async (field, value) => {
    try {
      const updateData = { [field]: value };
      const res = await taskService.updateTask(task._id, updateData);
      if (res.success && res.task) {
        setTask(res.task);
        onTaskUpdated?.(res.task);
        success('Task Updated', `Updated ${field}`);

        // Broadcast to project socket
        socket?.emit('task:update', {
          projectId: task.project?._id || task.project,
          workspaceId: task.workspace,
          task: res.task,
        });
      }
    } catch (err) {
      error('Update Failed', err.response?.data?.message || 'Could not update task');
    }
  };

  // Add Subtask
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    try {
      const res = await taskService.addSubtask(task._id, newSubtaskTitle.trim());
      if (res.success && res.task) {
        setTask(res.task);
        onTaskUpdated?.(res.task);
        setNewSubtaskTitle('');
        socket?.emit('task:update', {
          projectId: task.project?._id || task.project,
          workspaceId: task.workspace,
          task: res.task,
        });
      }
    } catch (err) {
      error('Failed', 'Could not add subtask');
    }
  };

  // Toggle Subtask
  const handleToggleSubtask = async (subtaskId) => {
    try {
      const res = await taskService.toggleSubtask(task._id, subtaskId);
      if (res.success && res.task) {
        setTask(res.task);
        onTaskUpdated?.(res.task);
        socket?.emit('task:update', {
          projectId: task.project?._id || task.project,
          workspaceId: task.workspace,
          task: res.task,
        });
      }
    } catch (err) {
      error('Failed', 'Could not toggle subtask');
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const res = await taskService.createComment({
        taskId: task._id,
        text: newCommentText.trim(),
      });
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setNewCommentText('');
        success('Comment added');
      }
    } catch (err) {
      error('Failed', 'Could not post comment');
    }
  };

  // Add Reply
  const handleAddReply = async (commentId) => {
    const text = replyTextMap[commentId];
    if (!text || !text.trim()) return;
    try {
      const res = await taskService.addReply(commentId, { text: text.trim() });
      if (res.success && res.comment) {
        setComments((prev) => prev.map((c) => (c._id === commentId ? res.comment : c)));
        setReplyTextMap((prev) => ({ ...prev, [commentId]: '' }));
        setActiveReplyId(null);
      }
    } catch (err) {
      error('Failed', 'Could not post reply');
    }
  };

  // Toggle Resolve Comment
  const handleToggleResolve = async (commentId) => {
    try {
      const res = await taskService.toggleResolveComment(commentId);
      if (res.success && res.comment) {
        setComments((prev) => prev.map((c) => (c._id === commentId ? res.comment : c)));
      }
    } catch (err) {}
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return;
    try {
      await taskService.deleteTask(task._id);
      socket?.emit('task:delete', {
        projectId: task.project?._id || task.project,
        workspaceId: task.workspace,
        taskId: task._id,
      });
      onTaskDeleted?.(task._id);
      onClose();
      success('Task Deleted');
    } catch (err) {
      error('Failed', 'Could not delete task');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" showClose={true}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left/Main Column: Title, Description, Subtasks, Comments */}
        <div className="flex-1 space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              onBlur={(e) => handleUpdateField('title', e.target.value)}
              className="text-xl sm:text-2xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-brand-500 focus:outline-none w-full pb-1 transition-colors tracking-tight"
            />
          </div>

          {/* Description */}
          <div>
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </h5>
            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  placeholder="Add a detailed description..."
                  className="w-full bg-surface-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingDescription(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateField('description', descriptionText);
                      setIsEditingDescription(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg"
                  >
                    Save Description
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDescription(true)}
                className="p-3.5 rounded-xl bg-surface-950/60 hover:bg-surface-950 border border-slate-800/80 text-sm text-slate-300 cursor-pointer min-h-[70px] whitespace-pre-wrap transition-colors"
              >
                {task.description || (
                  <span className="text-slate-500 italic">
                    Click to add description...
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Subtask Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-brand-400" />
                Subtasks ({task.subtasks?.filter((s) => s.completed).length || 0}/
                {task.subtasks?.length || 0})
              </h5>
            </div>

            <div className="space-y-2">
              {(task.subtasks || []).map((subtask) => (
                <div
                  key={subtask._id}
                  onClick={() => handleToggleSubtask(subtask._id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-950/40 hover:bg-surface-950/80 border border-slate-800/80 cursor-pointer transition-colors group"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      subtask.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 group-hover:border-brand-400'
                    }`}
                  >
                    {subtask.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-sm ${
                      subtask.completed ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {subtask.title}
                  </span>
                </div>
              ))}

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a subtask item..."
                  className="flex-1 bg-surface-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-4 border-t border-slate-800">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              Activity & Comments ({comments.length})
            </h5>

            {/* New Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment or mention @teammate..."
                className="flex-1 bg-surface-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className={`p-3 rounded-xl border ${
                    comment.resolved
                      ? 'bg-slate-900/30 border-slate-800/40 opacity-70'
                      : 'bg-surface-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={comment.user?.avatar}
                        name={comment.user?.name}
                        size="xs"
                      />
                      <span className="text-xs font-semibold text-white">
                        {comment.user?.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleResolve(comment._id)}
                      className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                        comment.resolved
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'text-slate-400 hover:text-white border-slate-700'
                      }`}
                    >
                      {comment.resolved ? 'Resolved' : 'Resolve'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 mt-2 whitespace-pre-wrap">
                    {comment.text}
                  </p>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2.5 pl-3 border-l border-slate-800 space-y-2">
                      {comment.replies.map((r, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold text-slate-300">
                            {r.user?.name}:{' '}
                          </span>
                          <span className="text-slate-400">{r.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Trigger */}
                  <div className="mt-2 pt-2 border-t border-slate-800/40 flex justify-between items-center text-[11px]">
                    <button
                      onClick={() =>
                        setActiveReplyId(activeReplyId === comment._id ? null : comment._id)
                      }
                      className="text-slate-400 hover:text-brand-300 flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      Reply
                    </button>
                  </div>

                  {activeReplyId === comment._id && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={replyTextMap[comment._id] || ''}
                        onChange={(e) =>
                          setReplyTextMap({
                            ...replyTextMap,
                            [comment._id]: e.target.value,
                          })
                        }
                        placeholder="Write a reply..."
                        className="flex-1 bg-surface-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Meta Attributes */}
        <div className="w-full lg:w-72 space-y-5 bg-surface-950/40 p-4 rounded-2xl border border-slate-800/80">
          {/* Status Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <select
              value={task.status}
              onChange={(e) => handleUpdateField('status', e.target.value)}
              className="w-full bg-surface-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Priority
            </label>
            <select
              value={task.priority}
              onChange={(e) => handleUpdateField('priority', e.target.value)}
              className="w-full bg-surface-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Assignee Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Assignee
            </label>
            <select
              value={task.assignee?._id || task.assignee || ''}
              onChange={(e) => handleUpdateField('assignee', e.target.value || null)}
              className="w-full bg-surface-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Unassigned</option>
              {projectMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.position || 'Member'})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleUpdateField('dueDate', e.target.value || null)}
              className="w-full bg-surface-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Delete Task Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDeleteTask}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
