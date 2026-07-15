const { ApiError, logger } = require('../utils');
const { httpStatus, messages } = require('../constants');

class BaseService {
  constructor(model, resourceName = 'Resource') {
    this.model = model;
    this.resourceName = resourceName;
  }

  async getAll(query = {}, options = {}) {
    const { page, limit, skip, sort, populate, select } = {
      page: 1,
      limit: 10,
      sort: { createdAt: -1 },
      populate: '',
      select: '',
      ...options,
    };

    const filter = { ...query };

    if (filter.search && this.searchFields) {
      const searchRegex = new RegExp(filter.search, 'i');
      delete filter.search;

      const searchConditions = this.searchFields.map((field) => ({
        [field]: searchRegex,
      }));

      if (searchConditions.length > 0) {
        filter.$or = searchConditions;
      }
    }

    try {
      const [data, total] = await Promise.all([
        this.model
          .find(filter)
          .select(select)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate(populate)
          .lean(),
        this.model.countDocuments(filter),
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
    } catch (error) {
      logger.error(`Error fetching ${this.resourceName}s:`, error);
      throw error;
    }
  }

  async getById(id, options = {}) {
    const { populate = '', select = '' } = options;

    try {
      const document = await this.model
        .findById(id)
        .select(select)
        .populate(populate);

      if (!document) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `${this.resourceName} not found`
        );
      }

      return document;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(httpStatus.BAD_REQUEST, messages.INVALID_OBJECT_ID);
      }
      throw error;
    }
  }

  async getOne(filter = {}, options = {}) {
    const { populate = '', select = '' } = options;

    try {
      const document = await this.model
        .findOne(filter)
        .select(select)
        .populate(populate);

      return document;
    } catch (error) {
      logger.error(`Error fetching ${this.resourceName}:`, error);
      throw error;
    }
  }

  async create(data) {
    try {
      const document = await this.model.create(data);
      return document;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(
          httpStatus.CONFLICT,
          `${this.resourceName} already exists`
        );
      }
      if (error.name === 'ValidationError') {
        throw new ApiError(
          httpStatus.UNPROCESSABLE_ENTITY,
          error.message
        );
      }
      throw error;
    }
  }

  async update(id, data, options = {}) {
    const { populate = '' } = options;

    try {
      const document = await this.model
        .findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
        })
        .populate(populate);

      if (!document) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `${this.resourceName} not found`
        );
      }

      return document;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(httpStatus.BAD_REQUEST, messages.INVALID_OBJECT_ID);
      }
      if (error.code === 11000) {
        throw new ApiError(
          httpStatus.CONFLICT,
          `${this.resourceName} with this value already exists`
        );
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const document = await this.model.findByIdAndDelete(id);

      if (!document) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `${this.resourceName} not found`
        );
      }

      return document;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(httpStatus.BAD_REQUEST, messages.INVALID_OBJECT_ID);
      }
      throw error;
    }
  }

  async softDelete(id) {
    try {
      const document = await this.model.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!document) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `${this.resourceName} not found`
        );
      }

      return document;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(httpStatus.BAD_REQUEST, messages.INVALID_OBJECT_ID);
      }
      throw error;
    }
  }

  async count(filter = {}) {
    try {
      return this.model.countDocuments(filter);
    } catch (error) {
      logger.error(`Error counting ${this.resourceName}s:`, error);
      throw error;
    }
  }

  async exists(filter = {}) {
    try {
      const count = await this.model.countDocuments(filter);
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existence of ${this.resourceName}:`, error);
      throw error;
    }
  }
}

module.exports = BaseService;
