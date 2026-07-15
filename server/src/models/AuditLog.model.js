const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');
const { CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');

const auditLogSchema = createBaseSchema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: Object.values(CMS_AUDIT_ACTIONS),
      index: true,
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      enum: Object.values(CMS_MODULES),
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    resourceType: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    changes: {
      before: { type: mongoose.Schema.Types.Mixed },
      after: { type: mongoose.Schema.Types.Mixed },
      diff: { type: mongoose.Schema.Types.Mixed },
    },
    ip: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    indexes: [
      { fields: { user: 1, createdAt: -1 } },
      { fields: { module: 1, action: 1 } },
      { fields: { resourceId: 1 } },
      { fields: { createdAt: -1 } },
    ],
  }
);

auditLogSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    user: this.user,
    action: this.action,
    module: this.module,
    resourceId: this.resourceId,
    resourceType: this.resourceType,
    description: this.description,
    changes: this.changes,
    ip: this.ip,
    createdAt: this.createdAt,
  };
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
