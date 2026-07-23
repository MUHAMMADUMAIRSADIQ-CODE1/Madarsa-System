const BaseService = require('./BaseService');
const Student = require('../models/Student.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

class StudentService extends BaseService {
  constructor() {
    super(Student, 'Student');
    this.searchFields = [
      'studentId', 'studentName', 'fatherName',
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
    // Process selectedCourses into the courses array format
    if (data.selectedCourses && Array.isArray(data.selectedCourses)) {
      const Course = require('../models/Course.model');
      // Validate all course IDs exist
      const validCourses = await Course.find({
        _id: { $in: data.selectedCourses },
        isDeleted: false,
      }).select('_id').lean();

      const validIds = new Set(validCourses.map(c => c._id.toString()));

      // Preserve existing non-pending enrollments (active, completed, dropped)
      // Only update/replace entries with status 'pending'
      const preservedCourses = [];
      const selectedSet = new Set(data.selectedCourses.map(id => id.toString()));

      // Check if the student already has a profile to preserve existing enrollments
      if (id) {
        try {
          const existingProfile = await this.model.findById(id).select('courses').lean();
          if (existingProfile && existingProfile.courses) {
            for (const ec of existingProfile.courses) {
              const cid = ec.course ? ec.course.toString() : null;
              if (cid) {
                if (ec.status === 'pending') {
                  // Only keep pending courses that are still selected
                  if (selectedSet.has(cid)) {
                    preservedCourses.push(ec);
                    selectedSet.delete(cid); // Mark as handled
                  }
                } else {
                  // Preserve non-pending enrollments regardless of selection
                  preservedCourses.push(ec);
                  selectedSet.delete(cid);
                }
              }
            }
          }
        } catch (_) { /* profile may not exist yet */ }
      }

      // Add remaining selected courses as new pending entries
      for (const courseId of selectedSet) {
        if (validIds.has(courseId)) {
          preservedCourses.push({
            course: courseId,
            enrolledAt: new Date(),
            status: 'pending',
          });
        }
      }

      data.courses = preservedCourses;
      delete data.selectedCourses;
    }

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

    // Keep the enrolled count on the Course model in sync
    // This ensures the public courses API returns the real count for all users
    try {
      const Course = require('../models/Course.model');
      await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    } catch (_) {
      // Non-critical: enrolledCount will be corrected on next enrollment
    }

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
