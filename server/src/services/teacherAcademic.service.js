const Teacher = require('../models/Teacher.model');
const Course = require('../models/Course.model');
const Student = require('../models/Student.model');
const Result = require('../models/Result.model');
const TeacherAnnouncement = require('../models/TeacherAnnouncement.model');
const { TeacherConversation, TeacherMessage } = require('../models/TeacherMessage.model');
const Notification = require('../models/Notification.model');
const Attendance = require('../models/Attendance.model');
const Assignment = require('../models/Assignment.model');
const User = require('../models/User.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

class TeacherAcademicService {
  // =================== RESULTS / GRADEBOOK ===================

  async getResults(teacherId, query = {}) {
    const filter = { teacher: teacherId, isDeleted: false };
    if (query.course) filter.course = query.course;
    if (query.student) filter.student = query.student;
    if (query.status) filter.status = query.status;
    if (query.examName) filter.examName = { $regex: query.examName, $options: 'i' };

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      Result.find(filter)
        .populate('student', 'studentName studentId studentPhoto')
        .populate('course', 'title slug code')
        .sort({ examDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Result.countDocuments(filter),
    ]);

    return { results, total, page, limit };
  }

  async createResult(data, userId) {
    const result = await Result.create({ ...data, createdBy: userId });
    return result.populate(['student', 'course']);
  }

  async updateResult(id, data, userId) {
    const result = await Result.findOne({ _id: id, isDeleted: false });
    if (!result) throw new ApiError(httpStatus.NOT_FOUND, 'Result not found');

    const allowedFields = ['obtainedMarks', 'totalMarks', 'examName', 'examDate', 'remarks', 'status'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) result[field] = data[field];
    }
    result.updatedBy = userId;
    await result.save();
    return result.populate(['student', 'course']);
  }

  async deleteResult(id, teacherId) {
    const result = await Result.findOne({ _id: id, teacher: teacherId, isDeleted: false });
    if (!result) throw new ApiError(httpStatus.NOT_FOUND, 'Result not found');
    result.isDeleted = true;
    result.deletedAt = new Date();
    await result.save();
    return result;
  }

  async publishResult(id, teacherId) {
    const result = await Result.findOne({ _id: id, teacher: teacherId, isDeleted: false });
    if (!result) throw new ApiError(httpStatus.NOT_FOUND, 'Result not found');
    result.status = 'published';
    result.publishedAt = new Date();
    await result.save();
    return result.populate(['student', 'course']);
  }

  // =================== ANNOUNCEMENTS ===================

  async getAnnouncements(teacherId, query = {}) {
    const filter = { teacher: teacherId, isDeleted: false };
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    if (query.isPublished === 'true') filter.isPublished = true;
    if (query.isPublished === 'false') filter.isPublished = false;
    if (query.targetType) filter.targetType = query.targetType;
    if (query.course) filter.targetCourse = query.course;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      TeacherAnnouncement.find(filter)
        .populate('targetCourse', 'title slug code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TeacherAnnouncement.countDocuments(filter),
    ]);

    return { announcements, total, page, limit };
  }

  async createAnnouncement(data, userId) {
    const announcement = await TeacherAnnouncement.create({
      ...data,
      createdBy: userId,
      publishedAt: data.isPublished !== false ? new Date() : undefined,
    });
    return announcement.populate('targetCourse', 'title slug code');
  }

  async updateAnnouncement(id, data, userId) {
    const announcement = await TeacherAnnouncement.findOne({ _id: id, isDeleted: false });
    if (!announcement) throw new ApiError(httpStatus.NOT_FOUND, 'Announcement not found');

    const allowedFields = ['title', 'content', 'targetType', 'targetCourse', 'targetBatch', 'priority', 'isPublished', 'attachments'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) announcement[field] = data[field];
    }
    announcement.updatedBy = userId;
    if (data.isPublished && !announcement.publishedAt) announcement.publishedAt = new Date();
    await announcement.save();
    return announcement.populate('targetCourse', 'title slug code');
  }

  async deleteAnnouncement(id, teacherId) {
    const announcement = await TeacherAnnouncement.findOne({ _id: id, teacher: teacherId, isDeleted: false });
    if (!announcement) throw new ApiError(httpStatus.NOT_FOUND, 'Announcement not found');
    announcement.isDeleted = true;
    announcement.deletedAt = new Date();
    await announcement.save();
    return announcement;
  }

  async getStudentAnnouncements(studentId) {
    const student = await Student.findById(studentId).lean();
    if (!student) throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);

    const courseIds = (student.courses || []).map(c => c.course).filter(Boolean);
    const filter = {
      isPublished: true,
      isDeleted: false,
      $or: [
        { targetType: 'all' },
        { targetCourse: { $in: courseIds } },
        { targetBatch: student.preferredBatch },
      ],
    };

    return TeacherAnnouncement.find(filter)
      .populate('teacher', 'fullName')
      .populate('targetCourse', 'title')
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();
  }

  // =================== MESSAGES ===================

  async getConversations(teacherId, query = {}) {
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);

    const filter = { participants: { $elemMatch: { user: teacher.user } }, isActive: true };

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      TeacherConversation.find(filter)
        .populate('participants.user', 'fullName email role profilePhoto')
        .sort({ 'lastMessage.sentAt': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TeacherConversation.countDocuments(filter),
    ]);

    // Get unread counts
    const convIds = conversations.map(c => c._id);
    const unreadCounts = await TeacherMessage.aggregate([
      { $match: { conversation: { $in: convIds }, isRead: false, isDeleted: false } },
      { $group: { _id: '$conversation', count: { $sum: 1 } } },
    ]);

    const unreadMap = {};
    unreadCounts.forEach(u => { unreadMap[u._id.toString()] = u.count; });

    return {
      conversations: conversations.map(c => ({
        ...c,
        unreadCount: unreadMap[c._id.toString()] || 0,
      })),
      total, page, limit,
    };
  }

  async getMessages(conversationId, teacherId, query = {}) {
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);

    const conversation = await TeacherConversation.findOne({
      _id: conversationId,
      participants: { $elemMatch: { user: teacher.user } },
    });
    if (!conversation) throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      TeacherMessage.find({ conversation: conversationId, isDeleted: false })
        .populate('sender', 'fullName email role profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TeacherMessage.countDocuments({ conversation: conversationId, isDeleted: false }),
    ]);

    // Mark messages as read
    await TeacherMessage.updateMany(
      { conversation: conversationId, isRead: false, sender: { $ne: teacher.user } },
      { isRead: true, readAt: new Date() }
    );

    return {
      messages: messages.reverse(),
      conversation,
      total, page, limit,
    };
  }

  async sendMessage(data, userId) {
    let conversation;
    if (data.conversationId) {
      conversation = await TeacherConversation.findById(data.conversationId);
      if (!conversation) throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
    } else {
      // Create new conversation
      conversation = await TeacherConversation.create({
        participants: [
          { user: userId, role: data.senderRole || 'teacher' },
          { user: data.recipientId, role: data.recipientRole || 'student' },
        ],
        subject: data.subject || '',
        createdBy: userId,
      });
    }

    const message = await TeacherMessage.create({
      conversation: conversation._id,
      sender: userId,
      senderRole: data.senderRole || 'teacher',
      content: data.content,
      attachments: data.attachments || [],
    });

    // Update conversation's last message
    conversation.lastMessage = {
      content: data.content.substring(0, 100),
      sender: userId,
      sentAt: new Date(),
    };
    await conversation.save();

    // Create notification for recipient
    try {
      const recipientUser = conversation.participants.find(
        p => p.user.toString() !== userId.toString()
      );
      if (recipientUser) {
        await Notification.create({
          recipient: recipientUser.user,
          type: 'info',
          title: 'New Message',
          message: data.content.substring(0, 200),
          link: data.senderRole === 'teacher' ? '/student/messages' : '/teacher/messages',
        });
      }
    } catch (_) { /* ignore notification errors */ }

    return message.populate('sender', 'fullName email role profilePhoto');
  }

  async deleteConversation(conversationId, teacherId) {
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);

    const conversation = await TeacherConversation.findOne({
      _id: conversationId,
      participants: { $elemMatch: { user: teacher.user } },
    });
    if (!conversation) throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');

    conversation.isActive = false;
    await conversation.save();
    return { message: 'Conversation deleted' };
  }

  // =================== NOTIFICATIONS ===================

  async getNotifications(userId, query = {}) {
    const filter = { recipient: userId };
    if (query.unreadOnly === 'true') filter.isRead = false;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    return { notifications, unreadCount, total, page, limit };
  }

  async markNotificationRead(notificationId, userId) {
    const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
    if (!notification) throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    return notification;
  }

  async markAllNotificationsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }

  async createNotification(data) {
    return Notification.create(data);
  }

  // =================== DASHBOARD ANALYTICS ===================

  async getDashboardAnalytics(teacherId) {
    const teacher = await Teacher.findById(teacherId).select('assignedCourses user').lean();
    if (!teacher) throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);

    const courseIds = teacher.assignedCourses || [];
    const userId = teacher.user;

    const [
      courseCount,
      studentCount,
      attendanceStats,
      assignmentCount,
      upcomingClassesCount,
      announcementCount,
      unreadMessages,
      unreadNotifications,
    ] = await Promise.all([
      courseIds.length,
      courseIds.length > 0
        ? Student.countDocuments({ 'courses.course': { $in: courseIds }, isDeleted: false, status: 'active' })
        : 0,
      Attendance.getStats ? Attendance.getStats({ teacher: teacherId }) : Promise.resolve({ total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 }),
      Assignment.countDocuments({ teacher: teacherId }),
      LiveClass.countDocuments({ teacher: teacherId, scheduledAt: { $gte: new Date() }, status: { $ne: 'cancelled' } }),
      TeacherAnnouncement.countDocuments({ teacher: teacherId, isDeleted: false }),
      TeacherConversation.countDocuments({ participants: { $elemMatch: { user: userId } }, 'lastMessage.sentAt': { $ne: null } }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    const attendanceAgg = await Attendance.aggregate([
      { $match: { teacher: teacherId, isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        },
      },
    ]);
    const att = attendanceAgg[0] || { total: 0, present: 0, absent: 0, late: 0 };
    const attendancePercentage = att.total > 0 ? Math.round(((att.present + att.late) / att.total) * 100) : 0;

    return {
      totalCourses: courseCount,
      totalStudents: studentCount,
      attendancePercentage,
      totalAssignments: assignmentCount,
      upcomingClasses: upcomingClassesCount,
      totalAnnouncements: announcementCount,
      unreadMessages: unreadMessages > 0 ? 1 : 0,
      unreadNotifications,
    };
  }
}

// Need LiveClass for the dashboard analytics query
const LiveClass = require('../models/LiveClass.model');

module.exports = new TeacherAcademicService();
