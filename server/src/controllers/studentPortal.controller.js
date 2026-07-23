const studentPortalService = require('../services/studentPortal.service');
const teacherAcademicService = require('../services/teacherAcademic.service');
const { ApiResponse, asyncHandler } = require('../utils');

// =================== ASSIGNMENTS ===================

const getCourseAssignments = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getCourseAssignments(req.params.courseId, req.user.id);
  res.status(200).json(ApiResponse.success('Assignments fetched successfully', data));
});

const submitAssignment = asyncHandler(async (req, res) => {
  const data = await studentPortalService.submitAssignment(req.params.id, req.body, req.user.id);
  res.status(201).json(ApiResponse.created('Assignment submitted successfully', data));
});

const getMySubmissions = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getMySubmissions(req.user.id);
  res.status(200).json(ApiResponse.success('Submissions fetched successfully', data));
});

const getProfile = asyncHandler(async (req, res) => {
  const student = await studentPortalService.getProfileByEmail(req.user.email);
  res.status(200).json(ApiResponse.success('Profile fetched successfully', student));
});

const getProfileById = asyncHandler(async (req, res) => {
  const student = await studentPortalService.getProfileById(req.params.id);
  res.status(200).json(ApiResponse.success('Profile fetched successfully', student));
});

const updateProfile = asyncHandler(async (req, res) => {
  const student = await studentPortalService.updateProfile(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success('Profile updated successfully', student));
});

const getDashboard = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getDashboardData(req.params.id);
  res.status(200).json(ApiResponse.success('Dashboard data fetched successfully', data));
});

// =================== RESULTS ===================

const getCourseResults = asyncHandler(async (req, res) => {
  const student = await studentPortalService.getProfileByEmail(req.user.email);
  const data = await teacherAcademicService.getStudentResults(student._id, req.params.courseId);
  res.status(200).json(ApiResponse.success('Results fetched successfully', data));
});

// =================== ANNOUNCEMENTS ===================

const getCourseAnnouncements = asyncHandler(async (req, res) => {
  const data = await teacherAcademicService.getCourseAnnouncements(req.params.courseId);
  res.status(200).json(ApiResponse.success('Course announcements fetched successfully', data));
});

module.exports = {
  getProfile, getProfileById, updateProfile, getDashboard,
  getCourseAssignments, submitAssignment, getMySubmissions,
  getCourseResults,
  getCourseAnnouncements,
};
