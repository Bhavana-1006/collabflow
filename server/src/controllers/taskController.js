const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

// @desc Get tasks with filtering
// @route GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const { workspaceId, projectId, assignee, status, priority, myTasks } = req.query;

    const filter = {};
    if (workspaceId) filter.workspace = workspaceId;
    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (myTasks === 'true' || assignee === 'me') {
      filter.assignee = req.user._id;
    } else if (assignee) {
      filter.assignee = assignee;
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar position')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color status')
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get task by ID
// @route GET /api/tasks/:taskId
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'name email avatar position status')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color status members')
      .populate('attachments.uploadedBy', 'name avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create task
// @route POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      workspaceId,
      projectId,
      status,
      priority,
      assignee,
      dueDate,
      labels,
      subtasks,
      attachments,
      estimatedHours,
    } = req.body;

    if (!title || !workspaceId || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Title, workspaceId, and projectId are required',
      });
    }

    // Determine current highest order in that column
    const highestTask = await Task.findOne({
      project: projectId,
      status: status || 'todo',
    }).sort({ order: -1 });
    const order = highestTask ? (highestTask.order || 0) + 1 : 0;

    const task = await Task.create({
      title,
      description: description || '',
      workspace: workspaceId,
      project: projectId,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee || null,
      reporter: req.user._id,
      dueDate: dueDate || null,
      labels: labels || [],
      subtasks: subtasks || [],
      attachments: attachments || [],
      estimatedHours: estimatedHours || 0,
      order,
    });

    const project = await Project.findById(projectId);

    // Create activity
    await Activity.create({
      workspace: workspaceId,
      project: projectId,
      user: req.user._id,
      action: `created task "${title}" in project "${project ? project.name : ''}"`,
      entityType: 'task',
      entityId: task._id,
      details: { title, status: task.status, priority: task.priority },
    });

    // Notify assignee if different from creator
    if (assignee && assignee.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: assignee,
        sender: req.user._id,
        workspace: workspaceId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you the task "${title}"`,
        link: `/projects/${projectId}?task=${task._id}`,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar position')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color status');

    res.status(201).json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update task
// @route PUT /api/tasks/:taskId
exports.updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      labels,
      subtasks,
      attachments,
      estimatedHours,
      loggedHours,
    } = req.body;

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignee ? task.assignee.toString() : null;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (labels) task.labels = labels;
    if (subtasks) task.subtasks = subtasks;
    if (attachments) task.attachments = attachments;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (loggedHours !== undefined) task.loggedHours = loggedHours;

    await task.save();

    // Log activity for status update or completion
    if (status && status !== oldStatus) {
      await Activity.create({
        workspace: task.workspace,
        project: task.project,
        user: req.user._id,
        action: `moved "${task.title}" to ${status.replace('_', ' ').toUpperCase()}`,
        entityType: 'task',
        entityId: task._id,
        details: { from: oldStatus, to: status },
      });

      if (status === 'completed' && task.reporter.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: task.reporter,
          sender: req.user._id,
          workspace: task.workspace,
          type: 'task_completed',
          title: 'Task Completed',
          message: `${req.user.name} completed "${task.title}"`,
          link: `/projects/${task.project}?task=${task._id}`,
        });
      }
    }

    // Check if new assignee was assigned
    if (assignee && assignee.toString() !== oldAssignee && assignee.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: assignee,
        sender: req.user._id,
        workspace: task.workspace,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `${req.user.name} assigned you the task "${task.title}"`,
        link: `/projects/${task.project}?task=${task._id}`,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar position')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color status');

    res.json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Move task (Kanban drag & drop)
// @route PUT /api/tasks/:taskId/move
exports.moveTask = async (req, res) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const prevStatus = task.status;
    task.status = status || task.status;
    task.order = typeof order === 'number' ? order : task.order;

    await task.save();

    if (prevStatus !== task.status) {
      await Activity.create({
        workspace: task.workspace,
        project: task.project,
        user: req.user._id,
        action: `moved "${task.title}" from ${prevStatus} to ${task.status}`,
        entityType: 'task',
        entityId: task._id,
        details: { from: prevStatus, to: task.status },
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar position')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color status');

    res.json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete task
// @route DELETE /api/tasks/:taskId
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Activity.create({
      workspace: task.workspace,
      project: task.project,
      user: req.user._id,
      action: `deleted task "${task.title}"`,
      entityType: 'task',
      entityId: task._id,
    });

    await task.deleteOne();

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add subtask
// @route POST /api/tasks/:taskId/subtasks
exports.addSubtask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Subtask title is required' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.subtasks.push({ title, completed: false });
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar position')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color status');

    res.json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle subtask
// @route PUT /api/tasks/:taskId/subtasks/:subtaskId/toggle
exports.toggleSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : null;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar position')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color status');

    res.json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
