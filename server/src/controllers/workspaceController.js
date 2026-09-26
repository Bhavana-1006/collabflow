const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

// @desc Get all workspaces for user
// @route GET /api/workspaces
exports.getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id,
    })
      .populate('owner', 'name email avatar position')
      .populate('members.user', 'name email avatar position status lastSeen')
      .sort({ updatedAt: -1 });

    res.json({ success: true, workspaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get workspace by ID
// @route GET /api/workspaces/:workspaceId
exports.getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('owner', 'name email avatar position status lastSeen')
      .populate('members.user', 'name email avatar position status lastSeen');

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create workspace
// @route POST /api/workspaces
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Workspace name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);

    const workspace = await Workspace.create({
      name,
      slug,
      description: description || '',
      icon: icon || '💼',
      color: color || '#6366f1',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    // Create a default general workspace chat conversation
    await Conversation.create({
      workspace: workspace._id,
      type: 'workspace',
      name: 'general',
      isChannel: true,
      participants: [req.user._id],
    });

    // Log activity
    await Activity.create({
      workspace: workspace._id,
      user: req.user._id,
      action: 'created the workspace',
      entityType: 'workspace',
      entityId: workspace._id,
    });

    // Update user active workspace if needed
    await User.findByIdAndUpdate(req.user._id, { activeWorkspace: workspace._id });

    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar position')
      .populate('members.user', 'name email avatar position status');

    res.status(201).json({ success: true, workspace: populatedWorkspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update workspace
// @route PUT /api/workspaces/:workspaceId
exports.updateWorkspace = async (req, res) => {
  try {
    const { name, description, icon, color, settings } = req.body;

    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (icon) workspace.icon = icon;
    if (color) workspace.color = color;
    if (settings) workspace.settings = { ...workspace.settings, ...settings };

    await workspace.save();

    await Activity.create({
      workspace: workspace._id,
      user: req.user._id,
      action: 'updated workspace settings',
      entityType: 'workspace',
      entityId: workspace._id,
    });

    const updatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar position')
      .populate('members.user', 'name email avatar position status');

    res.json({ success: true, workspace: updatedWorkspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete workspace
// @route DELETE /api/workspaces/:workspaceId
exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only workspace owner can delete workspace' });
    }

    await workspace.deleteOne();

    res.json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Invite/Add member to workspace
// @route POST /api/workspaces/:workspaceId/members
exports.inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    let targetUser = await User.findOne({ email: email.toLowerCase() });

    // If user doesn't exist yet, auto-provision user so invite works immediately
    if (!targetUser) {
      const generatedName = email.split('@')[0];
      targetUser = await User.create({
        name: generatedName.charAt(0).toUpperCase() + generatedName.slice(1),
        email: email.toLowerCase(),
        password: 'Password123!',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(generatedName)}`,
        position: 'Team Member',
      });
    }

    const isAlreadyMember = workspace.members.some(
      (m) => m.user.toString() === targetUser._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this workspace' });
    }

    workspace.members.push({
      user: targetUser._id,
      role: role || 'member',
      joinedAt: new Date(),
    });

    await workspace.save();

    // Add to default general workspace channel
    await Conversation.updateMany(
      { workspace: workspace._id, isChannel: true },
      { $addToSet: { participants: targetUser._id } }
    );

    // Activity log
    await Activity.create({
      workspace: workspace._id,
      user: req.user._id,
      action: `added ${targetUser.name} to the workspace`,
      entityType: 'member',
      entityId: targetUser._id,
    });

    // Notify user
    await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      workspace: workspace._id,
      type: 'workspace_invitation',
      title: 'Workspace Invitation',
      message: `${req.user.name} added you to workspace "${workspace.name}"`,
      link: `/workspace/${workspace._id}`,
    });

    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar position')
      .populate('members.user', 'name email avatar position status lastSeen');

    res.json({
      success: true,
      message: 'Member added successfully',
      workspace: populatedWorkspace,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Remove member from workspace
// @route DELETE /api/workspaces/:workspaceId/members/:userId
exports.removeMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (workspace.owner.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove workspace owner' });
    }

    workspace.members = workspace.members.filter((m) => m.user.toString() !== userId);
    await workspace.save();

    const targetUser = await User.findById(userId);

    await Activity.create({
      workspace: workspace._id,
      user: req.user._id,
      action: `removed ${targetUser ? targetUser.name : 'a member'} from the workspace`,
      entityType: 'member',
      entityId: userId,
    });

    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar position')
      .populate('members.user', 'name email avatar position status lastSeen');

    res.json({ success: true, workspace: populatedWorkspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update member role
// @route PUT /api/workspaces/:workspaceId/members/:userId/role
exports.updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const member = workspace.members.find((m) => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in workspace' });
    }

    member.role = role;
    await workspace.save();

    const updatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar position')
      .populate('members.user', 'name email avatar position status lastSeen');

    res.json({ success: true, workspace: updatedWorkspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
