const bcrypt = require('bcrypt');
const env = require('../config/env');
const User = require('../models/User.model');
const { ApiError, logger } = require('../utils');
const { httpStatus, messages, roles, USER_STATUS } = require('../constants');
const emailService = require('./email.service');

class AdminService {
  async seedAdmin() {
    try {
      const existingAdmin = await User.findOne({ role: roles.ADMIN });

      if (existingAdmin) {
        logger.info('Admin already exists, skipping seed');
        return;
      }

      const adminName = env.admin.name || 'Admin';
      const adminEmail = env.admin.email;
      const adminPassword = env.admin.password;

      if (!adminEmail || !adminPassword) {
        logger.warn(
          'ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to create admin. Skipping admin seed.'
        );
        return;
      }

      const nameParts = adminName.trim().split(/\s+/);
      const admin = await User.create({
        email: adminEmail,
        password: adminPassword,
        fullName: adminName,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        role: roles.ADMIN,
        status: USER_STATUS.ACTIVE,
      });

      logger.info(`Admin created successfully: ${admin.email}`);
    } catch (error) {
      logger.error('Admin seeding failed:', error.message);
      throw error;
    }
  }

  async getPendingUsers(query = {}) {
    const {
      page = 1,
      limit = 20,
      role,
      search = '',
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const searchFilter = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const roleFilter = role && [roles.STUDENT, roles.TEACHER].includes(role)
      ? { role }
      : {};

    const baseFilter = {
      status: USER_STATUS.PENDING,
      isActive: true,
      role: { $in: [roles.STUDENT, roles.TEACHER] },
      ...roleFilter,
      ...searchFilter,
    };

    const [users, total] = await Promise.all([
      User.find(baseFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(baseFilter),
    ]);

    const pendingStudentsCount = await User.countDocuments({
      role: roles.STUDENT,
      status: USER_STATUS.PENDING,
      isActive: true,
    });

    const pendingTeachersCount = await User.countDocuments({
      role: roles.TEACHER,
      status: USER_STATUS.PENDING,
      isActive: true,
    });

    const mapped = users.map((u) => ({
      id: u._id,
      _id: u._id,
      email: u.email,
      fullName: u.fullName,
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      role: u.role,
      status: u.status,
      phone: u.phone || '',
      country: u.country || '',
      city: u.city || '',
      gender: u.gender || '',
      profileImage: u.profileImage || '',
      photo: u.photo || '',
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return {
      users: mapped,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
      stats: {
        pendingStudents: pendingStudentsCount,
        pendingTeachers: pendingTeachersCount,
        totalPending: pendingStudentsCount + pendingTeachersCount,
      },
    };
  }

  async approveUser(adminId, userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (user.role === roles.ADMIN) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot approve admin accounts');
    }

    if (user.status !== USER_STATUS.PENDING) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User is not in pending status');
    }

    user.status = USER_STATUS.ACTIVE;
    user.approvedAt = new Date();
    user.approvedBy = adminId;
    user.rejectionReason = undefined;
    await user.save({ validateBeforeSave: false });

    // Send approval email
    const loginUrl = `${env.frontendUrl}/login`;
    const { subject, html } = emailService.getApprovalEmail(
      user.fullName,
      user.role,
      loginUrl
    );
    await emailService.sendEmail({ to: user.email, subject, html });

    return user.toPublicJSON();
  }

  async rejectUser(adminId, userId, reason) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (user.role === roles.ADMIN) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot reject admin accounts');
    }

    if (user.status !== USER_STATUS.PENDING) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User is not in pending status');
    }

    user.status = USER_STATUS.REJECTED;
    user.rejectionReason = reason || 'Your application was not approved at this time.';
    user.rejectedBy = adminId;
    user.rejectedAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Send rejection email
    const { subject, html } = emailService.getRejectionEmail(
      user.fullName,
      user.rejectionReason
    );
    await emailService.sendEmail({ to: user.email, subject, html });

    return user.toPublicJSON();
  }
}

module.exports = new AdminService();
