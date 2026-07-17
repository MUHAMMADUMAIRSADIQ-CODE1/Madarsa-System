const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const messageSchema = createBaseSchema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherConversation',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  senderRole: {
    type: String,
    enum: ['teacher', 'student', 'admin'],
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: 5000,
  },
  attachments: [{
    name: { type: String, trim: true },
    url: { type: String },
    type: { type: String },
  }],
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  indexes: [
    { fields: { conversation: 1, createdAt: -1 } },
    { fields: { conversation: 1, isRead: 1 } },
  ],
});

const conversationSchema = createBaseSchema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['teacher', 'student', 'admin'],
      required: true,
    },
    lastReadAt: { type: Date },
  }],
  subject: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  lastMessage: {
    content: { type: String, trim: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date },
  },
  participantCount: {
    type: Number,
    default: 2,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  indexes: [
    { fields: { 'participants.user': 1 } },
    { fields: { 'participants.user': 1, lastMessage: -1 } },
  ],
  timestamps: true,
});

const TeacherConversation = mongoose.model('TeacherConversation', conversationSchema);
const TeacherMessage = mongoose.model('TeacherMessage', messageSchema);

module.exports = { TeacherConversation, TeacherMessage };
