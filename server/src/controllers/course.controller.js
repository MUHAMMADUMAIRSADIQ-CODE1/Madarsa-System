const { CourseService, AuditService } = require('../services');
const { ApiResponse, asyncHandler, helpers } = require('../utils');
const { CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');

const getAll = asyncHandler(async (req, res) => {
  const { page, limit, skip } = helpers.parsePagination(req.query);
  const sort = helpers.buildSortObject(req.query.sortBy, req.query.sortOrder);

  const query = { isDeleted: false };
  if (req.query.search) query.search = req.query.search;
  if (req.query.category) query.categoryName = req.query.category;
  if (req.query.level) query.level = req.query.level;
  if (req.query.status) query.status = req.query.status;
  if (req.query.language) query.language = req.query.language;
  if (req.query.featured === 'true') query.featured = true;
  if (req.query.popular === 'true') query.popular = true;

  const result = await CourseService.getAll(query, { page, limit, skip, sort });

  res.status(200).json(ApiResponse.success('Courses fetched successfully', result));
});

const getById = asyncHandler(async (req, res) => {
  const course = await CourseService.getById(req.params.id);
  res.status(200).json(ApiResponse.success('Course fetched successfully', course));
});

const getBySlug = asyncHandler(async (req, res) => {
  const course = await CourseService.getPublishedBySlug(req.params.slug);
  if (!course) {
    return res.status(200).json(ApiResponse.success('Course not found', null));
  }
  res.status(200).json(ApiResponse.success('Course fetched successfully', course.toPublicJSON()));
});

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.files) {
    if (req.files.thumbnail) {
      data.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
    }
    if (req.files.banner) {
      data.banner = `/uploads/${req.files.banner[0].filename}`;
    }
  }

  data.createdBy = req.user.id;
  data.updatedBy = req.user.id;

  const course = await CourseService.create(data);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.COURSES,
    resourceId: course._id,
    resourceType: 'course',
    description: `Created course: ${course.title}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('Course created successfully', course));
});

const update = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.files) {
    if (req.files.thumbnail) {
      data.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
    }
    if (req.files.banner) {
      data.banner = `/uploads/${req.files.banner[0].filename}`;
    }
  }

  data.updatedBy = req.user.id;

  const course = await CourseService.update(req.params.id, data);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.COURSES,
    resourceId: course._id,
    resourceType: 'course',
    description: `Updated course: ${course.title}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Course updated successfully', course));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await CourseService.softDeleteCourse(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.DELETE,
    module: CMS_MODULES.COURSES,
    resourceId: course._id,
    resourceType: 'course',
    description: `Deleted course: ${course.title}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Course deleted successfully', course));
});

const restoreCourse = asyncHandler(async (req, res) => {
  const course = await CourseService.restoreCourse(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.RESTORE,
    module: CMS_MODULES.COURSES,
    resourceId: course._id,
    resourceType: 'course',
    description: `Restored course: ${course.title}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Course restored successfully', course));
});

const publishCourse = asyncHandler(async (req, res) => {
  const course = await CourseService.publishCourse(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.PUBLISH,
    module: CMS_MODULES.COURSES,
    resourceId: course._id,
    resourceType: 'course',
    description: `Published course: ${course.title}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Course published successfully', course));
});

const unpublishCourse = asyncHandler(async (req, res) => {
  const course = await CourseService.unpublishCourse(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UNPUBLISH,
    module: CMS_MODULES.COURSES,
    resourceId: course._id,
    resourceType: 'course',
    description: `Unpublished course: ${course.title}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Course unpublished successfully', course));
});

const archiveCourse = asyncHandler(async (req, res) => {
  const course = await CourseService.archiveCourse(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.ARCHIVE,
    module: CMS_MODULES.COURSES,
    resourceId: course._id,
    resourceType: 'course',
    description: `Archived course: ${course.title}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Course archived successfully', course));
});

const duplicateCourse = asyncHandler(async (req, res) => {
  const course = await CourseService.duplicateCourse(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.COURSES,
    resourceId: course._id,
    resourceType: 'course',
    description: `Duplicated course from ${req.params.id}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('Course duplicated successfully', course));
});

const getStats = asyncHandler(async (_req, res) => {
  const stats = await CourseService.getCourseStats();
  res.status(200).json(ApiResponse.success('Course stats fetched successfully', stats));
});

const getDetailWithStats = asyncHandler(async (req, res) => {
  const result = await CourseService.getCourseDetailWithStats(req.params.id);
  if (!result) {
    return res.status(404).json(ApiResponse.error('Course not found'));
  }
  res.status(200).json(ApiResponse.success('Course details fetched successfully', result));
});

const getPublished = asyncHandler(async (req, res) => {
  const { page, limit, skip } = helpers.parsePagination(req.query);
  const sort = helpers.buildSortObject(req.query.sortBy, req.query.sortOrder);

  const query = {};
  if (req.query.category) query.categoryName = req.query.category;
  if (req.query.level) query.level = req.query.level;
  if (req.query.language) query.language = req.query.language;
  if (req.query.featured === 'true') query.featured = true;
  if (req.query.popular === 'true') query.popular = true;
  if (req.query.trending === 'true') query.trending = true;
  if (req.query.search) query.search = req.query.search;

  const result = await CourseService.getPublishedCourses(query, { page, limit, skip, sort });

  const sanitized = {
    ...result,
    data: result.data.map((c) => c.toPublicJSON ? c.toPublicJSON() : c),
  };

  res.status(200).json(ApiResponse.success('Published courses fetched successfully', sanitized));
});

const getAllCategories = asyncHandler(async (_req, res) => {
  const categories = await CourseService.getAllCategories();
  res.status(200).json(ApiResponse.success('Categories fetched successfully', categories));
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await CourseService.createCategory(req.body, req.user.id);
  res.status(201).json(ApiResponse.created('Category created successfully', category));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await CourseService.updateCategory(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success('Category updated successfully', category));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await CourseService.deleteCategory(req.params.id);
  res.status(200).json(ApiResponse.success('Category deleted successfully', category));
});

module.exports = {
  getAll, getById, getBySlug, create, update,
  deleteCourse, restoreCourse, publishCourse, unpublishCourse,
  archiveCourse, duplicateCourse, getStats, getDetailWithStats, getPublished,
  getAllCategories, createCategory, updateCategory, deleteCategory,
};
