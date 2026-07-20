const { AdmissionService, AuditService } = require('../services');
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

  const result = await AdmissionService.getAll(query, { page, limit, skip, sort });

  res.status(200).json(ApiResponse.success('Admissions fetched successfully', result));
});

const getById = asyncHandler(async (req, res) => {
  const admission = await AdmissionService.getById(req.params.id);
  res.status(200).json(ApiResponse.success('Admission fetched successfully', admission));
});

const getStats = asyncHandler(async (_req, res) => {
  const stats = await AdmissionService.getAdmissionStats();
  res.status(200).json(ApiResponse.success('Admission stats fetched successfully', stats));
});

const update = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.files) {
    if (req.files.studentPhoto) data.studentPhoto = `/uploads/${req.files.studentPhoto[0].filename}`;
  }

  data.updatedBy = req.user.id;

  const admission = await AdmissionService.update(req.params.id, data);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.ADMISSIONS,
    resourceId: admission._id,
    resourceType: 'admission',
    description: `Updated admission ${admission.applicationNumber}: ${admission.studentName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Admission updated successfully', admission));
});

const deleteAdmission = asyncHandler(async (req, res) => {
  const admission = await AdmissionService.softDeleteAdmission(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.DELETE,
    module: CMS_MODULES.ADMISSIONS,
    resourceId: admission._id,
    resourceType: 'admission',
    description: `Deleted admission ${admission.applicationNumber}: ${admission.studentName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Admission deleted successfully', admission));
});

const restoreAdmission = asyncHandler(async (req, res) => {
  const admission = await AdmissionService.restoreAdmission(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.RESTORE,
    module: CMS_MODULES.ADMISSIONS,
    resourceId: admission._id,
    resourceType: 'admission',
    description: `Restored admission ${admission.applicationNumber}: ${admission.studentName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Admission restored successfully', admission));
});

const approveAdmission = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const admission = await AdmissionService.approveAdmission(req.params.id, req.user.id, remarks);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.APPROVE,
    module: CMS_MODULES.ADMISSIONS,
    resourceId: admission._id,
    resourceType: 'admission',
    description: `Approved admission ${admission.applicationNumber}: ${admission.studentName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Admission approved successfully', admission));
});

const rejectAdmission = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const admission = await AdmissionService.rejectAdmission(req.params.id, req.user.id, remarks);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.REJECT,
    module: CMS_MODULES.ADMISSIONS,
    resourceId: admission._id,
    resourceType: 'admission',
    description: `Rejected admission ${admission.applicationNumber}: ${admission.studentName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Admission rejected successfully', admission));
});

const waitlistAdmission = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const admission = await AdmissionService.waitlistAdmission(req.params.id, req.user.id, remarks);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.WAITLIST,
    module: CMS_MODULES.ADMISSIONS,
    resourceId: admission._id,
    resourceType: 'admission',
    description: `Waitlisted admission ${admission.applicationNumber}: ${admission.studentName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Admission waitlisted successfully', admission));
});

const reviewAdmission = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const admission = await AdmissionService.reviewAdmission(req.params.id, req.user.id, remarks);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.REVIEW,
    module: CMS_MODULES.ADMISSIONS,
    resourceId: admission._id,
    resourceType: 'admission',
    description: `Reviewed admission ${admission.applicationNumber}: ${admission.studentName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Admission reviewed successfully', admission));
});

const submitApplication = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.files) {
    if (req.files.studentPhoto) data.studentPhoto = `/uploads/${req.files.studentPhoto[0].filename}`;
  }

  data.createdBy = req.user?.id;
  data.updatedBy = req.user?.id;

  const admission = await AdmissionService.create(data);

  await AuditService.log({
    user: req.user?.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.ADMISSIONS,
    resourceId: admission._id,
    resourceType: 'admission',
    description: `Application submitted: ${admission.applicationNumber} - ${admission.studentName}`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('Application submitted successfully', admission.toPublicJSON()));
});

const convertToStudent = asyncHandler(async (req, res) => {
  const student = await AdmissionService.convertToStudent(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CONVERT,
    module: CMS_MODULES.ADMISSIONS,
    resourceId: req.params.id,
    resourceType: 'admission',
    description: `Converted admission to student: ${student.studentName} (${student.studentId})`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('Admission converted to student successfully', student));
});

const checkStatus = asyncHandler(async (req, res) => {
  const { applicationNumber } = req.params;
  const admission = await AdmissionService.getByApplicationNumber(applicationNumber);

  if (!admission) {
    return res.status(200).json(ApiResponse.success('Application not found', null));
  }

  res.status(200).json(ApiResponse.success('Application status fetched successfully', admission.toPublicJSON()));
});

module.exports = {
  getAll, getById, getStats, update,
  deleteAdmission, restoreAdmission,
  approveAdmission, rejectAdmission, waitlistAdmission, reviewAdmission,
  submitApplication, checkStatus, convertToStudent,
};
