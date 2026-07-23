const Attendance = require('../models/Attendance.model');
const Teacher = require('../models/Teacher.model');
const Student = require('../models/Student.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

class AttendanceService {
  async getAll(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (query.attendanceId) {
      filter.attendanceId = { $regex: query.attendanceId, $options: 'i' };
    }
    if (query.student) {
      filter.student = query.student;
    }
    if (query.teacher) {
      filter.teacher = query.teacher;
    }
    if (query.course) {
      filter.course = query.course;
    }
    if (query.batch) {
      filter.batch = query.batch;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.dateFrom || query.dateTo) {
      filter.classDate = {};
      if (query.dateFrom) filter.classDate.$gte = new Date(query.dateFrom);
      if (query.dateTo) filter.classDate.$lte = new Date(query.dateTo);
    }
    if (query.search) {
      const studentIds = await Student.find({
        isDeleted: false,
        studentName: { $regex: query.search, $options: 'i' },
      }).distinct('_id');
      filter.$or = [
        { attendanceId: { $regex: query.search, $options: 'i' } },
        { student: { $in: studentIds } },
        { batch: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sort = { classDate: -1, createdAt: -1 };

    const [data, total] = await Promise.all([
      Attendance.find(filter)
        .populate('student', 'studentName studentId email studentPhoto')
        .populate('teacher', 'fullName email profilePhoto')
        .populate('course', 'title slug')
        .populate('markedBy', 'fullName email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(filter),
    ]);

    return {
      data,
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

  async getById(id) {
    const record = await Attendance.findOne({ _id: id, isDeleted: false })
      .populate('student', 'studentName studentId email studentPhoto')
      .populate('teacher', 'fullName email profilePhoto')
      .populate('course', 'title slug')
      .populate('markedBy', 'fullName email');

    if (!record) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Attendance record not found');
    }

    return record;
  }

  async create(data, userId) {
    const existing = await Attendance.findOne({
      student: data.student,
      course: data.course,
      classDate: new Date(data.classDate),
      isDeleted: false,
    });

    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, 'Attendance already marked for this student in this class on this date');
    }

    const record = await Attendance.create({
      ...data,
      classDate: new Date(data.classDate),
      markedBy: userId,
      createdBy: userId,
    });

    return this.getById(record._id);
  }

  async update(id, data, userId) {
    const record = await Attendance.findOne({ _id: id, isDeleted: false });

    if (!record) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Attendance record not found');
    }

    const allowedFields = ['status', 'batch', 'classTime', 'onlineSessionId', 'remarks'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        record[field] = data[field];
      }
    }
    record.updatedBy = userId;

    await record.save();
    return this.getById(record._id);
  }

  async softDelete(id, userId) {
    const record = await Attendance.findOne({ _id: id, isDeleted: false });

    if (!record) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Attendance record not found');
    }

    record.isDeleted = true;
    record.deletedAt = new Date();
    record.updatedBy = userId;
    await record.save();

    return record;
  }

  async restore(id, userId) {
    const record = await Attendance.findOne({ _id: id, isDeleted: true });

    if (!record) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Deleted attendance record not found');
    }

    record.isDeleted = false;
    record.deletedAt = null;
    record.updatedBy = userId;
    await record.save();

    return this.getById(record._id);
  }

  async getStats(query = {}) {
    const filter = { isDeleted: false };

    if (query.course) filter.course = query.course;
    if (query.teacher) filter.teacher = query.teacher;
    if (query.student) filter.student = query.student;
    if (query.batch) filter.batch = query.batch;
    if (query.dateFrom || query.dateTo) {
      filter.classDate = {};
      if (query.dateFrom) filter.classDate.$gte = new Date(query.dateFrom);
      if (query.dateTo) filter.classDate.$lte = new Date(query.dateTo);
    }

    const [total, present, absent, late, excused] = await Promise.all([
      Attendance.countDocuments(filter),
      Attendance.countDocuments({ ...filter, status: 'present' }),
      Attendance.countDocuments({ ...filter, status: 'absent' }),
      Attendance.countDocuments({ ...filter, status: 'late' }),
      Attendance.countDocuments({ ...filter, status: 'excused' }),
    ]);

    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, absent, late, excused, percentage };
  }

  async getTeacherAttendance(teacherId, query = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const filter = { teacher: teacherId, isDeleted: false };

    if (query.date) {
      const date = new Date(query.date);
      date.setHours(0, 0, 0, 0);
      const endOfDate = new Date(date);
      endOfDate.setHours(23, 59, 59, 999);
      filter.classDate = { $gte: date, $lte: endOfDate };
    }

    if (query.today === 'true') {
      filter.classDate = { $gte: today, $lte: endOfToday };
    }

    if (query.course) filter.course = query.course;
    if (query.student) filter.student = query.student;
    if (query.status) filter.status = query.status;

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Attendance.find(filter)
        .populate('student', 'studentName studentId email studentPhoto')
        .populate('course', 'title slug')
        .sort({ classDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(filter),
    ]);

    const stats = await this.getStats(query.date ? { teacher: teacherId, dateFrom: query.date, dateTo: query.date } : { teacher: teacherId });

    return {
      data,
      stats,
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

  async bulkMarkAttendance(records, userId) {
    const results = { created: 0, updated: 0, errors: [] };

    for (const record of records) {
      try {
        const existing = await Attendance.findOne({
          student: record.student,
          course: record.course,
          classDate: new Date(record.classDate),
          isDeleted: false,
        });

        if (existing) {
          // Update existing record
          existing.status = record.status || existing.status;
          if (record.remarks !== undefined) existing.remarks = record.remarks;
          existing.updatedBy = userId;
          await existing.save();
          results.updated++;
        } else {
          // Create new record
          await Attendance.create({
            student: record.student,
            course: record.course,
            teacher: record.teacher,
            classDate: new Date(record.classDate),
            status: record.status || 'present',
            remarks: record.remarks || '',
            markedBy: userId,
            createdBy: userId,
          });
          results.created++;
        }
      } catch (err) {
        results.errors.push({
          student: record.student,
          error: err.message,
        });
      }
    }

    return results;
  }

  async markAllPresent(records, userId) {
    const results = { created: 0, updated: 0 };

    for (const record of records) {
      try {
        const existing = await Attendance.findOne({
          student: record.student,
          course: record.course,
          classDate: new Date(record.classDate),
          isDeleted: false,
        });

        if (existing) {
          existing.status = 'present';
          existing.updatedBy = userId;
          await existing.save();
          results.updated++;
        } else {
          await Attendance.create({
            student: record.student,
            course: record.course,
            teacher: record.teacher,
            classDate: new Date(record.classDate),
            status: 'present',
            remarks: '',
            markedBy: userId,
            createdBy: userId,
          });
          results.created++;
        }
      } catch {
        results.updated++;
      }
    }

    return results;
  }

  async getStudentAttendance(studentId, query = {}) {
    const filter = { student: studentId, isDeleted: false };

    if (query.course) filter.course = query.course;
    if (query.status) filter.status = query.status;
    if (query.dateFrom || query.dateTo) {
      filter.classDate = {};
      if (query.dateFrom) filter.classDate.$gte = new Date(query.dateFrom);
      if (query.dateTo) filter.classDate.$lte = new Date(query.dateTo);
    }

    if (query.month && query.year) {
      const year = parseInt(query.year);
      const month = parseInt(query.month) - 1;
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      filter.classDate = { $gte: start, $lte: end };
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Attendance.find(filter)
        .populate('course', 'title slug')
        .populate('teacher', 'fullName')
        .sort({ classDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(filter),
    ]);

    // Build stats query with the same date range as the data query
    const statsQuery = { ...query, student: studentId };
    if (query.month && query.year) {
      const year = parseInt(query.year);
      const month = parseInt(query.month) - 1;
      statsQuery.dateFrom = new Date(year, month, 1).toISOString();
      statsQuery.dateTo = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
    }
    const stats = await this.getStats(statsQuery);

    return {
      data,
      stats,
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
}

module.exports = new AttendanceService();
