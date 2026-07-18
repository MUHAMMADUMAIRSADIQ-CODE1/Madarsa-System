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
    const [total, published, draft, archived, featured, categoryDist,
      coursesWithTeacherStats] = await Promise.all([
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
      // Teacher & Student counts per course
      Course.aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: 'teachers',
            let: { courseId: '$_id' },
            pipeline: [
              { $match: { isDeleted: false } },
              { $match: { $expr: { $in: ['$$courseId', '$assignedCourses'] } } },
              { $count: 'count' },
            ],
            as: 'teacherCount',
          },
        },
        {
          $addFields: {
            teachers: {
              $ifNull: [{ $arrayElemAt: ['$teacherCount.count', 0] }, 0],
            },
          },
        },
        { $project: { teacherCount: 0 } },
        {
          $lookup: {
            from: 'students',
            let: { courseId: '$_id' },
            pipeline: [
              { $match: { isDeleted: false } },
              { $match: { $expr: { $in: ['$$courseId', '$courses.course'] } } },
              { $count: 'count' },
            ],
            as: 'studentCount',
          },
        },
        {
          $addFields: {
            students: {
              $ifNull: [{ $arrayElemAt: ['$studentCount.count', 0] }, 0],
            },
          },
        },
        { $project: { studentCount: 0 } },
        { $sort: { title: 1 } },
      ]),
    ]);

    return {
      total,
      published,
      draft,
      archived,
      featured,
      categoryDistribution: categoryDist,
      perCourse: coursesWithTeacherStats,
    };
  }

  async getCourseDetailWithStats(courseId) {
    const Teacher = require('../models/Teacher.model');
    const Student = require('../models/Student.model');

    const course = await this.getById(courseId);
    if (!course) return null;

    // Get assigned teachers (official, not just preferred)
    const assignedTeachers = await Teacher.find({
      isDeleted: false,
      assignedCourses: course._id,
    })
      .select('fullName email qualification specialization profilePhoto')
      .populate('user', 'profileVerificationStatus')
      .lean();

    // Get students who selected this course
    const interestedStudents = await Student.find({
      isDeleted: false,
      'courses.course': course._id,
    })
      .select('studentName email studentId phone status')
      .populate('user', 'profileVerificationStatus')
      .lean();

    // Get students officially assigned to teachers for this course
    const assignedStudentIds = assignedTeachers
      .filter(t => t.assignedStudents && t.assignedStudents.length > 0)
      .flatMap(t => t.assignedStudents || []);

    const assignedStudents = await Student.find({
      _id: { $in: assignedStudentIds },
      isDeleted: false,
    })
      .select('studentName email studentId phone status')
      .lean();

    return {
      course: course.toPublicJSON ? course.toPublicJSON() : course,
      teachers: {
        count: assignedTeachers.length,
        list: assignedTeachers,
      },
      students: {
        interestedCount: interestedStudents.length,
        assignedCount: assignedStudents.length,
        interested: interestedStudents,
        assigned: assignedStudents,
      },
    };
  }
}

module.exports = new CourseService();
