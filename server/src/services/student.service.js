const BaseService = require('./BaseService');
const Student = require('../models/Student.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

class StudentService extends BaseService {
  constructor() {
    super(Student, 'Student');
    this.searchFields = [
      'studentId', 'studentName', 'fatherName', 'guardianName',
      'email', 'phone', 'country', 'rollNumber', 'enrollmentNumber',
    ];
  }

  async generateStudentId() {
    const year = new Date().getFullYear();
    const prefix = `STU-${year}-`;

    const lastStudent = await this.model
      .findOne({ studentId: { $regex: `^${prefix}` } })
      .sort({ studentId: -1 })
      .lean();

    let nextNum = 1;
    if (lastStudent && lastStudent.studentId) {
      const parts = lastStudent.studentId.split('-');
      nextNum = parseInt(parts[parts.length - 1], 10) + 1;
    }

    return `${prefix}${String(nextNum).padStart(6, '0')}`;
  }

  async create(data) {
    data.studentId = await this.generateStudentId();
    return super.create(data);
  }

  async update(id, data, options = {}) {
    return super.update(id, data, options);
  }

  async softDeleteStudent(id, userId) {
    const student = await this.getById(id);

    // Auto-remove assignment reference when student is deleted
    const StudentAssignmentService = require('./studentAssignment.service');
    await StudentAssignmentService.removeAssignmentOnStudentDelete(id);

    student.isDeleted = true;
    student.deletedAt = new Date();
    student.updatedBy = userId;
    return student.save();
  }

  async restoreStudent(id, userId) {
    const student = await this.model.findOne({ _id: id, isDeleted: true });
    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Deleted student not found');
    }
    student.isDeleted = false;
    student.deletedAt = null;
    student.updatedBy = userId;
    return student.save();
  }

  async activateStudent(id, userId) {
    const student = await this.getById(id);
    student.status = 'active';
    student.updatedBy = userId;
    return student.save();
  }

  async deactivateStudent(id, userId) {
    const student = await this.getById(id);
    student.status = 'inactive';
    student.updatedBy = userId;
    return student.save();
  }

  async archiveStudent(id, userId) {
    const student = await this.getById(id);
    student.status = 'inactive';
    student.updatedBy = userId;
    return student.save();
  }

  async enrollInCourse(studentId, courseId) {
    const student = await this.getById(studentId);

    const alreadyEnrolled = student.courses.some(
      (c) => c.course.toString() === courseId
    );

    if (alreadyEnrolled) {
      throw new ApiError(httpStatus.CONFLICT, messages.STUDENT_ALREADY_ENROLLED);
    }

    student.courses.push({
      course: courseId,
      enrolledAt: new Date(),
      status: 'active',
    });

    await student.save();
    return student;
  }

  async getEnrolledCourses(studentId) {
    const student = await this.model
      .findById(studentId)
      .populate({
        path: 'courses.course',
        populate: { path: 'teacher' },
      });

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);
    }

    return student.courses;
  }

  async updateAttendanceSummary(studentId) {
    const Attendance = require('../models/Attendance.model');

    const attendanceRecords = await Attendance.aggregate([
      { $match: { 'records.student': studentId } },
      { $unwind: '$records' },
      { $match: { 'records.student': studentId } },
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] },
          },
        },
      },
    ]);

    if (attendanceRecords.length > 0) {
      const { totalClasses, attended } = attendanceRecords[0];
      const percentage = totalClasses > 0
        ? Math.round((attended / totalClasses) * 100)
        : 0;

      await this.update(studentId, {
        'attendanceSummary.totalClasses': totalClasses,
        'attendanceSummary.attended': attended,
        'attendanceSummary.percentage': percentage,
      });
    }
  }

  async getStudentStats() {
    const User = require('../models/User.model');
    const { roles, USER_STATUS } = require('../constants');

    const [total, active, inactive, graduated, suspended, transferred,
      pendingUsers, activeUsers, rejectedUsers, blockedUsers] = await Promise.all([
      this.count({ isDeleted: false }),
      this.count({ status: 'active', isDeleted: false }),
      this.count({ status: 'inactive', isDeleted: false }),
      this.count({ status: 'graduated', isDeleted: false }),
      this.count({ status: 'suspended', isDeleted: false }),
      this.count({ status: 'transferred', isDeleted: false }),
      User.countDocuments({ role: roles.STUDENT, status: USER_STATUS.PENDING }),
      User.countDocuments({ role: roles.STUDENT, status: USER_STATUS.ACTIVE }),
      User.countDocuments({ role: roles.STUDENT, status: USER_STATUS.REJECTED }),
      User.countDocuments({ role: roles.STUDENT, status: USER_STATUS.BLOCKED }),
    ]);

    return { total, active, inactive, graduated, suspended, transferred,
      pendingUsers, activeUsers, rejectedUsers, blockedUsers };
  }
}

module.exports = new StudentService();
