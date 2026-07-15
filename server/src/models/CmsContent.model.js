const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');
const { CMS_SECTIONS, CMS_STATUS } = require('../constants/cms');

const cmsContentSchema = createBaseSchema(
  {
    section: {
      type: String,
      required: [true, 'CMS section is required'],
      enum: Object.values(CMS_SECTIONS),
      index: true,
    },
    identifier: {
      type: String,
      trim: true,
      default: 'default',
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 10000,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    images: [
      {
        url: { type: String },
        alt: { type: String, trim: true },
        order: { type: Number, default: 0 },
      },
    ],
    buttons: [
      {
        label: { type: String, trim: true },
        url: { type: String, trim: true },
        variant: {
          type: String,
          enum: ['primary', 'secondary', 'outline', 'ghost'],
          default: 'primary',
        },
        isPrimary: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
      },
    ],
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(CMS_STATUS),
      default: CMS_STATUS.DRAFT,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
    version: {
      type: Number,
      default: 1,
    },
    publishedAt: {
      type: Date,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    indexes: [
      { fields: { section: 1, identifier: 1 }, unique: true },
      { fields: { section: 1, status: 1, isActive: 1 } },
      { fields: { section: 1, order: 1 } },
    ],
  }
);

cmsContentSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

cmsContentSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.isActive = true;
  return this.save();
};

cmsContentSchema.methods.publish = function () {
  this.status = CMS_STATUS.PUBLISHED;
  this.publishedAt = new Date();
  return this.save();
};

cmsContentSchema.methods.unpublish = function () {
  this.status = CMS_STATUS.DRAFT;
  return this.save();
};

cmsContentSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    section: this.section,
    identifier: this.identifier,
    title: this.title,
    subtitle: this.subtitle,
    description: this.description,
    content: this.content,
    images: this.images,
    buttons: this.buttons,
    order: this.order,
    status: this.status,
    isActive: this.isActive,
    version: this.version,
    publishedAt: this.publishedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const CmsContent = mongoose.model('CmsContent', cmsContentSchema);

module.exports = CmsContent;
