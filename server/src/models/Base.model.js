const mongoose = require('mongoose');

const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    },
  },
};

const baseSchema = new mongoose.Schema({}, baseSchemaOptions);

function createBaseSchema(fields = {}, options = {}) {
  return new mongoose.Schema(
    { ...fields },
    { ...baseSchemaOptions, ...options }
  );
}

const paginate = function (query = {}, options = {}) {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };
  const populate = options.populate || [];
  const select = options.select || '';

  return this.find(query)
    .select(select)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate(populate)
    .exec();
};

const paginateWithCount = async function (query = {}, options = {}) {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };
  const populate = options.populate || [];
  const select = options.select || '';

  const [data, total] = await Promise.all([
    this.find(query)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate)
      .exec(),
    this.countDocuments(query).exec(),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  baseSchemaOptions,
  baseSchema,
  createBaseSchema,
  paginate,
  paginateWithCount,
};
