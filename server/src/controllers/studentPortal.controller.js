const studentPortalService = require('../services/studentPortal.service');
const { ApiResponse, asyncHandler } = require('../utils');

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

module.exports = {
  getProfile, getProfileById, updateProfile, getDashboard,
};
