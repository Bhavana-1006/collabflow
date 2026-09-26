const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

// @desc Get comments for a task
// @route GET /api/comments?taskId=...
exports.getComments = async (req, res) => {
  try {
    const { taskId } = req.query;
    if (!taskId) {
      return res.status(400).json({ success: false, message: 'taskId query parameter is required' });
    }

    const comments = await Comment.find({ task: taskId })
      .populate('user', 'name email avatar position')
      .populate('replies.user', 'name email avatar position')
      .sort({ createdAt: 1 });

    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create comment
// @route POST /api/comments
exports.createComment = async (req, res) => {
  try {
    const { taskId, text, mentions, attachments } = req.body;

    if (!taskId || !text) {
      return res.status(400).json({ success: false, message: 'taskId and text are required' });
    }

    const task = await Task.findById(taskId).populate('assignee reporter');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      text,
      mentions: mentions || [],
      attachments: attachments || [],
    });

    // Notify task assignee if not the commenter
    if (task.assignee && task.assignee._id.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: task.assignee._id,
        sender: req.user._id,
        workspace: task.workspace,
        type: 'comment',
        title: 'New Comment on Task',
        message: `${req.user.name} commented on "${task.title}": "${text.slice(0, 50)}..."`,
        link: `/projects/${task.project}?task=${task._id}`,
      });
    }

    // Notify mentioned users
    if (Array.isArray(mentions)) {
      for (const mentionUserId of mentions) {
        if (mentionUserId.toString() !== req.user._id.toString()) {
          await Notification.create({
            recipient: mentionUserId,
            sender: req.user._id,
            workspace: task.workspace,
            type: 'mention',
            title: 'You were mentioned',
            message: `${req.user.name} mentioned you in a comment on "${task.title}"`,
            link: `/projects/${task.project}?task=${task._id}`,
          });
        }
      }
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email avatar position')
      .populate('replies.user', 'name email avatar position');

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add reply to comment
// @route POST /api/comments/:commentId/reply
exports.addReply = async (req, res) => {
  try {
    const { text, mentions } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    comment.replies.push({
      user: req.user._id,
      text,
      mentions: mentions || [],
    });

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email avatar position')
      .populate('replies.user', 'name email avatar position');

    res.json({ success: true, comment: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle resolve comment
// @route PUT /api/comments/:commentId/resolve
exports.toggleResolve = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    comment.resolved = !comment.resolved;
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email avatar position')
      .populate('replies.user', 'name email avatar position');

    res.json({ success: true, comment: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete comment
// @route DELETE /api/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
