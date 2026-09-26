const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// @desc Get documents
// @route GET /api/documents?workspaceId=...
exports.getDocs = async (req, res) => {
  try {
    const { workspaceId, projectId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const filter = { workspace: workspaceId, isArchived: false };
    if (projectId) filter.project = projectId;

    const documents = await Document.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('lastModifiedBy', 'name email avatar')
      .populate('project', 'name color')
      .sort({ updatedAt: -1 });

    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get document by ID
// @route GET /api/documents/:documentId
exports.getDocById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId)
      .populate('createdBy', 'name email avatar position')
      .populate('lastModifiedBy', 'name email avatar position')
      .populate('activeCollaborators', 'name email avatar position status')
      .populate('project', 'name color');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create document
// @route POST /api/documents
exports.createDoc = async (req, res) => {
  try {
    const { workspaceId, projectId, title, content, icon, tags } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const defaultContent = content || '# ' + (title || 'Untitled Document') + '\n\nStart typing your ideas collaboratively in real-time...';

    const document = await Document.create({
      workspace: workspaceId,
      project: projectId || null,
      title: title || 'Untitled Document',
      content: defaultContent,
      icon: icon || '📝',
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      tags: tags || [],
    });

    // Create initial version
    await DocumentVersion.create({
      document: document._id,
      content: defaultContent,
      title: document.title,
      createdBy: req.user._id,
      versionNumber: 1,
      changeSummary: 'Document created',
    });

    // Activity log
    await Activity.create({
      workspace: workspaceId,
      project: projectId || null,
      user: req.user._id,
      action: `created document "${document.title}"`,
      entityType: 'document',
      entityId: document._id,
    });

    const populatedDoc = await Document.findById(document._id)
      .populate('createdBy', 'name email avatar')
      .populate('lastModifiedBy', 'name email avatar');

    res.status(201).json({ success: true, document: populatedDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update document
// @route PUT /api/documents/:documentId
exports.updateDoc = async (req, res) => {
  try {
    const { title, content, icon, tags, changeSummary } = req.body;

    const doc = await Document.findById(req.params.documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const hasContentChange = content !== undefined && content !== doc.content;

    if (title) doc.title = title;
    if (content !== undefined) doc.content = content;
    if (icon) doc.icon = icon;
    if (tags) doc.tags = tags;
    doc.lastModifiedBy = req.user._id;

    await doc.save();

    // Create a new version if content changed significantly
    if (hasContentChange) {
      const versionCount = await DocumentVersion.countDocuments({ document: doc._id });
      await DocumentVersion.create({
        document: doc._id,
        content: doc.content,
        title: doc.title,
        createdBy: req.user._id,
        versionNumber: versionCount + 1,
        changeSummary: changeSummary || 'Edited collaboratively',
      });
    }

    const populatedDoc = await Document.findById(doc._id)
      .populate('createdBy', 'name email avatar')
      .populate('lastModifiedBy', 'name email avatar')
      .populate('activeCollaborators', 'name email avatar status');

    res.json({ success: true, document: populatedDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete document
// @route DELETE /api/documents/:documentId
exports.deleteDoc = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await DocumentVersion.deleteMany({ document: doc._id });
    await doc.deleteOne();

    res.json({ success: true, message: 'Document and version history deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get document version history
// @route GET /api/documents/:documentId/versions
exports.getVersions = async (req, res) => {
  try {
    const versions = await DocumentVersion.find({ document: req.params.documentId })
      .populate('createdBy', 'name email avatar')
      .sort({ versionNumber: -1 });

    res.json({ success: true, versions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Restore previous version
// @route POST /api/documents/:documentId/restore/:versionId
exports.restoreVersion = async (req, res) => {
  try {
    const { documentId, versionId } = req.params;

    const version = await DocumentVersion.findById(versionId);
    if (!version) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.content = version.content;
    doc.title = version.title;
    doc.lastModifiedBy = req.user._id;
    await doc.save();

    // Create a new version noting the rollback
    const versionCount = await DocumentVersion.countDocuments({ document: doc._id });
    await DocumentVersion.create({
      document: doc._id,
      content: doc.content,
      title: doc.title,
      createdBy: req.user._id,
      versionNumber: versionCount + 1,
      changeSummary: `Restored to Version ${version.versionNumber}`,
    });

    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
