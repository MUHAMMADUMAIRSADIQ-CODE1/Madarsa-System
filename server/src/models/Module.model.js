const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const moduleSchema = createBaseSchema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
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
      { fields: { course: 1, displayOrder: 1 } },
      { fields: { course: 1, isPublished: 1 } },
      { fields: { course: 1, isDeleted: 1 } },
    ],
  }
);

moduleSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    course: this.course,
    displayOrder: this.displayOrder,
    isPublished: this.isPublished,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
