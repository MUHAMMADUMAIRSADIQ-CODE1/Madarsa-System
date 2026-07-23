const Teacher = require('../models/Teacher.model');
const Student = require('../models/Student.model');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const AuditService = require('./audit.service');
const { ApiError } = require('../utils');
const { httpStatus, messages, roles, USER_STATUS } = require('../constants');

class StudentAssignmentService {
  /**
   * Extract course IDs from a student's courses array.
   * Returns array of string IDs.
   */
  _getStudentCourseIds(student) {
    if (!student.courses || !Array.isArray(student.courses)) return [];
    return student.courses
      .filter(c => c.course)
      .map(c => c.course._id ? c.course._id.toString() : c.course.toString());
  }

  /**
   * Extract course IDs from a teacher's assignedCourses array.
   * Returns array of string IDs.
   */
  _getTeacherCourseIds(teacher) {
    if (!teacher.assignedCourses || !Array.isArray(teacher.assignedCourses)) return [];
    return teacher.assignedCourses.map(c => c._id ? c._id.toString() : c.toString());
  }

  /**
   * Check if there's any course overlap between a student's selected courses
   * and a teacher's officially assigned courses.
   * Returns { hasOverlap, overlappingCourseIds, overlappingNames }.
   */
  async _checkCourseOverlap(studentId, teacherId) {
    const [student, teacher] = await Promise.all([
      Student.findById(studentId).select('courses').populate('courses.course', 'title').lean(),
      Teacher.findById(teacherId).select('assignedCourses').populate('assignedCourses', 'title').lean(),
    ]);

    const studentCourseIds = this._getStudentCourseIds(student || {});
    const teacherCourseIds = this._getTeacherCourseIds(teacher || {});

    const teacherCourseIdSet = new Set(teacherCourseIds);
    const overlap = studentCourseIds.filter(id => teacherCourseIdSet.has(id));

    // Build names for the overlapping courses
    const courseMap = {};
    if (student && student.courses) {
      for (const c of student.courses) {
        if (c.course && c.course.title) {
          courseMap[c.course._id.toString()] = c.course.title;
        }
      }
    }
    if (teacher && teacher.assignedCourses) {
      for (const c of teacher.assignedCourses) {
        if (c && c.title) {
          courseMap[c._id.toString()] = c.title;
        }
      }
    }

    return {
      hasOverlap: overlap.length > 0,
      overlappingCourseIds: overlap,
      overlappingNames: overlap.map(id => courseMap[id] || id),
    };
  }

