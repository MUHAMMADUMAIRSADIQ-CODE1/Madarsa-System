const BaseService = require('./BaseService');
const Course = require('../models/Course.model');
const CourseCategory = require('../models/CourseCategory.model');
const { slugify } = require('../utils/helpers');
const { ApiError } = require('../utils');
const { httpStatus } = require('../constants');

class CourseService extends BaseService {
  constructor() {
    super(Course, 'Course');
    this.searchFields = ['title', 'shortDescription', 'fullDescription', 'categoryName', 'language'];
  }

  async create(data) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }

    const existing = await this.getOne({ slug: data.slug });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    return super.create(data);
  }

  async update(id, data, options = {}) {
    if (data.title) {
      const newSlug = slugify(data.title);
      const existing = await this.getOne({ slug: newSlug, _id: { $ne: id } });
      data.slug = existing ? `${newSlug}-${Date.now()}` : newSlug;
    }
    return super.update(id, data, options);
  }

  async getPublishedCourses(query = {}, options = {}) {
    return this.getAll(
      { ...query, status: 'published', isDeleted: false },
      options
    );
  }

  async getBySlug(slug) {
    const course = await this.getOne({ slug, isDeleted: false });
    return course;
  }

  async getPublishedBySlug(slug) {
    const course = await this.getOne({ slug, status: 'published', isDeleted: false });
    return course;
  }

  async publishCourse(id, userId) {
    const course = await this.getById(id);
    course.status = 'published';
    course.publishedAt = new Date();
    course.updatedBy = userId;
    return course.save();
  }

  async unpublishCourse(id, userId) {
    const course = await this.getById(id);
    course.status = 'draft';
    course.updatedBy = userId;
    return course.save();
  }

  async archiveCourse(id, userId) {
    const course = await this.getById(id);
    course.status = 'archived';
    course.updatedBy = userId;
    return course.save();
  }

  async softDeleteCourse(id, userId) {
    const course = await this.getById(id);
    course.isDeleted = true;
    course.deletedAt = new Date();
    course.updatedBy = userId;
    return course.save();
  }

  async restoreCourse(id, userId) {
    const course = await this.model.findOne({ _id: id, isDeleted: true });
    if (!course) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Deleted course not found');
    }
    course.isDeleted = false;
    course.deletedAt = null;
    course.updatedBy = userId;
    return course.save();
  }

  async duplicateCourse(id, userId) {
    const original = await this.getById(id);
    const data = original.toObject();
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.slug;
    delete data.publishedAt;

    data.title = `${data.title} (Copy)`;
    data.status = 'draft';
    data.isDeleted = false;
    data.deletedAt = null;
    data.createdBy = userId;
    data.updatedBy = userId;

    return this.create(data);
  }

  async getAllCategories() {
    return CourseCategory.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
  }

  async createCategory(data, userId) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }
    data.createdBy = userId;
    data.updatedBy = userId;
    return CourseCategory.create(data);
  }

  async updateCategory(id, data, userId) {
    data.updatedBy = userId;
    return CourseCategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteCategory(id) {
    return CourseCategory.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async getCourseStats() {
    const [total, published, draft, archived, featured, categoryDist] = await Promise.all([
      this.count({ isDeleted: false }),
      this.count({ status: 'published', isDeleted: false }),
      this.count({ status: 'draft', isDeleted: false }),
      this.count({ status: 'archived', isDeleted: false }),
      this.count({ featured: true, status: 'published', isDeleted: false }),
      Course.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$categoryName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return { total, published, draft, archived, featured, categoryDistribution: categoryDist };
  }
}

module.exports = new CourseService();
