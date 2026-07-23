const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const resultSchema = createBaseSchema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required'],
    index: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required'],
    index: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
    index: true,
  },
  examName: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true,
    maxlength: 200,
  },
  examDate: {
    type: Date,
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: 0,
  },
  obtainedMarks: {
    type: Number,
    default: 0,
    min: 0,
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  grade: {
    type: String,
    trim: true,
    maxlength: 10,
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
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
    { fields: { student: 1, course: 1, examName: 1 }, unique: true },
    { fields: { course: 1, status: 1 } },
    { fields: { teacher: 1, course: 1 } },
  ],
});

resultSchema.pre('save', function (next) {
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.obtainedMarks / this.totalMarks) * 100);
  }
  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 80) this.grade = 'A';
  else if (this.percentage >= 70) this.grade = 'B+';
  else if (this.percentage >= 60) this.grade = 'B';
  else if (this.percentage >= 50) this.grade = 'C';
  else if (this.percentage >= 40) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Result', resultSchema);
