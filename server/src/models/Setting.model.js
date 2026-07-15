const mongoose = require('mongoose');
const { createBaseSchema } = require('./Base.model');

const settingSchema = createBaseSchema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Setting value is required'],
    },
    group: {
      type: String,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'array'],
      default: 'string',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    indexes: [
      { fields: { key: 1 }, unique: true },
      { fields: { group: 1, isPublic: 1 } },
    ],
  }
);

settingSchema.statics.get = async function (key, defaultValue = null) {
  const setting = await this.findOne({ key }).exec();
  return setting ? setting.value : defaultValue;
};

settingSchema.statics.set = async function (key, value, options = {}) {
  return this.findOneAndUpdate(
    { key },
    {
      $set: {
        value,
        ...(options.group && { group: options.group }),
        ...(options.description && { description: options.description }),
        ...(options.type && { type: options.type }),
        ...(options.isPublic !== undefined && { isPublic: options.isPublic }),
        ...(options.updatedBy && { updatedBy: options.updatedBy }),
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).exec();
};

settingSchema.statics.getGroup = async function (group) {
  return this.find({ group }).exec();
};

settingSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    key: this.key,
    value: this.value,
    group: this.group,
    description: this.description,
    type: this.type,
    updatedAt: this.updatedAt,
  };
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
