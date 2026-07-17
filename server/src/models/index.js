const User = require('./User.model');
const Student = require('./Student.model');
const Teacher = require('./Teacher.model');
const Course = require('./Course.model');
const Gallery = require('./Gallery.model');
const News = require('./News.model');
const Admission = require('./Admission.model');
const Setting = require('./Setting.model');
const Assignment = require('./Assignment.model');
const Attendance = require('./Attendance.model');
const Certificate = require('./Certificate.model');
const LiveClass = require('./LiveClass.model');
const Notification = require('./Notification.model');
const Testimonial = require('./Testimonial.model');
const Contact = require('./Contact.model');
const CmsContent = require('./CmsContent.model');
const AuditLog = require('./AuditLog.model');
const Result = require('./Result.model');
const TeacherAnnouncement = require('./TeacherAnnouncement.model');
const { TeacherConversation, TeacherMessage } = require('./TeacherMessage.model');

module.exports = {
  User,
  Student,
  Teacher,
  Course,
  Gallery,
  News,
  Admission,
  Setting,
  Assignment,
  Attendance,
  Certificate,
  LiveClass,
  Notification,
  Testimonial,
  Contact,
  CmsContent,
  AuditLog,
  Result,
  TeacherAnnouncement,
  TeacherConversation,
  TeacherMessage,
};
