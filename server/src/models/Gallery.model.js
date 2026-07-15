const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const gallerySchema = createBaseSchema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    meta: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    indexes: [
      { fields: { category: 1, isPublished: 1 } },
      { fields: { order: 1 } },
    ],
  }
);

gallerySchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    imageUrl: this.imageUrl,
    category: this.category,
    tags: this.tags,
    isPublished: this.isPublished,
    order: this.order,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
