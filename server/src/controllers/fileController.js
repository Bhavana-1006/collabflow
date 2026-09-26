const FileModel = require('../models/FileModel');
const Activity = require('../models/Activity');
const { uploadToStorage } = require('../middleware/upload');
const path = require('path');

const categorizeFile = (mimetype, filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (mimetype.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
    return 'image';
  }
  if (mimetype === 'application/pdf' || ext === '.pdf') {
    return 'pdf';
  }
  if (['.doc', '.docx', '.txt', '.md', '.rtf'].includes(ext)) {
    return 'document';
  }
  if (['.xls', '.xlsx', '.csv'].includes(ext)) {
    return 'spreadsheet';
  }
  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) {
    return 'archive';
  }
  if (['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.py'].includes(ext)) {
    return 'code';
  }
  return 'other';
};

// @desc Upload file
// @route POST /api/files/upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload' });
    }

    const { workspaceId, projectId, taskId, documentId } = req.body;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const uploadResult = await uploadToStorage(req.file);
    const category = categorizeFile(req.file.mimetype, req.file.originalname);

    const fileDoc = await FileModel.create({
      workspace: workspaceId,
      project: projectId || null,
      task: taskId || null,
      document: documentId || null,
      uploadedBy: req.user._id,
      name: req.file.originalname,
      url: uploadResult.url,
      size: uploadResult.size,
      fileType: req.file.mimetype || 'application/octet-stream',
      category,
      publicId: uploadResult.publicId,
    });

    await Activity.create({
      workspace: workspaceId,
      project: projectId || null,
      user: req.user._id,
      action: `uploaded file "${req.file.originalname}"`,
      entityType: 'file',
      entityId: fileDoc._id,
    });

    const populatedFile = await FileModel.findById(fileDoc._id)
      .populate('uploadedBy', 'name email avatar');

    res.status(201).json({ success: true, file: populatedFile });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'File upload failed' });
  }
};

// @desc Get files
// @route GET /api/files?workspaceId=...
exports.getFiles = async (req, res) => {
  try {
    const { workspaceId, projectId, category } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const filter = { workspace: workspaceId };
    if (projectId) filter.project = projectId;
    if (category && category !== 'all') filter.category = category;

    const files = await FileModel.find(filter)
      .populate('uploadedBy', 'name email avatar position')
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete file
// @route DELETE /api/files/:fileId
exports.deleteFile = async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    await file.deleteOne();
    res.json({ success: true, message: 'File removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
