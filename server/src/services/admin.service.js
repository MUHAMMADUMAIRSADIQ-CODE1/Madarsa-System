const bcrypt = require('bcrypt');
const env = require('../config/env');
const User = require('../models/User.model');
const { ApiError, logger } = require('../utils');
const { httpStatus, messages, roles, USER_STATUS } = require('../constants');
const emailService = require('./email.service');
const AuditService = require('./audit.service');

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

  async getRejectedUsers(query = {}) {
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
      status: USER_STATUS.REJECTED,
      role: { $in: [roles.STUDENT, roles.TEACHER] },
      ...roleFilter,
      ...searchFilter,
    };

    const [users, total] = await Promise.all([
      User.find(baseFilter)
        .sort({ rejectedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(baseFilter),
    ]);

    const rejectedStudentsCount = await User.countDocuments({
      role: roles.STUDENT,
      status: USER_STATUS.REJECTED,
    });

    const rejectedTeachersCount = await User.countDocuments({
      role: roles.TEACHER,
      status: USER_STATUS.REJECTED,
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
      rejectionReason: u.rejectionReason || '',
      rejectedBy: u.rejectedBy,
      rejectedAt: u.rejectedAt,
      approvedAt: u.approvedAt,
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
        rejectedStudents: rejectedStudentsCount,
        rejectedTeachers: rejectedTeachersCount,
        totalRejected: rejectedStudentsCount + rejectedTeachersCount,
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

    // Allow approving both pending AND rejected users (re-approval)
    const isReApproval = user.status === USER_STATUS.REJECTED;

    if (user.status !== USER_STATUS.PENDING && user.status !== USER_STATUS.REJECTED) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User must be in pending or rejected status to be approved');
    }

    user.status = USER_STATUS.ACTIVE;
    user.approvedAt = new Date();
    user.approvedBy = adminId;
    user.rejectionReason = undefined;
    user.rejectedAt = undefined;
    user.rejectedBy = undefined;
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

  async blockUser(adminId, userId, reason) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (user.role === roles.ADMIN) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot block admin accounts');
    }

    if (user.status === USER_STATUS.BLOCKED) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User is already blocked');
    }

    user.status = USER_STATUS.BLOCKED;
    user.isActive = false;
    user.blockedAt = new Date();
    user.blockedBy = adminId;
    user.blockReason = reason || '';
    await user.save({ validateBeforeSave: false });

    // Send blocked email
    const { subject, html } = emailService.getBlockedEmail(user.fullName, reason || '');
    await emailService.sendEmail({ to: user.email, subject, html });

    AuditService.log({
      user: adminId,
      action: 'block_user',
      module: 'admin',
      resourceId: userId,
      resourceType: 'User',
      description: `Blocked user: ${user.email} (${user.role})${reason ? ` - Reason: ${reason}` : ''}`,
      metadata: { blockedUser: userId, role: user.role, email: user.email, reason: reason || '' },
    });

    return user.toPublicJSON();
  }

  async unblockUser(adminId, userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (user.status !== USER_STATUS.BLOCKED) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User is not blocked');
    }

    user.status = USER_STATUS.ACTIVE;
    user.isActive = true;
    user.blockedAt = undefined;
    user.blockedBy = undefined;
    user.blockReason = undefined;
    await user.save({ validateBeforeSave: false });

    // Send unblocked email
    const { subject, html } = emailService.getUnblockedEmail(user.fullName);
    await emailService.sendEmail({ to: user.email, subject, html });

    AuditService.log({
      user: adminId,
      action: 'unblock_user',
      module: 'admin',
      resourceId: userId,
      resourceType: 'User',
      description: `Unblocked user: ${user.email} (${user.role})`,
      metadata: { unblockedUser: userId, role: user.role, email: user.email },
    });

    return user.toPublicJSON();
  }

  async deactivateUser(adminId, userId, reason) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (user.role === roles.ADMIN) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot deactivate admin accounts');
    }

    if (!user.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User is already deactivated');
    }

    user.isActive = false;
    user.status = USER_STATUS.BLOCKED;
    await user.save({ validateBeforeSave: false });

    AuditService.log({
      user: adminId,
      action: 'deactivate_user',
      module: 'admin',
      resourceId: userId,
      resourceType: 'User',
      description: `Deactivated user: ${user.email} (${user.role})${reason ? ` - Reason: ${reason}` : ''}`,
      metadata: { deactivatedUser: userId, role: user.role, email: user.email, reason: reason || '' },
    });

    return user.toPublicJSON();
  }

  async activateUser(adminId, userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (user.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User is already active');
    }

    user.isActive = true;
    if (user.status === USER_STATUS.BLOCKED) {
      user.status = USER_STATUS.ACTIVE;
    }
    user.activatedAt = new Date();
    user.activatedBy = adminId;
    await user.save({ validateBeforeSave: false });

    // Send activated email
    const { subject, html } = emailService.getActivatedEmail(user.fullName);
    await emailService.sendEmail({ to: user.email, subject, html });

    AuditService.log({
      user: adminId,
      action: 'activate_user',
      module: 'admin',
      resourceId: userId,
      resourceType: 'User',
      description: `Activated user: ${user.email} (${user.role})`,
      metadata: { activatedUser: userId, role: user.role, email: user.email },
    });

    return user.toPublicJSON();
  }

  async getPendingProfileVerifications(query = {}) {
    const { page = 1, limit = 20, role, search = '' } = query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const searchFilter = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const roleFilter = role && [roles.STUDENT, roles.TEACHER].includes(role)
      ? { role }
      : {};

    const baseFilter = {
      profileComplete: true,
      profileVerificationStatus: 'pending',
      role: { $in: [roles.STUDENT, roles.TEACHER] },
      ...roleFilter,
      ...searchFilter,
    };

    const [users, total] = await Promise.all([
      User.find(baseFilter)
        .sort({ profileVerificationSubmittedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(baseFilter),
    ]);

    const pendingStudentsCount = await User.countDocuments({
      ...baseFilter,
      role: roles.STUDENT,
    });
    const pendingTeachersCount = await User.countDocuments({
      ...baseFilter,
      role: roles.TEACHER,
    });

    const mapped = users.map((u) => ({
      id: u._id,
      _id: u._id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      status: u.status,
      phone: u.phone || '',
      country: u.country || '',
      city: u.city || '',
      gender: u.gender || '',
      profileComplete: u.profileComplete,
      profileVerified: u.profileVerified,
      profileVerificationStatus: u.profileVerificationStatus,
      profileVerificationSubmittedAt: u.profileVerificationSubmittedAt,
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

  async approveProfileVerification(adminId, userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }
    if (user.role === roles.ADMIN) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot verify admin profiles');
    }
    if (user.profileVerificationStatus !== 'pending') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Profile is not pending verification');
    }

    user.profileVerified = true;
    user.profileVerificationStatus = 'verified';
    user.profileVerificationApprovedAt = new Date();
    user.profileVerificationApprovedBy = adminId;
    user.profileVerificationRejectedAt = undefined;
    user.profileVerificationRejectedBy = undefined;
    user.profileVerificationRejectionReason = undefined;
    await user.save({ validateBeforeSave: false });

    const { subject, html } = emailService.getProfileVerifiedEmail(user.fullName);
    await emailService.sendEmail({ to: user.email, subject, html });

    AuditService.log({
      user: adminId,
      action: 'verify_profile',
      module: 'admin',
      resourceId: userId,
      resourceType: 'User',
      description: `Profile verified for user: ${user.email} (${user.role})`,
      metadata: { verifiedUser: userId, role: user.role, email: user.email },
    });

    return user.toPublicJSON();
  }

  async rejectProfileVerification(adminId, userId, reason) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.USER_NOT_FOUND);
    }
    if (user.role === roles.ADMIN) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot reject admin profiles');
    }
    if (user.profileVerificationStatus !== 'pending') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Profile is not pending verification');
    }

    user.profileVerified = false;
    user.profileVerificationStatus = 'rejected';
    user.profileVerificationRejectedAt = new Date();
    user.profileVerificationRejectedBy = adminId;
    user.profileVerificationRejectionReason = reason || 'Profile information needs correction. Please update and resubmit.';
    user.profileVerificationApprovedAt = undefined;
    user.profileVerificationApprovedBy = undefined;
    await user.save({ validateBeforeSave: false });

    const { subject, html } = emailService.getProfileRejectedEmail(user.fullName, user.profileVerificationRejectionReason);
    await emailService.sendEmail({ to: user.email, subject, html });

    AuditService.log({
      user: adminId,
      action: 'reject_profile',
      module: 'admin',
      resourceId: userId,
      resourceType: 'User',
      description: `Profile verification rejected for user: ${user.email} (${user.role}) - ${user.profileVerificationRejectionReason}`,
      metadata: { rejectedUser: userId, role: user.role, email: user.email, reason: user.profileVerificationRejectionReason },
    });

    return user.toPublicJSON();
  }
}

module.exports = new AdminService();
