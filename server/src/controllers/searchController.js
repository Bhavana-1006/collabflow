const Project = require('../models/Project');
const Task = require('../models/Task');
const Document = require('../models/Document');
const Message = require('../models/Message');
const FileModel = require('../models/FileModel');
const User = require('../models/User');

// @desc Global search across workspace resources
// @route GET /api/search?workspaceId=...&q=...
exports.globalSearch = async (req, res) => {
  try {
    const { workspaceId, q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        results: { projects: [], tasks: [], documents: [], messages: [], files: [], users: [] },
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [projects, tasks, documents, messages, files, users] = await Promise.all([
      workspaceId
        ? Project.find({ workspace: workspaceId, name: regex }).limit(5).select('name status color')
        : Project.find({ name: regex }).limit(5).select('name status color'),
      workspaceId
        ? Task.find({ workspace: workspaceId, title: regex }).limit(6).populate('project', 'name color').select('title status priority project')
        : Task.find({ title: regex }).limit(6).populate('project', 'name color').select('title status priority project'),
      workspaceId
        ? Document.find({ workspace: workspaceId, title: regex }).limit(5).select('title icon')
        : Document.find({ title: regex }).limit(5).select('title icon'),
      workspaceId
        ? Message.find({ workspace: workspaceId, text: regex, isDeleted: false }).limit(5).populate('sender', 'name avatar').select('text sender conversation createdAt')
        : [],
      workspaceId
        ? FileModel.find({ workspace: workspaceId, name: regex }).limit(5).select('name url fileType size category')
        : [],
      User.find({
        $or: [{ name: regex }, { email: regex }],
      }).limit(5).select('name email avatar position status'),
    ]);

    res.json({
      success: true,
      results: {
        projects,
        tasks,
        documents,
        messages,
        files,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
