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

    // Prevent deletion if teacher has assigned students
    if (teacher.assignedStudents && teacher.assignedStudents.length > 0) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'This teacher has assigned students. Please reassign them before deleting.'
      );
    }

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
    
    // Validate that the course is in the teacher's preferred courses
    const canTeach = (teacher.canTeachCourses || []).map(c => c.toString());
    const courseStr = courseId.toString();
    if (!canTeach.includes(courseStr)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cannot assign this course. Teacher has not selected it as a course they can teach.'
      );
    }
    
    // Also verify the course exists and is not deleted
    const Course = require('../models/Course.model');
    const course = await Course.findById(courseId).select('_id isDeleted').lean();
    if (!course || course.isDeleted) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Course not found or has been deleted');
    }
    
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

  async bulkAssignCourses(teacherId, courseIds, userId) {
    const Course = require('../models/Course.model');
    const teacher = await this.getById(teacherId);
    
    // Validate all course IDs exist and are not deleted
    const validCourses = await Course.find({
      _id: { $in: courseIds },
      isDeleted: false,
    }).select('_id title').lean();
    
    const validIds = new Set(validCourses.map(c => c._id.toString()));
    const invalidIds = courseIds.filter(id => !validIds.has(id.toString()));
    if (invalidIds.length > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid or deleted courses: ${invalidIds.join(', ')}`
      );
    }
    
    // Validate that all courses are in teacher's canTeachCourses
    const canTeach = (teacher.canTeachCourses || []).map(c => c.toString());
    const notAllowed = courseIds.filter(id => !canTeach.includes(id.toString()));
    if (notAllowed.length > 0) {
      const notAllowedNames = notAllowed.map(id => {
        const c = validCourses.find(v => v._id.toString() === id);
        return c ? c.title : id;
      });
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot assign the following courses - teacher has not selected them as courses they can teach: ${notAllowedNames.join(', ')}`
      );
    }
    
    // Replace assignedCourses with the new list
    teacher.assignedCourses = courseIds;
    teacher.updatedBy = userId;
    await teacher.save();
    
    const populated = await Teacher.findById(teacher._id)
      .populate('assignedCourses', 'title slug thumbnail shortDescription level duration categoryName status')
      .populate('canTeachCourses', 'title slug thumbnail shortDescription')
      .lean();
    
    return populated;
  }

  async getTeacherAssignedCourses(teacherId) {
    const teacher = await Teacher.findById(teacherId)
      .select('assignedCourses canTeachCourses')
      .populate('assignedCourses', 'title slug thumbnail shortDescription level duration categoryName status')
      .lean();
    
    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Teacher not found');
    }
    
    return teacher;
  }

  async getAssignableCourses(teacherId) {
    const teacher = await Teacher.findById(teacherId)
      .select('canTeachCourses')
      .populate('canTeachCourses', 'title slug thumbnail shortDescription level duration categoryName status')
      .lean();
    
    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Teacher not found');
    }
    
    return teacher.canTeachCourses || [];
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