  /**
   * Validate that a user (teacher or student) is eligible for assignment.
   * Must be: Approved (ACTIVE), not blocked, profile verified.
   * Accepts an optional adminId to log blocked attempts.
   */
  async _validateUserForAssignment(userId, expectedRole, adminId = null) {
    const user = await User.findById(userId).lean();

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, `${expectedRole} user not found`);
    }

    if (user.role !== expectedRole) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `User is not a ${expectedRole}`
      );
    }

    if (user.status === USER_STATUS.PENDING) {
      await this._logBlockedAttempt(adminId, userId, expectedRole, 'User is still in pending status');
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot assign: ${expectedRole} is still in pending status`
      );
    }

    if (user.status === USER_STATUS.REJECTED) {
      await this._logBlockedAttempt(adminId, userId, expectedRole, 'User has been rejected');
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot assign: ${expectedRole} has been rejected`
      );
    }

    if (user.status === USER_STATUS.BLOCKED) {
      await this._logBlockedAttempt(adminId, userId, expectedRole, 'User is blocked');
      throw new ApiError(
        httpStatus.FORBIDDEN,
        `Cannot assign: ${expectedRole} is blocked`
      );
    }

    if (!user.isActive) {
      await this._logBlockedAttempt(adminId, userId, expectedRole, 'User is deactivated');
      throw new ApiError(
        httpStatus.FORBIDDEN,
        `Cannot assign: ${expectedRole} is deactivated`
      );
    }

    if (!user.profileComplete) {
      await this._logBlockedAttempt(adminId, userId, expectedRole, 'Profile not completed');
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot assign: ${expectedRole} has not completed their profile`
      );
    }

    if (!user.profileVerified || user.profileVerificationStatus !== 'verified') {
      await this._logBlockedAttempt(adminId, userId, expectedRole, 'Profile not verified');
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot assign: ${expectedRole} profile is not verified`
      );
    }

    return user;
  }

  /**
   * Log a blocked/failed assignment attempt to the audit trail.
   */
  async _logBlockedAttempt(adminId, userId, role, reason) {
    if (!adminId) return;
    try {
      await AuditService.log({
        user: adminId,
        action: 'blocked_assignment_attempt',
        module: 'assignments',
        resourceId: userId,
        resourceType: 'User',
        description: `Blocked assignment attempt for ${role} ${userId}: ${reason}`,
        metadata: { targetUser: userId, targetRole: role, reason, blocked: true },
      });
    } catch {
      // Silently fail - audit logging should not block the main flow
    }
  }

  /**
   * Validate teacher profile exists, is eligible, and has assigned courses.
   */
  async _validateTeacher(teacherId, adminId = null) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }
    await this._validateUserForAssignment(teacher.user || teacherId, roles.TEACHER, adminId);

    // Course-aware: teacher must have official assigned courses
    const courseIds = this._getTeacherCourseIds(teacher);
    if (courseIds.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Teacher has no officially assigned courses. Please assign courses to the teacher first.'
      );
    }

    return teacher;
  }

  /**
   * Validate student profile exists, is eligible, and has selected courses.
   */
  async _validateStudent(studentId, adminId = null) {
    const student = await Student.findById(studentId)
      .populate('courses.course', 'title');
    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);
    }
    await this._validateUserForAssignment(student.user || studentId, roles.STUDENT, adminId);

    // Course-aware: student must have selected at least one course
    const courseIds = this._getStudentCourseIds(student);
    if (courseIds.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Student has not selected any courses. Please ask the student to complete their profile with course selections first.'
      );
    }

    return student;
  }

  /**
   * Assign a single student to a teacher.
   * If student already has a teacher, returns a validation message.
   * Course-aware: validates student's selected courses overlap with teacher's assigned courses.
   */
  async assignStudent(adminId, teacherId, studentId) {
    const [teacher, student] = await Promise.all([
      this._validateTeacher(teacherId, adminId),
      this._validateStudent(studentId, adminId),
    ]);

    // Check course overlap between student's selected courses and teacher's assigned courses
    const overlap = await this._checkCourseOverlap(studentId, teacherId);
    if (!overlap.hasOverlap) {
      const studentCourseIds = this._getStudentCourseIds(student);
      const teacherCourseIds = this._getTeacherCourseIds(teacher);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'None of the student\'s selected courses match this teacher\'s officially assigned courses. ' +
        'A student can only be assigned to a teacher whose courses overlap with the student\'s selections.'
      );
    }

    // Check if student already has a teacher assigned
    if (student.assignedTeacher) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Student already has an assigned teacher. Use reassign to change.'
      );
    }

    // Check if teacher already has this student (prevent duplicates)
    const alreadyAssigned = teacher.assignedStudents.some(
      (s) => s.toString() === studentId
    );
    if (alreadyAssigned) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Student is already assigned to this teacher'
      );
    }

    // Update both references atomically
    await Promise.all([
      Teacher.findByIdAndUpdate(teacherId, {
        $addToSet: { assignedStudents: student._id },
      }),
      Student.findByIdAndUpdate(studentId, {
        assignedTeacher: teacherId,
      }),
    ]);

    // Fetch updated documents
    const [updatedTeacher, updatedStudent] = await Promise.all([
      Teacher.findById(teacherId),
      Student.findById(studentId),
    ]);

    // Audit log
    await AuditService.log({
      user: adminId,
      action: 'assign_student',
      module: 'assignments',
      resourceId: studentId,
      resourceType: 'Student',
      description: `Assigned student ${updatedStudent.studentName || studentId} to teacher ${updatedTeacher.fullName || teacherId}` +
        ` (course overlap: ${overlap.overlappingNames.join(', ')})`,
      metadata: {
        teacherId,
        studentId,
        teacherName: updatedTeacher.fullName,
        studentName: updatedStudent.studentName,
        overlappingCourses: overlap.overlappingCourseIds,
        overlappingCourseNames: overlap.overlappingNames,
      },
    });

    // Increment enrolledCount for each overlapping course
    if (overlap.overlappingCourseIds.length > 0) {
      await Promise.all(
        overlap.overlappingCourseIds.map(courseId =>
          Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } })
        )
      );
    }

    return { teacher: updatedTeacher, student: updatedStudent };
  }

  /**
   * Reassign a student from their current teacher to a new teacher.
   * Automatically removes the student from the previous teacher's list.
   */
  async reassignStudent(adminId, newTeacherId, studentId) {
    const [newTeacher, student] = await Promise.all([
      this._validateTeacher(newTeacherId, adminId),
      this._validateStudent(studentId, adminId),
    ]);

    const previousTeacherId = student.assignedTeacher;

    // If student has a previous teacher, remove from that teacher's list
    if (previousTeacherId) {
      await Teacher.findByIdAndUpdate(previousTeacherId, {
        $pull: { assignedStudents: studentId },
      });
    }

    // Add to new teacher and update student reference atomically
    await Promise.all([
      Teacher.findByIdAndUpdate(newTeacherId, {
        $addToSet: { assignedStudents: student._id },
      }),
      Student.findByIdAndUpdate(studentId, {
        assignedTeacher: newTeacherId,
      }),
    ]);

    // Fetch updated documents
    const [updatedTeacher, updatedStudent] = await Promise.all([
      Teacher.findById(newTeacherId),
      Student.findById(studentId),
    ]);

    // Audit log
    await AuditService.log({
      user: adminId,
      action: 'reassign_student',
      module: 'assignments',
      resourceId: studentId,
      resourceType: 'Student',
      description: previousTeacherId
        ? `Reassigned student ${updatedStudent.studentName || studentId} to teacher ${updatedTeacher.fullName || newTeacherId}`
        : `Assigned student ${updatedStudent.studentName || studentId} to teacher ${updatedTeacher.fullName || newTeacherId}`,
      metadata: {
        previousTeacherId: previousTeacherId ? previousTeacherId.toString() : null,
        newTeacherId,
        studentId,
        newTeacherName: updatedTeacher.fullName,
        studentName: updatedStudent.studentName,
      },
    });

    return { teacher: updatedTeacher, student: updatedStudent, previousTeacherId };
  }

  /**
   * Remove a student from a teacher's assignment.
   * Sets student.assignedTeacher to null.
   * Removes student ID from teacher.assignedStudents.
   */
  async removeStudent(adminId, teacherId, studentId) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }

    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);
    }

    // Verify the student is actually assigned to this teacher
    if (!student.assignedTeacher || student.assignedTeacher.toString() !== teacherId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Student is not assigned to this teacher'
      );
    }

    // Use atomic operations for both updates
    await Promise.all([
      Teacher.findByIdAndUpdate(teacherId, {
        $pull: { assignedStudents: studentId },
      }),
      Student.findByIdAndUpdate(studentId, {
        assignedTeacher: null,
      }),
    ]);

    // Audit log
    await AuditService.log({
      user: adminId,
      action: 'remove_student',
      module: 'assignments',
      resourceId: studentId,
      resourceType: 'Student',
      description: `Removed student ${student.studentName || studentId} from teacher ${teacher.fullName || teacherId}`,
      metadata: {
        teacherId,
        studentId,
        teacherName: teacher.fullName,
        studentName: student.studentName,
      },
    });

    // Decrement enrolledCount for each course the student was enrolled in
    try {
      const fullStudent = await Student.findById(studentId).populate('courses.course', '_id').lean();
      if (fullStudent && fullStudent.courses) {
        const studentCourseIds = fullStudent.courses
          .filter(c => c.course)
          .map(c => c.course._id.toString());
        if (studentCourseIds.length > 0) {
          await Promise.all(
            studentCourseIds.map(courseId =>
              Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: -1 } })
            )
          );
        }
      }
    } catch {
      // Silently skip — non-critical
    }

    return { teacher, student };
  }

  /**
   * Bulk assign multiple students to a teacher.
   * Returns results for each student (success/failure).
   * Course-aware: validates course overlap for each student.
   * Uses batch atomic operations for performance.
   */
  async bulkAssignStudents(adminId, teacherId, studentIds) {
    const teacher = await this._validateTeacher(teacherId, adminId);

    const teacherCourseIds = this._getTeacherCourseIds(teacher);

    const results = {
      assigned: [],
      alreadyAssigned: [],
      noCourseOverlap: [],
      failed: [],
      skipped: [],
    };

    // Pre-fetch teacher data once
    const existingSet = new Set(
      (teacher.assignedStudents || []).map((s) => s.toString())
    );

    // Process each student
    for (const studentId of studentIds) {
      try {
        const student = await Student.findById(studentId)
          .select('studentName assignedTeacher user')
          .populate('courses.course', 'title')
          .lean();

        if (!student) {
          results.failed.push({ studentId, reason: 'Student not found' });
          continue;
        }

        // Validate student user eligibility
        try {
          await this._validateUserForAssignment(student.user || studentId, roles.STUDENT, adminId);
        } catch (validationError) {
          results.skipped.push({
            studentId,
            studentName: student.studentName,
            reason: validationError.message,
          });
          continue;
        }

        // Course-aware: check course overlap
        const studentCourseIds = this._getStudentCourseIds(student);
        if (studentCourseIds.length === 0) {
          results.skipped.push({
            studentId,
            studentName: student.studentName,
            reason: 'Student has not selected any courses',
          });
          continue;
        }

        const overlap = studentCourseIds.filter(id => teacherCourseIds.includes(id));
        if (overlap.length === 0) {
          results.noCourseOverlap.push({
            studentId,
            studentName: student.studentName,
          });
          continue;
        }

        if (student.assignedTeacher) {
          results.alreadyAssigned.push({
            studentId,
            studentName: student.studentName,
            currentTeacherId: student.assignedTeacher,
          });
          continue;
        }

        if (existingSet.has(studentId.toString())) {
          results.alreadyAssigned.push({
            studentId,
            studentName: student.studentName,
            reason: 'Already in teacher list',
          });
          continue;
        }

        // Mark as to-be-assigned
        existingSet.add(studentId.toString());
        results.assigned.push({
          studentId,
          studentName: student.studentName,
        });
      } catch (error) {
        results.failed.push({
          studentId,
          reason: error.message,
        });
      }
    }

    // Track per-course enrollment counts for bulk assign
    const courseEnrollCounts = {};
    for (const courseId of teacherCourseIds) {
      courseEnrollCounts[courseId] = 0;
    }

    // Batch update all students and teacher in single atomic operations
    if (results.assigned.length > 0) {
      const assignedIds = results.assigned.map((r) => r.studentId);

      // Count how many assigned students have each overlapping course
      for (const r of results.assigned) {
        try {
          const s = await Student.findById(r.studentId)
            .select('courses')
            .populate('courses.course', '_id')
            .lean();
          if (s && s.courses) {
            const studentCourseIds = s.courses
              .filter(c => c.course)
              .map(c => c.course._id.toString());
            for (const scId of studentCourseIds) {
              if (courseEnrollCounts[scId] !== undefined) {
                courseEnrollCounts[scId]++;
              }
            }
          }
        } catch {
          // Silently skip — non-critical for enrolled count
        }
      }

      await Promise.all([
        Teacher.findByIdAndUpdate(teacherId, {
          $addToSet: { assignedStudents: { $each: assignedIds } },
        }),
        Student.updateMany(
          { _id: { $in: assignedIds } },
          { assignedTeacher: teacherId }
        ),
        // Increment enrolledCount for each course
        ...Object.entries(courseEnrollCounts)
          .filter(([_, count]) => count > 0)
          .map(([courseId, count]) =>
            Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: count } })
          ),
      ]);
    }

    // Audit log
    await AuditService.log({
      user: adminId,
      action: 'bulk_assign_students',
      module: 'assignments',
      resourceId: teacherId,
      resourceType: 'Teacher',
      description: `Bulk assigned ${results.assigned.length} students to teacher` +
        (results.noCourseOverlap.length > 0
          ? ` (${results.noCourseOverlap.length} skipped due to no course overlap)`
          : ''),
      metadata: {
        teacherId,
        totalRequested: studentIds.length,
        totalAssigned: results.assigned.length,
        alreadyAssigned: results.alreadyAssigned.length,
        noCourseOverlap: results.noCourseOverlap.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      },
    });

    return {
      teacherId,
      totalRequested: studentIds.length,
      totalAssigned: results.assigned.length,
      results,
    };
  }

  /**
   * Get all students assigned to a teacher with populated data.
   */
  async getAssignedStudents(teacherId, query = {}) {
    // Support both Teacher._id and User._id references
    let teacher = await Teacher.findById(teacherId)
      .populate({
        path: 'assignedStudents',
        populate: { path: 'user' },
      });

    // Fallback: look up by user field if direct _id didn't match (User._id vs Teacher._id)
    if (!teacher) {
      teacher = await Teacher.findOne({ user: teacherId })
        .populate({
          path: 'assignedStudents',
          populate: { path: 'user' },
        });
    }

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }

    let students = teacher.assignedStudents || [];

    // DEBUG: Log first student's user fields to verify populate
    if (students.length > 0) {
      const firstStudent = students[0];
      const userFields = firstStudent.user ? Object.keys(firstStudent.user.toObject ? firstStudent.user.toObject() : firstStudent.user) : 'NO USER OBJECT';
      console.log('[DEBUG getAssignedStudents] First student user keys:', userFields);
      console.log('[DEBUG getAssignedStudents] First student user.status:', firstStudent.user?.status);
      console.log('[DEBUG getAssignedStudents] First student user.profileVerificationStatus:', firstStudent.user?.profileVerificationStatus);
      console.log('[DEBUG getAssignedStudents] First student user.completionPercentage:', firstStudent.user?.completionPercentage);
      console.log('[DEBUG getAssignedStudents] First student user.profileComplete:', firstStudent.user?.profileComplete);
    }

    // Filter by search query
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      students = students.filter(
        (s) =>
          regex.test(s.studentName) ||
          regex.test(s.email) ||
          regex.test(s.studentId) ||
          regex.test(s.phone)
      );
    }

    // Filter by status
    if (query.status) {
      students = students.filter((s) => s.status === query.status);
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;
    const total = students.length;

    return {
      teacherId: teacher._id,
      teacherName: teacher.fullName,
      students: students.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get the assigned teacher for a student.
   */
  async getAssignedTeacher(studentId) {
    const student = await Student.findById(studentId)
      .populate('assignedTeacher');

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);
    }

    return {
      studentId: student._id,
      studentName: student.studentName,
      assignedTeacher: student.assignedTeacher || null,
    };
  }

  /**
   * Get eligible students for a specific teacher based on course overlap.
   * Returns only students whose selected courses overlap with the teacher's assigned courses.
   */
  async getEligibleStudentsForTeacher(teacherId, query = {}) {
    const teacher = await Teacher.findById(teacherId)
      .select('assignedCourses')
      .lean();

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }

    const teacherCourseIds = this._getTeacherCourseIds(teacher);
    if (teacherCourseIds.length === 0) {
      return { students: [], total: 0, message: 'Teacher has no assigned courses' };
    }

    // Find students whose courses overlap with teacher's courses
    // AND who are not already assigned to a teacher
    const filter = {
      isDeleted: false,
      assignedTeacher: null,
      'courses.course': { $in: teacherCourseIds },
    };

    // Search filter
    if (query.search) {
      filter.$or = [
        { studentName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { studentId: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Status filter
    if (query.status) {
      filter.status = query.status;
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('courses.course', 'title slug')
        .populate('user', 'status profileVerified profileVerificationStatus profileComplete')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Student.countDocuments(filter),
    ]);

    // Filter by user eligibility (approved, verified, active, not blocked, profile complete)
    const eligibleStudents = students.filter((s) => {
      const user = s.user || {};
      return (
        user.status === 'active' &&
        user.isActive !== false &&
        user.profileVerified &&
        user.profileVerificationStatus === 'verified' &&
        user.profileComplete
      );
    });

    return {
      students: eligibleStudents,
      total: eligibleStudents.length,
      teacherId: teacher._id,
      teacherCourseIds,
    };
  }

  /**
   * Get eligible teachers for a specific student based on course overlap.
   * Returns only teachers whose assigned courses overlap with the student's selected courses.
   */
  async getEligibleTeachersForStudent(studentId, query = {}) {
    const student = await Student.findById(studentId)
      .select('courses')
      .populate('courses.course', 'title')
      .lean();

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);
    }

    const studentCourseIds = this._getStudentCourseIds(student);
    if (studentCourseIds.length === 0) {
      return { teachers: [], total: 0, message: 'Student has not selected any courses' };
    }

    // Find teachers whose assigned courses overlap with student's courses
    const filter = {
      isDeleted: false,
      'assignedCourses.0': { $exists: true },
      assignedCourses: { $in: studentCourseIds },
    };

    if (query.search) {
      filter.$or = [
        { fullName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { qualification: { $regex: query.search, $options: 'i' } },
        { specialization: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .populate('assignedCourses', 'title slug')
        .populate('user', 'status profileVerified profileVerificationStatus profileComplete')
        .skip(skip)
        .limit(limit)
        .sort({ fullName: 1 })
        .lean(),
      Teacher.countDocuments(filter),
    ]);

    // Filter by user eligibility (approved, verified, active, not blocked, profile complete)
    const eligibleTeachers = teachers.filter((t) => {
      const user = t.user || {};
      return (
        user.status === 'active' &&
        user.isActive !== false &&
        user.profileVerified &&
        user.profileVerificationStatus === 'verified' &&
        user.profileComplete
      );
    });

    return {
      teachers: eligibleTeachers,
      total: eligibleTeachers.length,
      studentId: student._id,
      studentCourseIds,
    };
  }

  /**
   * Get summary of all teacher-student assignments.
   * Course-aware: includes stats about courses and assignments.
   */
  async getAssignmentSummary() {
    const [
      totalTeachersWithStudents,
      totalAssignedStudents,
      totalUnassignedStudents,
      teachersWithCourses,
      teachersWithoutCourses,
      studentsWithCourses,
      studentsWithoutCourses,
      totalCourseAssignedStudents,
    ] = await Promise.all([
      Teacher.countDocuments({
        'assignedStudents.0': { $exists: true },
        isDeleted: false,
      }),
      Student.countDocuments({
        assignedTeacher: { $ne: null },
        isDeleted: false,
      }),
      Student.countDocuments({
        assignedTeacher: null,
        isDeleted: false,
      }),
      Teacher.countDocuments({
        'assignedCourses.0': { $exists: true },
        isDeleted: false,
      }),
      Teacher.countDocuments({
        $or: [
          { assignedCourses: { $size: 0 } },
          { assignedCourses: { $exists: false } },
        ],
        isDeleted: false,
      }),
      // Students who have selected at least one course
      Student.countDocuments({
        'courses.0': { $exists: true },
        isDeleted: false,
      }),
      // Students who haven't selected any courses
      Student.countDocuments({
        $or: [
          { courses: { $size: 0 } },
          { courses: { $exists: false } },
        ],
        isDeleted: false,
      }),
      // Students waiting for assignment (no teacher, but have courses selected)
      Student.countDocuments({
        assignedTeacher: null,
        'courses.0': { $exists: true },
        isDeleted: false,
      }),
    ]);

    // Get top teachers by student count
    const topTeachers = await Teacher.find({
      'assignedStudents.0': { $exists: true },
      isDeleted: false,
    })
      .select('fullName assignedStudents')
      .sort({ assignedStudents: -1 })
      .limit(10)
      .lean();

    const teacherAssignments = topTeachers.map((t) => ({
      teacherId: t._id,
      teacherName: t.fullName,
      totalStudents: (t.assignedStudents || []).length,
    }));

    return {
      totalTeachersWithStudents,
      totalAssignedStudents,
      totalUnassignedStudents,
      totalStudents: totalAssignedStudents + totalUnassignedStudents,
      topTeachers: teacherAssignments,
      // Course-aware stats
      teachersWithCourses,
      teachersWithoutCourses,
      studentsWithCourses,
      studentsWithoutCourses,
      studentsWaitingForAssignment: totalCourseAssignedStudents,
    };
  }

  /**
   * Check if a teacher has any assigned students.
   * Used before allowing teacher deletion.
   */
  async teacherHasAssignedStudents(teacherId) {
    const teacher = await Teacher.findById(teacherId).select('assignedStudents');
    if (!teacher) return false;
    return (teacher.assignedStudents || []).length > 0;
  }

  /**
   * Get assigned student counts for multiple teachers in a single query.
   * Returns a map of teacherId -> count.
   */
  async getTeacherAssignmentCounts(teacherIds) {
    const teachers = await Teacher.find({ _id: { $in: teacherIds } })
      .select('assignedStudents fullName')
      .lean();

    const counts = {};
    teachers.forEach((t) => {
      counts[t._id.toString()] = (t.assignedStudents || []).length;
    });

    return counts;
  }

  /**
   * Remove assignment reference when a student is deleted.
   * Uses atomic $pull to avoid double-save on the student document.
   */
  async removeAssignmentOnStudentDelete(studentId) {
    const student = await Student.findById(studentId).populate('courses.course', '_id').lean();
    if (!student) return;

    const teacherId = student.assignedTeacher;

    // Atomic operations - remove teacher/student references first
    if (teacherId) {
      await Promise.all([
        Teacher.findByIdAndUpdate(teacherId, {
          $pull: { assignedStudents: studentId },
        }),
        Student.findByIdAndUpdate(studentId, {
          assignedTeacher: null,
        }),
      ]);
    }

    // Then decrement enrolledCount for each course (non-critical)
    if (student.courses) {
      const studentCourseIds = student.courses
        .filter(c => c.course)
        .map(c => c.course._id.toString());
      if (studentCourseIds.length > 0) {
        Promise.all(
          studentCourseIds.map(courseId =>
            Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: -1 } })
          )
        ).catch(() => {});
      }
    }
  }
}

module.exports = new StudentAssignmentService();
