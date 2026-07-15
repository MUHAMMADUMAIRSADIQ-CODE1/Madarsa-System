const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const newsSchema = createBaseSchema(
  {
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
      minlength: 5,
      maxlength: 300,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'News content is required'],
      maxlength: 50000,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    coverImage: {
      type: String,
      default: '',
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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    meta: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    indexes: [
      { fields: { slug: 1 }, unique: true },
      { fields: { isPublished: 1, isFeatured: 1, publishedAt: -1 } },
      { fields: { category: 1, isPublished: 1 } },
      { fields: { tags: 1 } },
    ],
  }
);

newsSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    title: this.title,
    slug: this.slug,
    content: this.content,
    excerpt: this.excerpt,
    coverImage: this.coverImage,
    category: this.category,
    tags: this.tags,
    author: this.author,
    isPublished: this.isPublished,
    isFeatured: this.isFeatured,
    publishedAt: this.publishedAt,
    viewCount: this.viewCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const News = mongoose.model('News', newsSchema);

module.exports = News;
