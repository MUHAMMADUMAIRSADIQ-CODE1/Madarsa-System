const teacherPortalService = require('../services/teacherPortal.service');
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

module.exports = {
  getProfile, getProfileById, updateProfile, getDashboard, getCourses, getStudents,
};
