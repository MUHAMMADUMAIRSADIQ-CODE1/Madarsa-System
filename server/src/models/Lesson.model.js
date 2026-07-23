const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const lessonSchema = createBaseSchema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    lessonType: {
      type: String,
      enum: ['video', 'pdf', 'document', 'external_link', 'text'],
      required: [true, 'Lesson type is required'],
      index: true,
    },
    // Video content
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    // PDF content
    pdfUrl: {
      type: String,
      trim: true,
      default: '',
    },
    // Document content
    documentUrl: {
      type: String,
      trim: true,
      default: '',
    },
    // External link
    externalUrl: {
      type: String,
      trim: true,
      default: '',
    },
    // Text lesson content
    textContent: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      trim: true,
      default: '',
      maxlength: 50,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module reference is required'],
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPreviewFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
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
      { fields: { module: 1, displayOrder: 1 } },
      { fields: { module: 1, isPublished: 1 } },
      { fields: { module: 1, isDeleted: 1 } },
      { fields: { lessonType: 1 } },
    ],
  }
);

lessonSchema.methods.toPublicJSON = function () {
  const base = {
    id: this._id,
    title: this.title,
    shortDescription: this.shortDescription,
    lessonType: this.lessonType,
    duration: this.duration,
    module: this.module,
    displayOrder: this.displayOrder,
    isPreviewFree: this.isPreviewFree,
    isPublished: this.isPublished,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  // Include type-specific content for published/preview lessons
  if (this.isPreviewFree || this.isPublished) {
    switch (this.lessonType) {
      case 'video':
        base.content = { videoUrl: this.videoUrl };
        break;
      case 'pdf':
        base.content = { pdfUrl: this.pdfUrl };
        break;
      case 'document':
        base.content = { documentUrl: this.documentUrl };
        break;
      case 'external_link':
        base.content = { externalUrl: this.externalUrl };
        break;
      case 'text':
        base.content = { textContent: this.textContent };
        break;
    }
  }

  return base;
};

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
