const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const courseCategorySchema = createBaseSchema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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
      { fields: { slug: 1 }, unique: true },
      { fields: { displayOrder: 1 } },
    ],
  }
);

const CourseCategory = mongoose.model('CourseCategory', courseCategorySchema);

module.exports = CourseCategory;
