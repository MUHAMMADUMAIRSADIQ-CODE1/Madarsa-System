const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const certificateSchema = createBaseSchema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issueDate: { type: Date, required: true, default: Date.now },
  certificateNumber: { type: String, unique: true, required: true },
  grade: { type: String, trim: true },
  totalMarks: { type: Number },
  obtainedMarks: { type: Number },
  description: { type: String, trim: true },
  fileUrl: { type: String },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  verificationHash: { type: String, unique: true, sparse: true },
}, {
  indexes: [
    { fields: { student: 1, course: 1 } },
    { fields: { certificateNumber: 1 }, unique: true },
  ],
});

module.exports = mongoose.model('Certificate', certificateSchema);
