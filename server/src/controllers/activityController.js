const Activity = require('../models/Activity');

// @desc Get activities for workspace or project
// @route GET /api/activity?workspaceId=...
exports.getActivities = async (req, res) => {
  try {
    const { workspaceId, projectId, limit = 50 } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const filter = { workspace: workspaceId };
    if (projectId) filter.project = projectId;

    const activities = await Activity.find(filter)
      .populate('user', 'name email avatar position')
      .populate('project', 'name color')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
