const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
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
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['image', 'pdf', 'document', 'spreadsheet', 'archive', 'code', 'other'],
      default: 'other',
    },
    publicId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

fileSchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model('File', fileSchema);
