const BaseService = require('./BaseService');
const Admission = require('../models/Admission.model');
const Student = require('../models/Student.model');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

class AdmissionService extends BaseService {
  constructor() {
    super(Admission, 'Admission');
    this.searchFields = [
      'applicationNumber', 'studentName', 'fatherName', 'guardianName',
      'email', 'phone', 'country',
    ];
  }

  async generateApplicationNumber() {
    const year = new Date().getFullYear();
    const prefix = `ADM-${year}-`;

    const lastAdmission = await this.model
      .findOne({ applicationNumber: { $regex: `^${prefix}` } })
      .sort({ applicationNumber: -1 })
      .lean();

    let nextNum = 1;
    if (lastAdmission && lastAdmission.applicationNumber) {
      const parts = lastAdmission.applicationNumber.split('-');
      nextNum = parseInt(parts[parts.length - 1], 10) + 1;
    }

    return `${prefix}${String(nextNum).padStart(6, '0')}`;
  }

  async create(data) {
    data.applicationNumber = await this.generateApplicationNumber();
    return super.create(data);
  }

  async getByApplicationNumber(applicationNumber) {
    const admission = await this.getOne({ applicationNumber, isDeleted: false });
    return admission;
  }

  async approveAdmission(id, userId, remarks = '') {
    const admission = await this.getById(id);
    admission.status = 'approved';
    admission.reviewedBy = userId;
    admission.reviewedAt = new Date();
    admission.updatedBy = userId;
    if (remarks) admission.adminRemarks = remarks;
    return admission.save();
  }

  async rejectAdmission(id, userId, remarks = '') {
    const admission = await this.getById(id);
    admission.status = 'rejected';
    admission.reviewedBy = userId;
    admission.reviewedAt = new Date();
    admission.updatedBy = userId;
    if (remarks) admission.adminRemarks = remarks;
    return admission.save();
  }

  async waitlistAdmission(id, userId, remarks = '') {
    const admission = await this.getById(id);
    admission.status = 'waitlisted';
    admission.reviewedBy = userId;
    admission.reviewedAt = new Date();
    admission.updatedBy = userId;
    if (remarks) admission.adminRemarks = remarks;
    return admission.save();
  }

  async reviewAdmission(id, userId, remarks = '') {
    const admission = await this.getById(id);
    admission.status = 'under-review';
    admission.reviewedBy = userId;
    admission.reviewedAt = new Date();
    admission.updatedBy = userId;
    if (remarks) admission.adminRemarks = remarks;
    return admission.save();
  }

  async softDeleteAdmission(id, userId) {
    const admission = await this.getById(id);
    admission.isDeleted = true;
    admission.deletedAt = new Date();
    admission.updatedBy = userId;
    return admission.save();
  }

  async restoreAdmission(id, userId) {
    const admission = await this.model.findOne({ _id: id, isDeleted: true });
    if (!admission) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Deleted admission not found');
    }
    admission.isDeleted = false;
    admission.deletedAt = null;
    admission.updatedBy = userId;
    return admission.save();
  }

  async convertToStudent(admissionId, userId) {
    const admission = await this.getById(admissionId);

    if (admission.status !== 'approved') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Only approved admissions can be converted to students');
    }

    if (admission.convertedToStudent) {
      throw new ApiError(httpStatus.CONFLICT, 'This admission has already been converted to a student');
    }

    const existingStudent = await Student.findOne({
      $or: [
        { email: admission.email },
        { phone: admission.phone },
      ],
      isDeleted: false,
    });

    if (existingStudent) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'A student with this email or phone already exists'
      );
    }

    const studentData = {
      studentName: admission.studentName,
      fatherName: admission.fatherName,
      guardianName: admission.guardianName,
      gender: admission.gender,
      dateOfBirth: admission.dateOfBirth,
      email: admission.email,
      phone: admission.phone,
      whatsapp: admission.whatsapp,
      country: admission.country,
      city: admission.city,
      address: admission.address,
      nationality: admission.nationality,
      cnicPassport: admission.cnicPassport,
      guardianPhone: admission.guardianPhone,
      guardianEmail: admission.guardianEmail,
      previousEducation: admission.previousEducation,
      currentQualification: admission.currentQualification,
      selectedCourse: admission.selectedCourse,
      preferredBatch: admission.preferredBatch,
      preferredTiming: admission.preferredTiming,
      learningMode: admission.learningMode,
      studentPhoto: admission.studentPhoto,
      cnicFront: admission.cnicFront,
      cnicBack: admission.cnicBack,
      passport: admission.passport,
      reasonForJoining: admission.reasonForJoining,
      previousQuranEducation: admission.previousQuranEducation,
      admissionReference: admission._id,
      status: 'active',
      createdBy: userId,
      updatedBy: userId,
    };

    const StudentService = require('./student.service');
    const student = await StudentService.create(studentData);

    admission.convertedToStudent = true;
    admission.studentReference = student._id;
    admission.updatedBy = userId;
    await admission.save();

    return student;
  }

  async getAdmissionStats() {
    const [total, pending, underReview, approved, rejected, waitlisted] = await Promise.all([
      this.count({ isDeleted: false }),
      this.count({ status: 'pending', isDeleted: false }),
      this.count({ status: 'under-review', isDeleted: false }),
      this.count({ status: 'approved', isDeleted: false }),
      this.count({ status: 'rejected', isDeleted: false }),
      this.count({ status: 'waitlisted', isDeleted: false }),
    ]);

    return { total, pending, underReview, approved, rejected, waitlisted };
  }
}

module.exports = new AdmissionService();
