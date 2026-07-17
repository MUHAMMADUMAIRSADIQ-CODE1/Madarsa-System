const Student = require('../models/Student.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

const ALLOWED_UPDATE_FIELDS = [
  'phone', 'whatsapp', 'address', 'city', 'country', 'guardianPhone',
  'guardianEmail', 'preferredBatch', 'preferredTiming', 'notes',
  'studentPhoto', 'studentName', 'fatherName', 'motherName',
  'guardianName', 'dateOfBirth', 'gender', 'nationality',
  'religion', 'bloodGroup', 'postalCode', 'emergencyContact',
  'emergencyPhone', 'previousEducation', 'currentQualification',
  'bio', 'languages', 'skills', 'cnicPassport', 'cnicFront',
  'cnicBack', 'passport', 'socialLinks', 'guardianRelation',
  'educationalCertificates', 'additionalDocuments',
];

class StudentPortalService {
  async getProfileByEmail(email) {
    const student = await Student.findOne({ email, isDeleted: false })
      .populate('selectedCourse', 'title slug')
      .lean();

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Student profile not found');
    }

    return student;
  }

  async getProfileById(id) {
    const student = await Student.findOne({ _id: id, isDeleted: false })
      .populate('selectedCourse', 'title slug')
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
    const student = await Student.findById(studentId)
      .populate('selectedCourse', 'title slug')
      .populate('courses.course', 'title slug')
      .lean();

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.STUDENT_NOT_FOUND);
    }

    return {
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
      },
      courses: student.courses || [],
      attendanceSummary: student.attendanceSummary || { totalClasses: 0, attended: 0, percentage: 0 },
    };
  }
}

module.exports = new StudentPortalService();
