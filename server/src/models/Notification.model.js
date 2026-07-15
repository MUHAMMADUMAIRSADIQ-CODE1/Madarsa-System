const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const notificationSchema = createBaseSchema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'assignment', 'attendance', 'course', 'admission', 'system'], default: 'info' },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  link: { type: String },
  isRead: { type: Boolean, default: false, index: true },
  readAt: { type: Date },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
}, {
  indexes: [
    { fields: { recipient: 1, isRead: 1, createdAt: -1 } },
    { fields: { recipient: 1, createdAt: -1 } },
  ],
});

module.exports = mongoose.model('Notification', notificationSchema);
