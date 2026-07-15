const attendanceService = require('../services/attendance.service');
const { ApiResponse, asyncHandler } = require('../utils');

const getAll = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAll(req.query);
  res.status(200).json(ApiResponse.success('Attendance records fetched successfully', result));
});

const getById = asyncHandler(async (req, res) => {
  const record = await attendanceService.getById(req.params.id);
  res.status(200).json(ApiResponse.success('Attendance record fetched successfully', record));
});

const create = asyncHandler(async (req, res) => {
  const record = await attendanceService.create(req.body, req.user.id);
  res.status(201).json(ApiResponse.created('Attendance marked successfully', record));
});

const update = asyncHandler(async (req, res) => {
  const record = await attendanceService.update(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success('Attendance record updated successfully', record));
});

const remove = asyncHandler(async (req, res) => {
  await attendanceService.softDelete(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success('Attendance record deleted successfully'));
});

const restore = asyncHandler(async (req, res) => {
  const record = await attendanceService.restore(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success('Attendance record restored successfully', record));
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await attendanceService.getStats(req.query);
  res.status(200).json(ApiResponse.success('Attendance stats fetched successfully', stats));
});

const getTeacherAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getTeacherAttendance(req.params.teacherId, req.query);
  res.status(200).json(ApiResponse.success('Teacher attendance fetched successfully', result));
});

const getStudentAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getStudentAttendance(req.params.studentId, req.query);
  res.status(200).json(ApiResponse.success('Student attendance fetched successfully', result));
});

module.exports = {
  getAll, getById, create, update, remove, restore, getStats,
  getTeacherAttendance, getStudentAttendance,
};
