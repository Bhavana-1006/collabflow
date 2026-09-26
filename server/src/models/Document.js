const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a document title'],
      trim: true,
      default: 'Untitled Document',
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    content: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '📄',
    },
    coverImage: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    activeCollaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  { timestamps: true }
);

documentSchema.index({ workspace: 1, updatedAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
