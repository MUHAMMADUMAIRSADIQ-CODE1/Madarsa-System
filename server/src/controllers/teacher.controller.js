const { TeacherService, AuditService } = require('../services');
const { ApiResponse, asyncHandler, helpers } = require('../utils');
const { CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');
const User = require('../models/User.model');
const { roles, USER_STATUS } = require('../constants');

const getAll = asyncHandler(async (req, res) => {
  const { page, limit, skip } = helpers.parsePagination(req.query);
  const sort = helpers.buildSortObject(req.query.sortBy, req.query.sortOrder);

  const query = { isDeleted: false };
  if (req.query.search) query.search = req.query.search;
  if (req.query.specialization) query.specialization = req.query.specialization;
  if (req.query.country) query.country = req.query.country;
  if (req.query.status) query.status = req.query.status;
  if (req.query.featured === 'true') query.featured = true;

  // Support filtering by user approval status (pending, active, rejected, blocked)
  if (req.query.userStatus) {
    const validStatuses = Object.values(USER_STATUS);
    const statuses = req.query.userStatus.split(',').filter(s => validStatuses.includes(s));
    if (statuses.length > 0) {
      const userFilter = { role: roles.TEACHER, status: { $in: statuses } };
      const matchingUsers = await User.find(userFilter).select('_id').lean();
      const userIds = matchingUsers.map(u => u._id);
      if (userIds.length > 0) {
        query.user = { $in: userIds };
      } else {
        // No matching users, return empty
        query._id = null;
      }
    }
  }

  const result = await TeacherService.getAll(query, { page, limit, skip, sort, populate: 'user' });

  res.status(200).json(ApiResponse.success('Teachers fetched successfully', result));
});

const getById = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.getById(req.params.id, { populate: 'user' });
  res.status(200).json(ApiResponse.success('Teacher fetched successfully', teacher));
});

const getBySlug = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.getPublishedBySlug(req.params.slug);
  if (!teacher) {
    return res.status(200).json(ApiResponse.success('Teacher not found', null));
  }
  res.status(200).json(ApiResponse.success('Teacher fetched successfully', teacher.toPublicJSON()));
});



const update = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.files) {
    if (req.files.profilePhoto) {
      data.profilePhoto = `/uploads/${req.files.profilePhoto[0].filename}`;
    }
  }

  if (data.subjects && typeof data.subjects === 'string') {
    data.subjects = JSON.parse(data.subjects);
  }
  if (data.teachingLanguages && typeof data.teachingLanguages === 'string') {
    data.teachingLanguages = JSON.parse(data.teachingLanguages);
  }
  if (data.skills && typeof data.skills === 'string') {
    data.skills = JSON.parse(data.skills);
  }
  if (data.certificates && typeof data.certificates === 'string') {
    data.certificates = JSON.parse(data.certificates);
  }
  if (data.seoKeywords && typeof data.seoKeywords === 'string') {
    data.seoKeywords = JSON.parse(data.seoKeywords);
  }
  if (data.canTeachCourses && typeof data.canTeachCourses === 'string') {
    data.canTeachCourses = JSON.parse(data.canTeachCourses);
  }

  data.updatedBy = req.user.id;

  const teacher = await TeacherService.update(req.params.id, data);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.TEACHERS,
    resourceId: teacher._id,
    resourceType: 'teacher',
    description: `Updated teacher: ${teacher.fullName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Teacher updated successfully', teacher));
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.softDeleteTeacher(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.DELETE,
    module: CMS_MODULES.TEACHERS,
    resourceId: teacher._id,
    resourceType: 'teacher',
    description: `Deleted teacher: ${teacher.fullName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Teacher deleted successfully', teacher));
});

const restoreTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.restoreTeacher(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.RESTORE,
    module: CMS_MODULES.TEACHERS,
    resourceId: teacher._id,
    resourceType: 'teacher',
    description: `Restored teacher: ${teacher.fullName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Teacher restored successfully', teacher));
});

const publishTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.publishTeacher(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.PUBLISH,
    module: CMS_MODULES.TEACHERS,
    resourceId: teacher._id,
    resourceType: 'teacher',
    description: `Published teacher: ${teacher.fullName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Teacher published successfully', teacher));
});

const unpublishTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.unpublishTeacher(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UNPUBLISH,
    module: CMS_MODULES.TEACHERS,
    resourceId: teacher._id,
    resourceType: 'teacher',
    description: `Unpublished teacher: ${teacher.fullName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Teacher unpublished successfully', teacher));
});

const archiveTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.archiveTeacher(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.ARCHIVE,
    module: CMS_MODULES.TEACHERS,
    resourceId: teacher._id,
    resourceType: 'teacher',
    description: `Archived teacher: ${teacher.fullName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Teacher archived successfully', teacher));
});

const duplicateTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.duplicateTeacher(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.TEACHERS,
    resourceId: teacher._id,
    resourceType: 'teacher',
    description: `Duplicated teacher from ${req.params.id}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('Teacher duplicated successfully', teacher));
});

const getStats = asyncHandler(async (_req, res) => {
  const stats = await TeacherService.getTeacherStats();
  res.status(200).json(ApiResponse.success('Teacher stats fetched successfully', stats));
});

const getPublished = asyncHandler(async (req, res) => {
  const { page, limit, skip } = helpers.parsePagination(req.query);
  const sort = helpers.buildSortObject(req.query.sortBy, req.query.sortOrder);

  const query = {};
  if (req.query.specialization) query.specialization = req.query.specialization;
  if (req.query.country) query.country = req.query.country;
  if (req.query.featured === 'true') query.featured = true;
  if (req.query.search) query.search = req.query.search;

  const result = await TeacherService.getPublishedTeachers(query, { page, limit, skip, sort });

  const sanitized = {
    ...result,
    data: result.data.map((t) => (t.toPublicJSON ? t.toPublicJSON() : t)),
  };

  res.status(200).json(ApiResponse.success('Published teachers fetched successfully', sanitized));
});

const assignCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const teacher = await TeacherService.assignCourse(req.params.id, courseId);
  res.status(200).json(ApiResponse.success('Course assigned successfully', teacher));
});

const removeCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const teacher = await TeacherService.removeCourse(req.params.id, courseId);
  res.status(200).json(ApiResponse.success('Course removed successfully', teacher));
});

const bulkAssignCourses = asyncHandler(async (req, res) => {
  const { courseIds } = req.body;
  const teacher = await TeacherService.bulkAssignCourses(req.params.id, courseIds, req.user.id);
  res.status(200).json(ApiResponse.success('Courses assigned successfully', teacher));
});

const getAssignedCourses = asyncHandler(async (req, res) => {
  const data = await TeacherService.getTeacherAssignedCourses(req.params.id);
  res.status(200).json(ApiResponse.success('Assigned courses fetched successfully', data));
});

const getAssignableCourses = asyncHandler(async (req, res) => {
  const courses = await TeacherService.getAssignableCourses(req.params.id);
  res.status(200).json(ApiResponse.success('Assignable courses fetched successfully', courses));
});

module.exports = {
  getAll, getById, getBySlug, update,
  deleteTeacher, restoreTeacher, publishTeacher, unpublishTeacher,
  archiveTeacher, duplicateTeacher, getStats, getPublished,
  assignCourse, removeCourse,
  bulkAssignCourses, getAssignedCourses, getAssignableCourses,
};
