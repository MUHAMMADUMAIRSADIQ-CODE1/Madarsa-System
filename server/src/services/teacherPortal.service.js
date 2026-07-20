const Teacher = require('../models/Teacher.model');
const Course = require('../models/Course.model');
const Student = require('../models/Student.model');
const Assignment = require('../models/Assignment.model');
const Attendance = require('../models/Attendance.model');
const LiveClass = require('../models/LiveClass.model');
const mongoose = require('mongoose');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

const ALLOWED_PROFILE_FIELDS = [
  'phone', 'whatsapp', 'shortBio', 'country', 'city', 'timezone',
  'nationality', 'linkedin', 'facebook', 'instagram', 'youtube', 'website',
  'subjects', 'teachingLanguages', 'skills', 'fullName', 'gender',
  'dateOfBirth', 'qualification', 'degree', 'experience', 'specialization',
  'certificates', 'teachingMode',
  'availability', 'emergencyContact', 'emergencyPhone', 'cnicPassport',
  'cnicFront', 'cnicBack', 'profilePhoto',
  'address', 'postalCode',
  'resume', 'additionalDocuments',
  'canTeachCourses',
];

class TeacherPortalService {
  async getProfileByEmail(email) {
    const teacher = await Teacher.findOne({ email, isDeleted: false })
      .populate('assignedCourses', 'title slug thumbnail shortDescription level')
      .populate('canTeachCourses', 'title slug thumbnail shortDescription')
      .lean();

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Teacher profile not found');
    }

