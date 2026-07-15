const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const documentSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  url: { type: String },
  type: { type: String },
}, { _id: false });

const admissionSchema = createBaseSchema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    fatherName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    guardianName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: 30,
    },
    whatsapp: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    cnicPassport: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    guardianPhone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    guardianEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    previousEducation: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    currentQualification: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    selectedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    preferredBatch: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    preferredTiming: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    learningMode: {
      type: String,
      enum: ['online', 'physical', 'both'],
      default: 'online',
    },
    studentPhoto: {
      type: String,
      default: '',
    },
    cnicFront: {
      type: String,
      default: '',
    },
    cnicBack: {
      type: String,
      default: '',
    },
    passport: {
      type: String,
      default: '',
    },
    educationalCertificates: [documentSchema],
    additionalDocuments: [documentSchema],
    reasonForJoining: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    previousQuranEducation: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'under-review', 'approved', 'rejected', 'waitlisted'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    adminRemarks: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    studentNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    convertedToStudent: {
      type: Boolean,
      default: false,
      index: true,
    },
    studentReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    indexes: [
      { fields: { applicationNumber: 1 }, unique: true },
      { fields: { status: 1, isDeleted: 1 } },
      { fields: { email: 1 } },
      { fields: { phone: 1 } },
      { fields: { learningMode: 1, status: 1 } },
      { fields: { selectedCourse: 1, status: 1 } },
      { fields: { convertedToStudent: 1, status: 1 } },
    ],
  }
);

admissionSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    applicationNumber: this.applicationNumber,
    studentName: this.studentName,
    gender: this.gender,
    email: this.email,
    phone: this.phone,
    country: this.country,
    city: this.city,
    selectedCourse: this.selectedCourse,
    learningMode: this.learningMode,
    status: this.status,
    convertedToStudent: this.convertedToStudent,
    reviewedAt: this.reviewedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Admission = mongoose.model('Admission', admissionSchema);

module.exports = Admission;
