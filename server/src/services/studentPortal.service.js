const Student = require('../models/Student.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

const ALLOWED_UPDATE_FIELDS = [
  'phone', 'whatsapp', 'address', 'city', 'country', 'guardianPhone',
  'guardianEmail', 'preferredBatch', 'preferredTiming', 'notes',
  'studentPhoto', 'studentName', 'fatherName',
  'dateOfBirth', 'gender', 'nationality',
  'postalCode', 'emergencyContact',
  'emergencyPhone', 'previousEducation', 'currentQualification',
  'bio', 'languages', 'skills', 'cnicPassport',
  'socialLinks', 'guardianRelation',
  'selectedCourses',
];

class StudentPortalService {
  async getProfileByEmail(email) {
    const student = await Student.findOne({ email, isDeleted: false })
      .populate('selectedCourse', 'title slug')
      .populate('courses.course', 'title slug')
      .lean();

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Student profile not found');
    }

    return student;
  }

  async getProfileById(id) {
    const student = await Student.findOne({ _id: id, isDeleted: false })
      .populate('selectedCourse', 'title slug')
      .populate('courses.course', 'title slug')
      .lean();

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);
    }

    return student;
  }

  async updateProfile(id, data, userId) {
    const updateData = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    updateData.updatedBy = userId;

    // Process selectedCourses into the courses array format
    if (data.selectedCourses && Array.isArray(data.selectedCourses)) {
      const Course = require('../models/Course.model');
      // Validate all course IDs exist
      const validCourses = await Course.find({
        _id: { $in: data.selectedCourses },
        isDeleted: false,
      }).select('_id').lean();

      const validIds = new Set(validCourses.map(c => c._id.toString()));
      const invalidIds = data.selectedCourses.filter(
        id => !validIds.has(id.toString())
      );

      if (invalidIds.length > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid or deleted courses: ${invalidIds.join(', ')}`);
      }

      // Preserve existing non-pending enrollments (active, completed, dropped)
      // Only update/replace entries with status 'pending'
      const preservedCourses = [];
      const selectedSet = new Set(data.selectedCourses.map(id => id.toString()));

      // First, check if the student already has a profile to preserve existing enrollments
      if (id) {
        try {
          const existingProfile = await Student.findById(id).select('courses').lean();
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
                  // If deselected, drop the pending entry
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
        preservedCourses.push({
          course: courseId,
          enrolledAt: new Date(),
          status: 'pending',
        });
      }

      updateData.courses = preservedCourses;
      delete updateData.selectedCourses;
    }

    const student = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('selectedCourse', 'title slug');

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);
    }

    return student;
  }

  async getDashboardData(studentId) {
    console.log('\n======== DIAGNOSTIC: studentPortal.getDashboardData ========');
    console.log('Student ID received:', studentId);

    // Support both Student._id and User._id references
    let student = await Student.findById(studentId)
      .populate('selectedCourse', 'title slug')
      .populate('courses.course', 'title slug')
      .populate({
        path: 'assignedTeacher',
        select: 'fullName profilePhoto qualification specialization subjects experience email phone availability shortBio teachingLanguages officeAddress emergencyContact emergencyPhone teachingMode',
      })
      .lean();

    console.log('Direct lookup by _id found:', !!student);

    // Fallback: look up by user field if direct _id didn't match (User._id vs Student._id)
    if (!student) {
      student = await Student.findOne({ user: studentId, isDeleted: false })
        .populate('selectedCourse', 'title slug')
        .populate('courses.course', 'title slug')
        .populate({
          path: 'assignedTeacher',
          select: 'fullName profilePhoto qualification specialization subjects experience email phone availability shortBio teachingLanguages officeAddress emergencyContact emergencyPhone teachingMode',
        })
        .lean();
      console.log('Fallback lookup by user field found:', !!student);
    }

    if (!student) {
      console.log('STUDENT NOT FOUND - throwing error');
      throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);
    }

    console.log('Student name:', student.studentName);
    console.log('Student email:', student.email);
    console.log('Student assignedTeacher raw:', JSON.stringify(student.assignedTeacher));
    console.log('Student courses count:', (student.courses || []).length);
    console.log('Student courses raw:', JSON.stringify(student.courses));
    console.log('Student selectedCourse raw:', JSON.stringify(student.selectedCourse));
    
    if (student.assignedTeacher) {
      console.log('assignedTeacher ID:', student.assignedTeacher._id?.toString() || student.assignedTeacher.toString());
      console.log('assignedTeacher fullName:', student.assignedTeacher.fullName);
      console.log('assignedTeacher keys:', Object.keys(student.assignedTeacher));
    } else {
      console.log('assignedTeacher is NULL or missing');
    }

    const responseData = {
      profile: {
        studentId: student.studentId,
        studentName: student.studentName,
        gender: student.gender,
        email: student.email,
        phone: student.phone,
        country: student.country,
        city: student.city,
        enrollmentDate: student.enrollmentDate,
        status: student.status,
        learningMode: student.learningMode,
        selectedCourse: student.selectedCourse,
        studentPhoto: student.studentPhoto,
        _id: student._id,
      },
      assignedTeacher: student.assignedTeacher || null,
      courses: student.courses || [],
      attendanceSummary: student.attendanceSummary || { totalClasses: 0, attended: 0, percentage: 0 },
    };

    console.log('Response data structure:', JSON.stringify({
      hasAssignedTeacher: responseData.assignedTeacher !== null,
      assignedTeacherType: typeof responseData.assignedTeacher,
      coursesCount: responseData.courses.length,
      profileKeys: Object.keys(responseData.profile)
    }));
    console.log('========================================================\n');

    return responseData;
  }
}

module.exports = new StudentPortalService();