    return teacher;
  }

  async getProfileById(id) {
    const teacher = await Teacher.findOne({ _id: id, isDeleted: false })
      .populate('assignedCourses', 'title slug thumbnail shortDescription level')
      .populate('canTeachCourses', 'title slug thumbnail shortDescription')
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

    // Validate canTeachCourses course IDs exist
    if (data.canTeachCourses && Array.isArray(data.canTeachCourses)) {
      const Course = require('../models/Course.model');
      const validCourses = await Course.find({
        _id: { $in: data.canTeachCourses },
        isDeleted: false,
      }).select('_id').lean();

      const validIds = new Set(validCourses.map(c => c._id.toString()));
      const invalidIds = data.canTeachCourses.filter(
        id => !validIds.has(id.toString())
      );

      if (invalidIds.length > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid or deleted courses: ${invalidIds.join(', ')}`);
      }
    }

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
    console.log('\n======== DIAGNOSTIC: teacherPortal.getDashboardData ========');
    console.log('Teacher ID received:', teacherId);

    // Support both Teacher._id and User._id references
    let teacher = await Teacher.findById(teacherId)
      .populate('assignedCourses', 'title slug thumbnail shortDescription level')
      .lean();

    console.log('Direct lookup by _id found:', !!teacher);

    // Fallback: look up by user field if direct _id didn't match (User._id vs Teacher._id)
    if (!teacher) {
      teacher = await Teacher.findOne({ user: teacherId, isDeleted: false })
        .populate('assignedCourses', 'title slug thumbnail shortDescription level')
        .lean();
      console.log('Fallback lookup by user field found:', !!teacher);
    }

    if (!teacher) {
      console.log('TEACHER NOT FOUND - throwing error');
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }

    console.log('Teacher fullName:', teacher.fullName);
    console.log('Teacher email:', teacher.email);
    console.log('Teacher assignedCourses count:', (teacher.assignedCourses || []).length);
    console.log('Teacher assignedCourses:', JSON.stringify(teacher.assignedCourses));
    console.log('Teacher assignedStudents count:', (teacher.assignedStudents || []).length);
    console.log('Teacher assignedStudents (first 5):', JSON.stringify((teacher.assignedStudents || []).slice(0, 5)));

    const totalStudents = (teacher.assignedStudents || []).length;

    const responseData = {
      profile: {
        _id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
        profilePhoto: teacher.profilePhoto,
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

    console.log('Response data (truncated):', JSON.stringify({
      profileKeys: Object.keys(responseData.profile),
      coursesCount: responseData.courses.length,
      totalStudents: responseData.totalStudents,
      totalCourses: responseData.totalCourses
    }));
    console.log('=======================================================\n');

    return responseData;
  }

  async getAssignedCourses(teacherId, query = {}) {
    const teacher = await Teacher.findOne({ user: teacherId }).select('assignedCourses').lean();

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);
    }

    const courseIds = teacher.assignedCourses || [];
    const filter = { _id: { $in: courseIds }, isDeleted: false };

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { code: { $regex: query.search, $options: 'i' } },
        { shortDescription: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.level) {
      filter.level = query.level;
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(filter).skip(skip).limit(limit).sort({ title: 1 }).lean(),
      Course.countDocuments(filter),
    ]);

    return { courses, total, page, limit: parseInt(query.limit) || 20 };
  }

  async getStudents(teacherId, query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const teacher = await Teacher.findOne({ user: teacherId }).select('assignedCourses').lean();
    if (!teacher) throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);

    const courseIds = teacher.assignedCourses || [];

    const filter = { isDeleted: false };

    // Filter by assigned courses
    if (courseIds.length > 0) {
      filter['courses.course'] = { $in: courseIds };
    }

    if (query.search) {
      filter.$or = [
        { studentName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { studentId: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.course) {
      filter['courses.course'] = query.course;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('selectedCourse', 'title slug')
        .populate('courses.course', 'title slug')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Student.countDocuments(filter),
    ]);

    // Attach attendance percentage for each student
    const studentIds = students.map(s => s._id);
    const attendanceData = await Attendance.aggregate([
      { $match: { student: { $in: studentIds }, isDeleted: false } },
      {
        $group: {
          _id: '$student',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        },
      },
    ]);

    const attendanceMap = {};
    attendanceData.forEach(a => {
      attendanceMap[a._id.toString()] = Math.round(((a.present + a.late) / a.total) * 100) || 0;
    });

    const studentsWithAttendance = students.map(s => ({
      ...s,
      attendancePercentage: attendanceMap[s._id.toString()] || 0,
    }));

    return { students: studentsWithAttendance, total, page, limit };
  }

  // =================== ASSIGNMENT MANAGEMENT ===================

  async getAssignments(teacherId, query = {}) {
    const teacher = await Teacher.findOne({ user: teacherId }).select('assignedCourses').lean();
    if (!teacher) throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);

    const filter = { teacher: teacher._id };

    if (query.course) filter.course = query.course;
    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }
    if (query.status === 'published') filter.isPublished = true;
    if (query.status === 'draft') filter.isPublished = false;
    if (query.dueDateFrom || query.dueDateTo) {
      filter.dueDate = {};
      if (query.dueDateFrom) filter.dueDate.$gte = new Date(query.dueDateFrom);
      if (query.dueDateTo) filter.dueDate.$lte = new Date(query.dueDateTo);
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate('course', 'title slug')
        .sort({ dueDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(filter),
    ]);

    return { assignments, total, page, limit };
  }

  async createAssignment(data, userId) {
    const teacher = await Teacher.findOne({ user: userId });
    
    if (!teacher || !teacher.assignedCourses.includes(data.course)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not assigned to this course');
    }

    const assignment = await Assignment.create({
      ...data,
      teacher: teacher._id,
      createdBy: userId,
    });

    return assignment.populate('course', 'title slug');
  }

  async updateAssignment(id, data, userId) {
    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);

    const assignment = await Assignment.findOne({ _id: id, teacher: teacher._id });

    if (!assignment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
    }

    const allowedFields = ['title', 'description', 'dueDate', 'totalMarks', 'attachments', 'isPublished'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        assignment[field] = data[field];
      }
    }
    assignment.updatedBy = userId;

    await assignment.save();
    return assignment.populate('course', 'title slug');
  }

  async deleteAssignment(id, teacherId) {
    const teacher = await Teacher.findOne({ user: teacherId });
    if (!teacher) throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);

    const assignment = await Assignment.findOneAndDelete({ _id: id, teacher: teacher._id });
    if (!assignment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
    }
    return assignment;
  }

  async getAssignmentById(id) {
    const assignment = await Assignment.findById(id)
      .populate('course', 'title slug')
      .populate('submissions.student', 'studentName studentId studentPhoto')
      .lean();

    if (!assignment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
    }

    return assignment;
  }

  // =================== COURSE DETAILS ===================

  async getCourseDetails(teacherId, courseId) {
    const teacher = await Teacher.findOne({ _id: teacherId, assignedCourses: courseId });
    if (!teacher) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not assigned to this course');
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.COURSE_NOT_FOUND);
    }

    // Get students enrolled in this course AND assigned to this teacher
    const students = await Student.find({
      _id: { $in: teacher.assignedStudents || [] },
      'courses.course': courseId,
      isDeleted: false,
    })
      .select('studentName studentId studentPhoto email phone status')
      .lean();

    // Get attendance summary for this course
    const attendanceSummary = await Attendance.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId), isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
        },
      },
    ]);

    // Get assignments for this course
    const courseAssignments = await Assignment.find({ course: courseId })
      .select('title dueDate isPublished submissions')
      .sort({ dueDate: -1 })
      .lean();

    // Get live classes for this course
    const liveClasses = await LiveClass.find({ course: courseId })
      .select('title scheduledAt duration status')
      .sort({ scheduledAt: -1 })
      .limit(10)
      .lean();

    return {
      course,
      students: students.map(s => ({
        _id: s._id,
        studentName: s.studentName,
        studentId: s.studentId,
        studentPhoto: s.studentPhoto,
        email: s.email,
        phone: s.phone,
        status: s.status,
      })),
      attendanceSummary: attendanceSummary[0] || { total: 0, present: 0, absent: 0, late: 0, excused: 0 },
      assignments: courseAssignments.map(a => ({
        _id: a._id,
        title: a.title,
        dueDate: a.dueDate,
        isPublished: a.isPublished,
        totalSubmissions: a.submissions?.length || 0,
      })),
      liveClasses,
      totalStudents: students.length,
    };
  }

  // =================== SCHEDULE ===================

  async getSchedule(teacherId, query = {}) {
    const teacher = await Teacher.findOne({ user: teacherId }).select('assignedCourses').lean();
    if (!teacher) throw new ApiError(httpStatus.NOT_FOUND, messages.TEACHER_NOT_FOUND);

    const courseIds = teacher.assignedCourses || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's live classes
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const [todaysClasses, weeklyClasses, upcomingClasses] = await Promise.all([
      LiveClass.find({
        teacher: teacherId,
        scheduledAt: { $gte: today, $lte: endOfToday },
      })
        .populate('course', 'title slug')
        .sort({ scheduledAt: 1 })
        .lean(),

      // Weekly timetable: get classes for the next 7 days
      LiveClass.find({
        teacher: teacherId,
        scheduledAt: { $gte: today, $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) },
      })
        .populate('course', 'title slug')
        .sort({ scheduledAt: 1 })
        .lean(),

      // Upcoming classes (beyond today)
      LiveClass.find({
        teacher: teacherId,
        scheduledAt: { $gte: today },
      })
        .populate('course', 'title slug')
        .sort({ scheduledAt: 1 })
        .limit(20)
        .lean(),
    ]);

    // Get todays attendance taken count
    const todaysAttendanceCount = await Attendance.countDocuments({
      teacher: teacherId,
      classDate: { $gte: today, $lte: endOfToday },
      isDeleted: false,
    });

    return {
      todaysClasses,
      weeklyClasses,
      upcomingClasses,
      todaysAttendanceCount,
      totalCourses: courseIds.length,
    };
  }

  // =================== COURSE MATERIALS ===================

  async addCourseMaterial(courseId, materialData, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.COURSE_NOT_FOUND);
    }

    const material = {
      title: materialData.title,
      description: materialData.description || '',
      fileUrl: materialData.fileUrl,
      fileType: materialData.fileType || 'document',
      fileSize: materialData.fileSize || 0,
      uploadedAt: new Date(),
      uploadedBy: userId,
    };

    if (!course.materials) {
      course.materials = [];
    }
    course.materials.push(material);
    course.updatedBy = userId;
    await course.save();

    return material;
  }

  async getCourseMaterials(courseId, query = {}) {
    const course = await Course.findById(courseId)
      .select('materials title')
      .lean();

    if (!course) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.COURSE_NOT_FOUND);
    }

    let materials = course.materials || [];

    // Sort by uploaded date descending
    materials.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Apply search filter if provided
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      materials = materials.filter(m =>
        searchRegex.test(m.title) || searchRegex.test(m.description || '')
      );
    }

    // Apply file type filter if provided
    if (query.fileType) {
      materials = materials.filter(m => m.fileType === query.fileType);
    }

    return {
      courseTitle: course.title,
      materials,
      total: materials.length,
    };
  }

  async deleteCourseMaterial(courseId, materialIndex, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.COURSE_NOT_FOUND);
    }

    if (!course.materials || !course.materials[parseInt(materialIndex)]) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Material not found');
    }

    course.materials.splice(parseInt(materialIndex), 1);
    course.updatedBy = userId;
    await course.save();

    return { message: 'Material deleted successfully' };
  }
}

module.exports = new TeacherPortalService();
