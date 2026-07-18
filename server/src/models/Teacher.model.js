const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const teacherSchema = createBaseSchema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    biography: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    shortBio: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    qualification: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    degree: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
      max: 70,
    },
    specialization: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    subjects: [{
      type: String,
      trim: true,
    }],
    teachingLanguages: [{
      type: String,
      trim: true,
    }],
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
    timezone: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    whatsapp: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: {
      type: Date,
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    facebook: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    instagram: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    youtube: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    bloodGroup: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    religion: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    cnicPassport: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    cnicFront: {
      type: String,
      default: '',
    },
    cnicBack: {
      type: String,
      default: '',
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
    teachingMode: {
      type: String,
      enum: ['online', 'physical', 'both', ''],
      default: '',
    },
    availability: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    certificates: [{
      title: { type: String, trim: true },
      issuer: { type: String, trim: true },
      year: { type: Number },
      url: { type: String, trim: true },
    }],
    skills: [{
      type: String,
      trim: true,
    }],
    awards: [{
      title: { type: String, trim: true },
      year: { type: Number },
      description: { type: String, trim: true },
    }],
    featured: {
      type: Boolean,
      default: false,
    },
    availableForOnline: {
      type: Boolean,
      default: false,
    },
    assignedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    canTeachCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    assignedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    seoKeywords: [{
      type: String,
      trim: true,
    }],
    resume: {
      type: String,
      default: '',
    },
    additionalDocuments: [{
      type: String,
      trim: true,
    }],
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
    publishedAt: {
      type: Date,
    },
  },
  {
    indexes: [
      { fields: { slug: 1 }, unique: true },
      { fields: { status: 1, isDeleted: 1 } },
      { fields: { featured: 1, status: 1 } },
      { fields: { country: 1, status: 1 } },
      { fields: { specialization: 1, status: 1 } },
      { fields: { displayOrder: 1 } },
    ],
  }
);

teacherSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    slug: this.slug,
    profilePhoto: this.profilePhoto,
    coverPhoto: this.coverPhoto,
    biography: this.biography,
    shortBio: this.shortBio,
    qualification: this.qualification,
    degree: this.degree,
    experience: this.experience,
    specialization: this.specialization,
    subjects: this.subjects,
    teachingLanguages: this.teachingLanguages,
    country: this.country,
    city: this.city,
    timezone: this.timezone,
    gender: this.gender,
    nationality: this.nationality,
    linkedin: this.linkedin,
    facebook: this.facebook,
    instagram: this.instagram,
    youtube: this.youtube,
    website: this.website,
    certificates: this.certificates,
    skills: this.skills,
    awards: this.awards,
    address: this.address,
    postalCode: this.postalCode,
    bloodGroup: this.bloodGroup,
    religion: this.religion,
    cnicPassport: this.cnicPassport,
    cnicFront: this.cnicFront,
    cnicBack: this.cnicBack,
    emergencyContact: this.emergencyContact,
    emergencyPhone: this.emergencyPhone,
    teachingMode: this.teachingMode,
    availability: this.availability,
    featured: this.featured,
    availableForOnline: this.availableForOnline,
    displayOrder: this.displayOrder,
    publishedAt: this.publishedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
