const { ApiResponse, asyncHandler } = require('../utils');
const {
  UserService,
  SettingService,
  AuditService,
  AdminService,
  StudentAssignmentService,
} = require('../services');
const { USER_STATUS } = require('../constants');
const User = require('../models/User.model');
const CmsContent = require('../models/CmsContent.model');

const getDashboard = asyncHandler(async (_req, res) => {
  const Teacher = require('../models/Teacher.model');
  const Student = require('../models/Student.model');
  const Course = require('../models/Course.model');

  // Cache distinct course IDs to avoid duplicate queries
  const teacherAssignedCourseIds = await Teacher.distinct('assignedCourses', {
    isDeleted: false,
    'assignedCourses.0': { $exists: true },
  });
  const studentSelectedCourseIds = await Student.distinct('courses.course', {
    isDeleted: false,
    'courses.0': { $exists: true },
  });

  const [
    totalUsers,
    totalAdmins,
    totalTeachers,
    totalStudents,
    pendingTeachers,
    pendingStudents,
    cmsStats,
    recentAuditLogs,
    courseStats,
    coursesPublished,
    teachersWithCourses,
    teachersWithoutCourses,
    studentsAssigned,
    studentsWaiting,
    coursesWithTeacher,
    coursesWithoutTeacher,
    coursesWithStudent,
    coursesWithoutStudent,
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
    // Course counts
    Course.countDocuments({ isDeleted: false }),
    Course.countDocuments({ isDeleted: false, status: 'published' }),
    // Teacher course assignments
    Teacher.countDocuments({ isDeleted: false, 'assignedCourses.0': { $exists: true } }),
    Teacher.countDocuments({
      isDeleted: false,
      $or: [
        { assignedCourses: { $size: 0 } },
        { assignedCourses: { $exists: false } },
      ],
    }),
    // Student assignments
    Student.countDocuments({ isDeleted: false, assignedTeacher: { $ne: null } }),
    Student.countDocuments({ isDeleted: false, assignedTeacher: null, 'courses.0': { $exists: true } }),
    // Courses with/without teachers (using cached IDs)
    Course.countDocuments({
      isDeleted: false,
      _id: { $in: teacherAssignedCourseIds },
    }),
    Course.countDocuments({
      isDeleted: false,
      _id: { $nin: teacherAssignedCourseIds },
    }),
    // Courses with/without students
    Course.countDocuments({
      isDeleted: false,
      _id: { $in: studentSelectedCourseIds },
    }),
    Course.countDocuments({
      isDeleted: false,
      _id: { $nin: studentSelectedCourseIds },
    }),
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
      courses: {
        total: courseStats,
        active: coursesPublished || 0,
        published: coursesPublished || 0,
        teachersWithCourses,
        teachersWithoutCourses,
        studentsAssigned,
        studentsWaiting,
        coursesWithTeacher,
        coursesWithoutTeacher,
        coursesWithStudent,
        coursesWithoutStudent,
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
  
  // Check user's current status to determine if this is a re-approval
  const currentUser = await User.findById(userId).select('status');
  const isReApproval = currentUser && currentUser.status === USER_STATUS.REJECTED;
  
  const user = await AdminService.approveUser(req.user.id, userId);
  
  const actionType = isReApproval ? 're_approve_user' : 'approve_user';
  const actionLabel = isReApproval ? 'Re-approved' : 'Approved';

  AuditService.log({
    user: req.user.id,
    action: actionType,
    module: 'admin',
    resourceId: userId,
    resourceType: 'User',
    description: `${actionLabel} user: ${user.email} (${user.role})`,
    metadata: { approvedUser: userId, role: user.role, email: user.email, isReApproval },
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

const getRejectedUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;
  const result = await AdminService.getRejectedUsers({ page, limit, role, search });

  res.status(200).json(
    ApiResponse.success('Rejected users fetched successfully', result)
  );
});

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  const user = await AdminService.blockUser(req.user.id, userId, reason);

  res.status(200).json(
    ApiResponse.success('User blocked successfully', user)
  );
});

const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await AdminService.unblockUser(req.user.id, userId);

  res.status(200).json(
    ApiResponse.success('User unblocked successfully', user)
  );
});

const deactivateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  const user = await AdminService.deactivateUser(req.user.id, userId, reason);

  res.status(200).json(
    ApiResponse.success('User deactivated successfully', user)
  );
});

const activateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await AdminService.activateUser(req.user.id, userId);

  res.status(200).json(
    ApiResponse.success('User activated successfully', user)
  );
});

