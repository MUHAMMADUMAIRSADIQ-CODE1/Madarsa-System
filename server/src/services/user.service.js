const BaseService = require('./BaseService');
const User = require('../models/User.model');
const { USER_STATUS } = require('../constants');

class UserService extends BaseService {
  constructor() {
    super(User, 'User');
    this.searchFields = ['fullName', 'firstName', 'lastName', 'email', 'phone'];
  }

  async getByEmail(email) {
    return this.getOne({ email: email.toLowerCase() });
  }

  async getByFirebaseUid(firebaseUid) {
    return this.getOne({ firebaseUid });
  }

  async updateProfile(userId, data) {
    const allowedFields = [
      'fullName',
      'firstName',
      'lastName',
      'phone',
      'profileImage',
      'photo',
      'country',
      'city',
      'gender',
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    if (updateData.fullName && !updateData.firstName && !updateData.lastName) {
      const parts = updateData.fullName.trim().split(/\s+/);
      updateData.firstName = parts[0] || '';
      updateData.lastName = parts.slice(1).join(' ') || '';
    }
    return this.update(userId, updateData);
  }

  async getStudents() {
    const { Student } = require('../models');
    return Student.find().populate('user', 'fullName firstName lastName email profileImage');
  }

  async getTeachers() {
    const { Teacher } = require('../models');
    return Teacher.find().populate('user', 'fullName firstName lastName email profileImage');
  }

  async getUsersByRole(role) {
    return this.getAll({ role, status: USER_STATUS.ACTIVE });
  }

  async findByFirebaseUidOrEmail(firebaseUid, email) {
    let user = await this.getByFirebaseUid(firebaseUid);
    if (!user) {
      user = await this.getByEmail(email);
      if (user) {
        user.firebaseUid = firebaseUid;
        await user.save({ validateBeforeSave: false });
      }
    }
    return user;
  }
}

module.exports = new UserService();
