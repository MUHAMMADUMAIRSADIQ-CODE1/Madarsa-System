const BaseService = require('./BaseService');
const Module = require('../models/Module.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

class ModuleService extends BaseService {
  constructor() {
    super(Module, 'Module');
    this.searchFields = ['title', 'description'];
  }

  /**
   * Get all modules for a specific course.
   * Supports pagination, search, and published-only filtering.
   */
  async getByCourse(courseId, query = {}) {
    const filter = { course: courseId, isDeleted: false };

    if (query.published === 'true') {
      filter.isPublished = true;
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const options = {
      sort: { displayOrder: 1, createdAt: 1 },
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 50,
    };

    return this.getAll(filter, options);
  }

  /**
   * Get all published modules for a course (student/public view).
   */
  async getPublishedByCourse(courseId) {
    return this.getAll(
      { course: courseId, isPublished: true, isDeleted: false },
      { sort: { displayOrder: 1 }, limit: 100 }
    );
  }

  /**
   * Create a new module for a course.
   * Auto-assigns displayOrder to the end of the list.
   */
  async create(data) {
    // Auto-assign displayOrder to the next available position
    if (data.displayOrder === undefined || data.displayOrder === null) {
      const lastModule = await this.model
        .findOne({ course: data.course, isDeleted: false })
        .sort({ displayOrder: -1 })
        .select('displayOrder')
        .lean();

      data.displayOrder = (lastModule?.displayOrder ?? -1) + 1;
    }

    return super.create(data);
  }

  /**
   * Update a module.
   */
  async update(id, data) {
    return super.update(id, data);
  }

  /**
   * Hard delete a module.
   */
  async delete(id) {
    return super.delete(id);
  }

  /**
   * Soft delete a module.
   */
  async softDelete(id, userId) {
    const module = await this.model.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
      { new: true }
    );

    if (!module) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    return module;
  }

  /**
   * Reorder modules for a course.
   * Accepts an array of module IDs in the desired order.
   */
  async reorder(courseId, moduleIds, userId) {
    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Module IDs array is required');
    }

    const operations = moduleIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, course: courseId },
        update: { $set: { displayOrder: index, updatedBy: userId } },
      },
    }));

    await this.model.bulkWrite(operations);

    return this.getByCourse(courseId);
  }

  /**
   * Publish a module.
   */
  async publish(id, userId) {
    const module = await this.model.findByIdAndUpdate(
      id,
      { isPublished: true, updatedBy: userId },
      { new: true }
    );

    if (!module) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    return module;
  }

  /**
   * Unpublish a module.
   */
  async unpublish(id, userId) {
    const module = await this.model.findByIdAndUpdate(
      id,
      { isPublished: false, updatedBy: userId },
      { new: true }
    );

    if (!module) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    return module;
  }

  /**
   * Get module count for a course.
   */
  async getModuleCount(courseId) {
    return this.count({ course: courseId, isDeleted: false });
  }

  /**
   * Get published module count for a course.
   */
  async getPublishedCount(courseId) {
    return this.count({ course: courseId, isPublished: true, isDeleted: false });
  }
}

module.exports = new ModuleService();