const getPendingProfileVerifications = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;
  const result = await AdminService.getPendingProfileVerifications({ page, limit, role, search });

  res.status(200).json(
    ApiResponse.success('Pending profile verifications fetched successfully', result)
  );
});

const approveProfileVerification = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await AdminService.approveProfileVerification(req.user.id, userId);

  res.status(200).json(
    ApiResponse.success('Profile verified successfully', user)
  );
});

const rejectProfileVerification = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  const user = await AdminService.rejectProfileVerification(req.user.id, userId, reason);

  res.status(200).json(
    ApiResponse.success('Profile verification rejected', user)
  );
});

// =================== ASSIGNMENT MANAGEMENT ===================

const assignStudent = asyncHandler(async (req, res) => {
  const { teacherId, studentId } = req.body;
  const result = await StudentAssignmentService.assignStudent(
    req.user.id,
    teacherId,
    studentId
  );
  res.status(200).json(
    ApiResponse.success('Student assigned to teacher successfully', result)
  );
});

const removeStudent = asyncHandler(async (req, res) => {
  const { teacherId, studentId } = req.body;
  const result = await StudentAssignmentService.removeStudent(
    req.user.id,
    teacherId,
    studentId
  );
  res.status(200).json(
    ApiResponse.success('Student removed from teacher successfully', result)
  );
});

const reassignStudent = asyncHandler(async (req, res) => {
  const { teacherId, studentId } = req.body;
  const result = await StudentAssignmentService.reassignStudent(
    req.user.id,
    teacherId,
    studentId
  );
  res.status(200).json(
    ApiResponse.success('Student reassigned successfully', result)
  );
});

const bulkAssignStudents = asyncHandler(async (req, res) => {
  const { teacherId, studentIds } = req.body;
  const result = await StudentAssignmentService.bulkAssignStudents(
    req.user.id,
    teacherId,
    studentIds
  );
  res.status(200).json(
    ApiResponse.success('Bulk assignment completed', result)
  );
});

const getAssignedStudents = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const result = await StudentAssignmentService.getAssignedStudents(
    teacherId,
    req.query
  );
  res.status(200).json(
    ApiResponse.success('Assigned students fetched successfully', result)
  );
});

const getAssignedTeacher = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const result = await StudentAssignmentService.getAssignedTeacher(studentId);
  res.status(200).json(
    ApiResponse.success('Assigned teacher fetched successfully', result)
  );
});

const getAssignmentSummary = asyncHandler(async (_req, res) => {
  const result = await StudentAssignmentService.getAssignmentSummary();
  res.status(200).json(
    ApiResponse.success('Assignment summary fetched successfully', result)
  );
});

const getTeacherAssignmentCounts = asyncHandler(async (req, res) => {
  console.log('\n======== DIAGNOSTIC: admin.getTeacherAssignmentCounts ========');
  console.log('Request body:', JSON.stringify(req.body));
  const { teacherIds } = req.body;
  console.log('Received teacherIds:', JSON.stringify(teacherIds));

  if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
    console.log('No teacherIds - returning empty');
    return res.status(200).json(
      ApiResponse.success('Teacher assignment counts fetched successfully', {})
    );
  }

  const counts = await StudentAssignmentService.getTeacherAssignmentCounts(teacherIds);
  console.log('Response counts:', JSON.stringify(counts));
  console.log('==========================================================\n');
  
  const response = ApiResponse.success('Teacher assignment counts fetched successfully', counts);
  console.log('Full JSON response:', JSON.stringify(response));
  res.status(200).json(response);
});

// =================== COURSE-AWARE ASSIGNMENT ===================

const getEligibleStudentsForTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const result = await StudentAssignmentService.getEligibleStudentsForTeacher(
    teacherId,
    req.query
  );
  res.status(200).json(
    ApiResponse.success('Eligible students fetched successfully', result)
  );
});

const getEligibleTeachersForStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const result = await StudentAssignmentService.getEligibleTeachersForStudent(
    studentId,
    req.query
  );
  res.status(200).json(
    ApiResponse.success('Eligible teachers fetched successfully', result)
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
  getRejectedUsers,
  blockUser,
  unblockUser,
  deactivateUser,
  activateUser,
  getPendingProfileVerifications,
  approveProfileVerification,
  rejectProfileVerification,
  // Assignment management
  assignStudent,
  removeStudent,
  reassignStudent,
  bulkAssignStudents,
  getAssignedStudents,
  getAssignedTeacher,
  getAssignmentSummary,
  getTeacherAssignmentCounts,
  getEligibleStudentsForTeacher,
  getEligibleTeachersForStudent,
};
