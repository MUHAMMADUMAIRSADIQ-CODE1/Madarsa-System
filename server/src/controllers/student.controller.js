const { StudentService, AuditService } = require('../services');
const { ApiResponse, asyncHandler, helpers } = require('../utils');
const { CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');

const getAll = asyncHandler(async (req, res) => {
  const { page, limit, skip } = helpers.parsePagination(req.query);
  const sort = helpers.buildSortObject(req.query.sortBy, req.query.sortOrder);

  const query = { isDeleted: false };
  if (req.query.search) query.search = req.query.search;
  if (req.query.status) query.status = req.query.status;
  if (req.query.country) query.country = req.query.country;
  if (req.query.learningMode) query.learningMode = req.query.learningMode;
  if (req.query.course) query.selectedCourse = req.query.course;
  if (req.query.gender) query.gender = req.query.gender;

  const result = await StudentService.getAll(query, { page, limit, skip, sort, populate: 'selectedCourse admissionReference' });

  res.status(200).json(ApiResponse.success('Students fetched successfully', result));
});

const getById = asyncHandler(async (req, res) => {
  const student = await StudentService.getById(req.params.id, { populate: 'selectedCourse admissionReference' });
  res.status(200).json(ApiResponse.success('Student fetched successfully', student));
});

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.createdBy = req.user.id;
  data.updatedBy = req.user.id;

  const student = await StudentService.create(data);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.STUDENTS,
    resourceId: student._id,
    resourceType: 'student',
    description: `Created student: ${student.studentName} (${student.studentId})`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('Student created successfully', student));
});

const update = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.updatedBy = req.user.id;

  const student = await StudentService.update(req.params.id, data);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.STUDENTS,
    resourceId: student._id,
    resourceType: 'student',
    description: `Updated student: ${student.studentName} (${student.studentId})`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Student updated successfully', student));
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await StudentService.softDeleteStudent(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.DELETE,
    module: CMS_MODULES.STUDENTS,
    resourceId: student._id,
    resourceType: 'student',
    description: `Deleted student: ${student.studentName} (${student.studentId})`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Student deleted successfully', student));
});

const restoreStudent = asyncHandler(async (req, res) => {
  const student = await StudentService.restoreStudent(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.RESTORE,
    module: CMS_MODULES.STUDENTS,
    resourceId: student._id,
    resourceType: 'student',
    description: `Restored student: ${student.studentName} (${student.studentId})`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Student restored successfully', student));
});

const activateStudent = asyncHandler(async (req, res) => {
  const student = await StudentService.activateStudent(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.APPROVE,
    module: CMS_MODULES.STUDENTS,
    resourceId: student._id,
    resourceType: 'student',
    description: `Activated student: ${student.studentName} (${student.studentId})`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Student activated successfully', student));
});

const deactivateStudent = asyncHandler(async (req, res) => {
  const student = await StudentService.deactivateStudent(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.ARCHIVE,
    module: CMS_MODULES.STUDENTS,
    resourceId: student._id,
    resourceType: 'student',
    description: `Deactivated student: ${student.studentName} (${student.studentId})`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Student deactivated successfully', student));
});

const getStats = asyncHandler(async (_req, res) => {
  const stats = await StudentService.getStudentStats();
  res.status(200).json(ApiResponse.success('Student stats fetched successfully', stats));
});

const enrollCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const student = await StudentService.enrollInCourse(req.params.id, courseId);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.STUDENTS,
    resourceId: student._id,
    resourceType: 'student',
    description: `Enrolled student ${student.studentName} in course ${courseId}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Enrolled in course successfully', student));
});

const getEnrolledCourses = asyncHandler(async (req, res) => {
  const courses = await StudentService.getEnrolledCourses(req.params.id);
  res.status(200).json(ApiResponse.success('Enrolled courses fetched successfully', courses));
});

module.exports = {
  getAll, getById, create, update,
  deleteStudent, restoreStudent,
  activateStudent, deactivateStudent,
  getStats, enrollCourse, getEnrolledCourses,
};
