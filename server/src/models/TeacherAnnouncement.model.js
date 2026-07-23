const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const teacherAnnouncementSchema = createBaseSchema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 300,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: 10000,
  },
  targetType: {
    type: String,
    enum: ['all', 'course', 'batch', 'class'],
    default: 'all',
  },
  targetCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  targetBatch: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  attachments: [{
    name: { type: String, trim: true },
    url: { type: String },
    type: { type: String },
  }],
  resourceLink: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  isPublished: {
    type: Boolean,
    default: true,
    index: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
    index: true,
  },
  publishedAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
  },
}, {
  indexes: [
    { fields: { teacher: 1, createdAt: -1 } },
    { fields: { targetType: 1, targetCourse: 1 } },
    { fields: { isPublished: 1, createdAt: -1 } },
    { fields: { isPinned: 1, publishedAt: -1 } },
  ],
});

module.exports = mongoose.model('TeacherAnnouncement', teacherAnnouncementSchema);
