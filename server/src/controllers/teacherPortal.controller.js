const teacherPortalService = require('../services/teacherPortal.service');
const StudentAssignmentService = require('../services/studentAssignment.service');
const { ApiResponse, asyncHandler } = require('../utils');

const getProfile = asyncHandler(async (req, res) => {
  const teacher = await teacherPortalService.getProfileByEmail(req.user.email);
  res.status(200).json(ApiResponse.success('Profile fetched successfully', teacher));
});

const getProfileById = asyncHandler(async (req, res) => {
  const teacher = await teacherPortalService.getProfileById(req.params.id);
  res.status(200).json(ApiResponse.success('Profile fetched successfully', teacher));
});

const updateProfile = asyncHandler(async (req, res) => {
  const teacher = await teacherPortalService.updateProfile(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success('Profile updated successfully', teacher));
});

const getDashboard = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.getDashboardData(req.params.id);
  res.status(200).json(ApiResponse.success('Dashboard data fetched successfully', data));
});

const getCourses = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.getAssignedCourses(req.params.id, req.query);
  res.status(200).json(ApiResponse.success('Courses fetched successfully', data));
});

const getStudents = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.getStudents(req.params.id, req.query);
  res.status(200).json(ApiResponse.success('Students fetched successfully', data));
});

// =================== ASSIGNMENTS ===================

const getAssignments = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.getAssignments(req.params.teacherId, req.query);
  res.status(200).json(ApiResponse.success('Assignments fetched successfully', data));
});

const getAssignment = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.getAssignmentById(req.params.id);
  res.status(200).json(ApiResponse.success('Assignment fetched successfully', data));
});

const createAssignment = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.createAssignment(req.body, req.user.id);
  res.status(201).json(ApiResponse.created('Assignment created successfully', data));
});

const updateAssignment = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.updateAssignment(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success('Assignment updated successfully', data));
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.deleteAssignment(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success('Assignment deleted successfully', data));
});

// =================== COURSE DETAILS ===================

const getCourseDetails = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.getCourseDetails(req.params.teacherId, req.params.courseId);
  res.status(200).json(ApiResponse.success('Course details fetched successfully', data));
});

// =================== SCHEDULE ===================

const getSchedule = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.getSchedule(req.params.teacherId, req.query);
  res.status(200).json(ApiResponse.success('Schedule fetched successfully', data));
});

// =================== COURSE MATERIALS ===================

const getCourseMaterials = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.getCourseMaterials(req.params.courseId, req.query);
  res.status(200).json(ApiResponse.success('Course materials fetched successfully', data));
});

const addCourseMaterial = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.addCourseMaterial(req.params.courseId, req.body, req.user.id);
  res.status(201).json(ApiResponse.created('Material added successfully', data));
});

const deleteCourseMaterial = asyncHandler(async (req, res) => {
  const data = await teacherPortalService.deleteCourseMaterial(req.params.courseId, req.params.materialIndex, req.user.id);
  res.status(200).json(ApiResponse.success('Material deleted successfully', data));
});

// =================== ASSIGNED STUDENTS ===================

const getAssignedStudents = asyncHandler(async (req, res) => {
  const data = await StudentAssignmentService.getAssignedStudents(
    req.params.teacherId,
    req.query
  );
  res.status(200).json(ApiResponse.success('Assigned students fetched successfully', data));
});

module.exports = {
  getProfile, getProfileById, updateProfile, getDashboard, getCourses, getStudents,
  getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment,
  getCourseDetails, getSchedule,
  getCourseMaterials, addCourseMaterial, deleteCourseMaterial,
  getAssignedStudents,
};
