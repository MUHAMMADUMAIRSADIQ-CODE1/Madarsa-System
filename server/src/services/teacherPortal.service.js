const Teacher = require('../models/Teacher.model');
const Course = require('../models/Course.model');
const Student = require('../models/Student.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

const ALLOWED_PROFILE_FIELDS = [
  'phone', 'whatsapp', 'biography', 'shortBio', 'country', 'city', 'timezone',
  'nationality', 'linkedin', 'facebook', 'instagram', 'youtube', 'website',
  'subjects', 'teachingLanguages', 'skills',
];

class TeacherPortalService {
  async getProfileByEmail(email) {
    const teacher = await Teacher.findOne({ email, isDeleted: false })
      .populate('assignedCourses', 'title slug thumbnail shortDescription level')
      .lean();

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Teacher profile not found');
    }

    return teacher;
  }

  async getProfileById(id) {
    const teacher = await Teacher.findOne({ _id: id, isDeleted: false })
      .populate('assignedCourses', 'title slug thumbnail shortDescription level')
      .lean();

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }

    return teacher;
  }

  async updateProfile(id, data, userId) {
    const updateData = {};
    for (const field of ALLOWED_PROFILE_FIELDS) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    updateData.updatedBy = userId;

    if (data.profilePhoto !== undefined) updateData.profilePhoto = data.profilePhoto;

    const teacher = await Teacher.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('assignedCourses', 'title slug');

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }

    return teacher;
  }

  async getDashboardData(teacherId) {
    const teacher = await Teacher.findById(teacherId)
      .populate('assignedCourses', 'title slug thumbnail shortDescription level')
      .lean();

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }

    const totalStudents = await Student.countDocuments({
      isDeleted: false,
    });

    return {
      profile: {
        _id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
        profilePhoto: teacher.profilePhoto,
        biography: teacher.biography,
        shortBio: teacher.shortBio,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        subjects: teacher.subjects,
        country: teacher.country,
        city: teacher.city,
        experience: teacher.experience,
        gender: teacher.gender,
      },
      courses: teacher.assignedCourses || [],
      totalStudents,
      totalCourses: (teacher.assignedCourses || []).length,
    };
  }

  async getAssignedCourses(teacherId, query = {}) {
    const teacher = await Teacher.findById(teacherId).select('assignedCourses').lean();

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }

    const courseIds = teacher.assignedCourses || [];
    const filter = { _id: { $in: courseIds }, isDeleted: false };

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(filter).skip(skip).limit(limit).sort({ title: 1 }).lean(),
      Course.countDocuments(filter),
    ]);

    return { courses, total, page, limit };
  }

  async getStudents(teacherId, query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (query.search) {
      filter.$or = [
        { studentName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { studentId: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('selectedCourse', 'title slug')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Student.countDocuments(filter),
    ]);

    return { students, total, page, limit };
  }
}

module.exports = new TeacherPortalService();
