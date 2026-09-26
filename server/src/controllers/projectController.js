const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

// @desc Get projects by workspace
// @route GET /api/projects?workspaceId=...
exports.getProjects = async (req, res) => {
  try {
    const { workspaceId, status } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId query parameter is required' });
    }

    const filter = { workspace: workspaceId };
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar position status')
      .sort({ updatedAt: -1 });

    // Attach task summary counts to each project
    const enhancedProjects = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id }).select('status');
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress,
        };
      })
    );

    res.json({ success: true, projects: enhancedProjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single project details
// @route GET /api/projects/:projectId
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar position status lastSeen');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const tasks = await Task.find({ project: project._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.json({
      success: true,
      project: {
        ...project.toObject(),
        totalTasks,
        completedTasks,
        progress,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create project
// @route POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, description, workspaceId, status, priority, startDate, dueDate, members, coverImage, color, tags } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ success: false, message: 'Project name and workspace are required' });
    }

    const assignedMembers = Array.isArray(members) && members.length > 0 ? members : [req.user._id];

    const project = await Project.create({
      name,
      description: description || '',
      workspace: workspaceId,
      status: status || 'active',
      priority: priority || 'medium',
      startDate: startDate || new Date(),
      dueDate: dueDate || null,
      members: assignedMembers,
      coverImage: coverImage || '',
      color: color || '#3b82f6',
      tags: tags || [],
      createdBy: req.user._id,
    });

    // Create a dedicated project chat channel
    await Conversation.create({
      workspace: workspaceId,
      project: project._id,
      type: 'project',
      name: `${name.toLowerCase().replace(/\s+/g, '-')}`,
      isChannel: true,
      participants: assignedMembers,
    });

    // Activity log
    await Activity.create({
      workspace: workspaceId,
      project: project._id,
      user: req.user._id,
      action: `created project "${name}"`,
      entityType: 'project',
      entityId: project._id,
    });

    // Notify assigned members
    for (const memberId of assignedMembers) {
      if (memberId.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: memberId,
          sender: req.user._id,
          workspace: workspaceId,
          type: 'project_invitation',
          title: 'Added to Project',
          message: `${req.user.name} added you to project "${project.name}"`,
          link: `/projects/${project._id}`,
        });
      }
    }

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar position status');

    res.status(201).json({
      success: true,
      project: {
        ...populatedProject.toObject(),
        totalTasks: 0,
        completedTasks: 0,
        progress: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update project
// @route PUT /api/projects/:projectId
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status, priority, startDate, dueDate, members, coverImage, color, tags } = req.body;

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate) project.startDate = startDate;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (members) project.members = members;
    if (coverImage !== undefined) project.coverImage = coverImage;
    if (color) project.color = color;
    if (tags) project.tags = tags;

    await project.save();

    await Activity.create({
      workspace: project.workspace,
      project: project._id,
      user: req.user._id,
      action: `updated project "${project.name}" details`,
      entityType: 'project',
      entityId: project._id,
    });

    const updatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar position status');

    res.json({ success: true, project: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete project
// @route DELETE /api/projects/:projectId
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete related tasks and conversations
    await Task.deleteMany({ project: project._id });
    await Conversation.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and associated resources deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
