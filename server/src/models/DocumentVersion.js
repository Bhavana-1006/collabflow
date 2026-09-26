const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    changeSummary: {
      type: String,
      default: 'Document updated',
    },
  },
  { timestamps: true }
);

documentVersionSchema.index({ document: 1, versionNumber: -1 });

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);
