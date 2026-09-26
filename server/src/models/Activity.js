const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
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
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['task', 'project', 'workspace', 'document', 'file', 'comment', 'member', 'event'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

activitySchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
