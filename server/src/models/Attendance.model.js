const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');
const Counter = require('./Counter.model');

const attendanceSchema = createBaseSchema({
  attendanceId: {
    type: String,
    unique: true,
    index: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required'],
    index: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher is required'],
    index: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required'],
    index: true,
  },
  batch: {
    type: String,
    trim: true,
    index: true,
  },
  classDate: {
    type: Date,
    required: [true, 'Class date is required'],
    index: true,
  },
  classTime: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: [true, 'Attendance status is required'],
    index: true,
  },
  onlineSessionId: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    { fields: { classDate: -1, course: 1 } },
    { fields: { student: 1, classDate: -1 } },
    { fields: { teacher: 1, classDate: -1 } },
    { fields: { course: 1, classDate: -1, student: 1 }, unique: true },
    { fields: { status: 1, classDate: -1 } },
    { fields: { attendanceId: 1 } },
  ],
});

attendanceSchema.pre('save', async function (next) {
  if (this.isNew && !this.attendanceId) {
    try {
      const year = new Date().getFullYear();
      const counter = await Counter.findOneAndUpdate(
        { name: `attendance_${year}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.attendanceId = `ATT-${year}-${String(counter.seq).padStart(6, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
