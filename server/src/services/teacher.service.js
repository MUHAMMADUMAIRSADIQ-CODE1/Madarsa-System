const BaseService = require('./BaseService');
const Teacher = require('../models/Teacher.model');
const { slugify } = require('../utils/helpers');
const { ApiError } = require('../utils');
const { httpStatus } = require('../constants');

class TeacherService extends BaseService {
  constructor() {
    super(Teacher, 'Teacher');
    this.searchFields = [
      'fullName', 'qualification', 'specialization', 'subjects',
      'country', 'biography', 'shortBio',
    ];
  }

  async create(data) {
    if (data.fullName && !data.slug) {
      data.slug = slugify(data.fullName);
    }

    const existing = await this.getOne({ slug: data.slug });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    return super.create(data);
  }

  async update(id, data, options = {}) {
    if (data.fullName) {
      const newSlug = slugify(data.fullName);
      const existing = await this.getOne({ slug: newSlug, _id: { $ne: id } });
      data.slug = existing ? `${newSlug}-${Date.now()}` : newSlug;
    }
    return super.update(id, data, options);
  }

  async getPublishedTeachers(query = {}, options = {}) {
    return this.getAll(
      { ...query, status: 'published', isDeleted: false },
      options
    );
  }

  async getBySlug(slug) {
    return this.getOne({ slug, isDeleted: false });
  }

  async getPublishedBySlug(slug) {
    return this.getOne({ slug, status: 'published', isDeleted: false });
  }

  async publishTeacher(id, userId) {
    const teacher = await this.getById(id);
    teacher.status = 'published';
    teacher.publishedAt = new Date();
    teacher.updatedBy = userId;
    return teacher.save();
  }

  async unpublishTeacher(id, userId) {
    const teacher = await this.getById(id);
    teacher.status = 'draft';
    teacher.updatedBy = userId;
    return teacher.save();
  }

  async archiveTeacher(id, userId) {
    const teacher = await this.getById(id);
    teacher.status = 'archived';
    teacher.updatedBy = userId;
    return teacher.save();
  }

  async softDeleteTeacher(id, userId) {
    const teacher = await this.getById(id);
    teacher.isDeleted = true;
    teacher.deletedAt = new Date();
    teacher.updatedBy = userId;
    return teacher.save();
  }

  async restoreTeacher(id, userId) {
    const teacher = await this.model.findOne({ _id: id, isDeleted: true });
    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Deleted teacher not found');
    }
    teacher.isDeleted = false;
    teacher.deletedAt = null;
    teacher.updatedBy = userId;
    return teacher.save();
  }

  async duplicateTeacher(id, userId) {
    const original = await this.getById(id);
    const data = original.toObject();
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.slug;
    delete data.publishedAt;

    data.fullName = `${data.fullName} (Copy)`;
    data.status = 'draft';
    data.isDeleted = false;
    data.deletedAt = null;
    data.createdBy = userId;
    data.updatedBy = userId;

    return this.create(data);
  }

  async assignCourse(teacherId, courseId) {
    const teacher = await this.getById(teacherId);
    if (!teacher.assignedCourses.includes(courseId)) {
      teacher.assignedCourses.push(courseId);
      await teacher.save();
    }
    return teacher;
  }

  async removeCourse(teacherId, courseId) {
    const teacher = await this.getById(teacherId);
    teacher.assignedCourses = teacher.assignedCourses.filter(
      (c) => c.toString() !== courseId
    );
    await teacher.save();
    return teacher;
  }

  async getTeacherStats() {
    const User = require('../models/User.model');
    const { roles, USER_STATUS } = require('../constants');

    const [total, published, draft, archived, featured, online,
      pendingUsers, activeUsers, rejectedUsers, blockedUsers] = await Promise.all([
      this.count({ isDeleted: false }),
      this.count({ status: 'published', isDeleted: false }),
      this.count({ status: 'draft', isDeleted: false }),
      this.count({ status: 'archived', isDeleted: false }),
      this.count({ featured: true, status: 'published', isDeleted: false }),
      this.count({ availableForOnline: true, status: 'published', isDeleted: false }),
      User.countDocuments({ role: roles.TEACHER, status: USER_STATUS.PENDING }),
      User.countDocuments({ role: roles.TEACHER, status: USER_STATUS.ACTIVE }),
      User.countDocuments({ role: roles.TEACHER, status: USER_STATUS.REJECTED }),
      User.countDocuments({ role: roles.TEACHER, status: USER_STATUS.BLOCKED }),
    ]);

    return { total, published, draft, archived, featured, availableForOnline: online,
      pendingUsers, activeUsers, rejectedUsers, blockedUsers };
  }
}

module.exports = new TeacherService();
