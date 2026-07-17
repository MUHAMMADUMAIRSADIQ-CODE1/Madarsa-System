const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const courseSchema = createBaseSchema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    fullDescription: {
      type: String,
      trim: true,
      maxlength: 10000,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    introVideoUrl: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseCategory',
    },
    categoryName: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'all',
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
    },
    duration: {
      type: String,
      trim: true,
    },
    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    certificateAvailable: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    code: {
      type: String,
      trim: true,
      maxlength: 50,
      index: true,
    },
    batch: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    section: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    academicYear: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    schedule: {
      day: { type: String, trim: true },
      startTime: { type: String, trim: true },
      endTime: { type: String, trim: true },
      room: { type: String, trim: true },
    },
    maxStudents: {
      type: Number,
      default: 50,
      min: 0,
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    materials: [{
      title: { type: String, trim: true, required: true },
      description: { type: String, trim: true },
      fileUrl: { type: String, required: true },
      fileType: { type: String, enum: ['pdf', 'document', 'image', 'video', 'audio', 'other'], default: 'document' },
      fileSize: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
      { fields: { category: 1, status: 1 } },
      { fields: { level: 1, status: 1 } },
      { fields: { featured: 1, status: 1 } },
      { fields: { displayOrder: 1 } },
    ],
  }
);

courseSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    title: this.title,
    slug: this.slug,
    shortDescription: this.shortDescription,
    fullDescription: this.fullDescription,
    thumbnail: this.thumbnail,
    banner: this.banner,
    introVideoUrl: this.introVideoUrl,
    category: this.category,
    categoryName: this.categoryName,
    level: this.level,
    language: this.language,
    duration: this.duration,
    totalLessons: this.totalLessons,
    certificateAvailable: this.certificateAvailable,
    featured: this.featured,
    popular: this.popular,
    trending: this.trending,
    maxStudents: this.maxStudents,
    enrolledCount: this.enrolledCount,
    displayOrder: this.displayOrder,
    publishedAt: this.publishedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
