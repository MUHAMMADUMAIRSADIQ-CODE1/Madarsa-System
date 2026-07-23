const BaseService = require('./BaseService');
const Lesson = require('../models/Lesson.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

class LessonService extends BaseService {
  constructor() {
    super(Lesson, 'Lesson');
    this.searchFields = ['title', 'shortDescription'];
  }

  /**
   * Get all lessons for a specific module.
   */
  async getByModule(moduleId, query = {}) {
    const filter = { module: moduleId, isDeleted: false };

    if (query.published === 'true') {
      filter.isPublished = true;
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { shortDescription: { $regex: query.search, $options: 'i' } },
      ];
    }

    const options = {
      sort: { displayOrder: 1, createdAt: 1 },
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 100,
    };

    return this.getAll(filter, options);
  }

  /**
   * Get all published lessons for a module (student view).
   */
  async getPublishedByModule(moduleId) {
    return this.getAll(
      { module: moduleId, isPublished: true, isDeleted: false },
      { sort: { displayOrder: 1 }, limit: 100 }
    );
  }

  /**
   * Create a new lesson with auto-assigned displayOrder.
   */
  async create(data) {
    if (data.displayOrder === undefined || data.displayOrder === null) {
      const lastLesson = await this.model
        .findOne({ module: data.module, isDeleted: false })
        .sort({ displayOrder: -1 })
        .select('displayOrder')
        .lean();

      data.displayOrder = (lastLesson?.displayOrder ?? -1) + 1;
    }

    return super.create(data);
  }

  /**
   * Update a lesson.
   */
  async update(id, data) {
    return super.update(id, data);
  }

  /**
   * Soft delete a lesson.
   */
  async softDelete(id, userId) {
    const lesson = await this.model.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
      { new: true }
    );

    if (!lesson) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    return lesson;
  }

  /**
   * Reorder lessons within a module.
   */
  async reorder(moduleId, lessonIds, userId) {
    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Lesson IDs array is required');
    }

    const operations = lessonIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, module: moduleId },
        update: { $set: { displayOrder: index, updatedBy: userId } },
      },
    }));

    await this.model.bulkWrite(operations);

    return this.getByModule(moduleId);
  }

  /**
   * Publish a lesson.
   */
  async publish(id, userId) {
    const lesson = await this.model.findByIdAndUpdate(
      id,
      { isPublished: true, updatedBy: userId },
      { new: true }
    );

    if (!lesson) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    return lesson;
  }

  /**
   * Unpublish a lesson.
   */
  async unpublish(id, userId) {
    const lesson = await this.model.findByIdAndUpdate(
      id,
      { isPublished: false, updatedBy: userId },
      { new: true }
    );

    if (!lesson) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    return lesson;
  }

  /**
   * Get lesson count for a module.
   */
  async getLessonCount(moduleId) {
    return this.count({ module: moduleId, isDeleted: false });
  }

  /**
   * Get published lesson count for a module.
   */
  async getPublishedCount(moduleId) {
    return this.count({ module: moduleId, isPublished: true, isDeleted: false });
  }
}

module.exports = new LessonService();
