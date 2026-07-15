const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const assignmentSchema = createBaseSchema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 5000 },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  attachments: [{ name: String, url: String }],
  isPublished: { type: Boolean, default: true },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    submittedAt: { type: Date, default: Date.now },
    fileUrl: { type: String },
    notes: { type: String },
    score: { type: Number },
    feedback: { type: String },
    gradedAt: Date,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
  }],
}, {
  indexes: [{ fields: { course: 1, dueDate: -1 } }, { fields: { teacher: 1 } }],
});

module.exports = mongoose.model('Assignment', assignmentSchema);
