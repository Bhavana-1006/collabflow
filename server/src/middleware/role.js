const Workspace = require('../models/Workspace');

const checkWorkspaceRole = (allowedRoles = ['owner', 'admin', 'member', 'viewer']) => {
  return async (req, res, next) => {
    try {
      const workspaceId =
        req.params.workspaceId ||
        req.body.workspaceId ||
        req.query.workspaceId ||
        req.headers['x-workspace-id'];

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: 'Workspace ID is required for authorization',
        });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: 'Workspace not found',
        });
      }

      // Check if user is owner
      if (workspace.owner.toString() === req.user._id.toString()) {
        req.workspace = workspace;
        req.userRole = 'owner';
        return next();
      }

      const memberRecord = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!memberRecord) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this workspace',
        });
      }

      if (!allowedRoles.includes(memberRecord.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Action requires role in [${allowedRoles.join(', ')}]. Your role is ${memberRecord.role}`,
        });
      }

      req.workspace = workspace;
      req.userRole = memberRecord.role;
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error verifying permissions',
      });
    }
  };
};

module.exports = { checkWorkspaceRole };
