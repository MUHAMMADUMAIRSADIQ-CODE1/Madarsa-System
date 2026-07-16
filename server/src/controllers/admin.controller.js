const { ApiResponse, asyncHandler } = require('../utils');
const {
  UserService,
  SettingService,
  AuditService,
  AdminService,
} = require('../services');
const User = require('../models/User.model');
const CmsContent = require('../models/CmsContent.model');

const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalAdmins,
    totalTeachers,
    totalStudents,
    pendingTeachers,
    pendingStudents,
    cmsStats,
    recentAuditLogs,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'admin', isActive: true }),
    User.countDocuments({ role: 'teacher', isActive: true }),
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'teacher', status: 'pending', isActive: true }),
    User.countDocuments({ role: 'student', status: 'pending', isActive: true }),
    CmsContent.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
          },
        },
      },
    ]),
    AuditService.getRecentLogs(10),
  ]);

  res.status(200).json(
    ApiResponse.success('Admin dashboard data fetched successfully', {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        teachers: totalTeachers,
        students: totalStudents,
        pendingTeachers,
        pendingStudents,
        totalPending: pendingTeachers + pendingStudents,
      },
      cms: {
        total: cmsStats[0]?.total || 0,
        published: cmsStats[0]?.published || 0,
      },
      recentActivity: recentAuditLogs.data || [],
    })
  );
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, module, action, userId, startDate, endDate } = req.query;

  const query = {};
  if (module) query.module = module;
  if (action) query.action = action;
  if (userId) query.user = userId;
  if (startDate) query.startDate = startDate;
  if (endDate) query.endDate = endDate;

  const result = await AuditService.getLogs(query, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
  });

  res.status(200).json(
    ApiResponse.success('Audit logs fetched successfully', result)
  );
});

const getAuditLogStats = asyncHandler(async (_req, res) => {
  const stats = await AuditService.getLogStats();

  res.status(200).json(
    ApiResponse.success('Audit log stats fetched successfully', stats)
  );
});

const getPermissions = asyncHandler(async (_req, res) => {
  const { ADMIN_PERMISSIONS, ADMIN_PERMISSION_SCOPES } = require('../constants/cms');

  const permissions = Object.entries(ADMIN_PERMISSION_SCOPES).map(
    ([role, scopes]) => ({
      role,
      scopes,
    })
  );

  res.status(200).json(
    ApiResponse.success('Permissions fetched successfully', {
      roles: Object.values(ADMIN_PERMISSIONS),
      permissions,
    })
  );
});

const updateSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  if (!Array.isArray(settings)) {
    return res.status(400).json({
      success: false,
      message: 'Settings must be an array of { key, value } objects',
    });
  }

  const updatedSettings = await SettingService.updateBulk(settings, req.user.id);

  res.status(200).json(
    ApiResponse.success('Settings updated successfully', updatedSettings)
  );
});

const getSettingsByGroup = asyncHandler(async (req, res) => {
  const { group } = req.params;
  const settings = await SettingService.getGroup(group);

  res.status(200).json(
    ApiResponse.success('Settings fetched successfully', settings)
  );
});

const getPendingUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;
  const result = await AdminService.getPendingUsers({ page, limit, role, search });

  res.status(200).json(
    ApiResponse.success('Pending users fetched successfully', result)
  );
});

const approveUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await AdminService.approveUser(req.user.id, userId);

  AuditService.log({
    user: req.user.id,
    action: 'approve_user',
    module: 'admin',
    resourceId: userId,
    resourceType: 'User',
    description: `Approved user: ${user.email} (${user.role})`,
    metadata: { approvedUser: userId, role: user.role, email: user.email },
  });

  res.status(200).json(
    ApiResponse.success('User approved successfully', user)
  );
});

const rejectUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  const user = await AdminService.rejectUser(req.user.id, userId, reason);

  AuditService.log({
    user: req.user.id,
    action: 'reject_user',
    module: 'admin',
    resourceId: userId,
    resourceType: 'User',
    description: `Rejected user: ${user.email} (${user.role}) - Reason: ${reason || 'Not specified'}`,
    metadata: { rejectedUser: userId, role: user.role, email: user.email, reason: reason || '' },
  });

  res.status(200).json(
    ApiResponse.success('User rejected successfully', user)
  );
});

module.exports = {
  getDashboard,
  getAuditLogs,
  getAuditLogStats,
  getPermissions,
  updateSettings,
  getSettingsByGroup,
  getPendingUsers,
  approveUser,
  rejectUser,
};
