const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const studentSchema = createBaseSchema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    studentId: {
      type: String,
      unique: true,
      index: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    enrollmentNumber: {
      type: String,
      trim: true,
      maxlength: 50,
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
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
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
    postalCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    emergencyContact: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    emergencyPhone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    languages: [{
      type: String,
      trim: true,
    }],
    skills: [{
      type: String,
      trim: true,
    }],
    socialLinks: {
      facebook: { type: String, trim: true, maxlength: 500 },
      twitter: { type: String, trim: true, maxlength: 500 },
      linkedin: { type: String, trim: true, maxlength: 500 },
      website: { type: String, trim: true, maxlength: 500 },
    },
    cnicPassport: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    guardianRelation: {
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
    educationalCertificates: [{
      type: String,
      trim: true,
    }],
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
    admissionReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admission',
    },
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'suspended', 'transferred'],
      default: 'active',
      index: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    courses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['active', 'completed', 'dropped', 'pending'],
          default: 'active',
        },
        completedAt: Date,
      },
    ],
    attendanceSummary: {
      totalClasses: { type: Number, default: 0 },
      attended: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },
    notes: {
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
      { fields: { studentId: 1 }, unique: true },
      { fields: { status: 1, isDeleted: 1 } },
      { fields: { email: 1 } },
      { fields: { phone: 1 } },
      { fields: { selectedCourse: 1, status: 1 } },
      { fields: { admissionReference: 1 } },
      { fields: { learningMode: 1, status: 1 } },
    ],
  }
);

studentSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    studentId: this.studentId,
    rollNumber: this.rollNumber,
    enrollmentNumber: this.enrollmentNumber,
    studentName: this.studentName,
    fatherName: this.fatherName,
    guardianRelation: this.guardianRelation,
    gender: this.gender,
    dateOfBirth: this.dateOfBirth,
    email: this.email,
    phone: this.phone,
    whatsapp: this.whatsapp,
    country: this.country,
    city: this.city,
    address: this.address,
    postalCode: this.postalCode,
    nationality: this.nationality,
    emergencyContact: this.emergencyContact,
    emergencyPhone: this.emergencyPhone,
    bio: this.bio,
    languages: this.languages,
    skills: this.skills,
    socialLinks: this.socialLinks,
    selectedCourse: this.selectedCourse,
    learningMode: this.learningMode,
    status: this.status,
    enrollmentDate: this.enrollmentDate,
    attendanceSummary: this.attendanceSummary,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
