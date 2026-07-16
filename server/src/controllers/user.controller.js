const BaseController = require('./BaseController');
const { UserService, AuthService } = require('../services');
const { ApiResponse, asyncHandler } = require('../utils');
const { messages } = require('../constants');

class UserController extends BaseController {
  constructor() {
    super(UserService);
  }

  getProfile = asyncHandler(async (req, res) => {
    const user = await this.service.getById(req.user.id);
    res.status(200).json(
      ApiResponse.success('Profile fetched successfully', user.toPublicJSON())
    );
  });

  updateProfile = asyncHandler(async (req, res) => {
    const user = await this.service.updateProfile(req.user.id, req.body);
    res.status(200).json(
      ApiResponse.success(messages.PROFILE_UPDATED, user.toPublicJSON())
    );
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );
    res.status(200).json(
      ApiResponse.success(result.message)
    );
  });

  getStudents = asyncHandler(async (_req, res) => {
    const students = await this.service.getStudents();
    res.status(200).json(
      ApiResponse.success('Students fetched successfully', students)
    );
  });

  getTeachers = asyncHandler(async (_req, res) => {
    const teachers = await this.service.getTeachers();
    res.status(200).json(
      ApiResponse.success('Teachers fetched successfully', teachers)
    );
  });

  getByRole = asyncHandler(async (req, res) => {
    const { role } = req.params;
    const result = await this.service.getUsersByRole(role);
    res.status(200).json(
      ApiResponse.success(`Users with role ${role} fetched successfully`, result)
    );
  });
}

module.exports = new UserController();
