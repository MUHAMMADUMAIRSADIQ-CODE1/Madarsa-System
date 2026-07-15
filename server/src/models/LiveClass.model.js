const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const liveClassSchema = createBaseSchema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000 },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  scheduledAt: { type: Date, required: true, index: true },
  duration: { type: Number, default: 60 },
  meetingLink: { type: String },
  meetingId: { type: String },
  password: { type: String },
  platform: { type: String, enum: ['zoom', 'google-meet', 'custom'], default: 'custom' },
  recordingUrl: { type: String },
  status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
  attendeeCount: { type: Number, default: 0 },
  notes: { type: String, trim: true },
}, {
  indexes: [
    { fields: { course: 1, scheduledAt: -1 } },
    { fields: { status: 1, scheduledAt: 1 } },
  ],
});

module.exports = mongoose.model('LiveClass', liveClassSchema);
