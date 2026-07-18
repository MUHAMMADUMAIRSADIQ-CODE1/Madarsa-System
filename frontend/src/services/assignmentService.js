import api from './api';

export const assignmentService = {
  // Assign a student to a teacher
  assignStudent: (teacherId, studentId) =>
    api.post('/admin/assignments/assign', { teacherId, studentId }),

  // Remove a student from a teacher
  removeStudent: (teacherId, studentId) =>
    api.post('/admin/assignments/remove', { teacherId, studentId }),

  // Reassign a student to a new teacher
  reassignStudent: (teacherId, studentId) =>
    api.post('/admin/assignments/reassign', { teacherId, studentId }),

  // Bulk assign students to a teacher
  bulkAssignStudents: (teacherId, studentIds) =>
    api.post('/admin/assignments/bulk-assign', { teacherId, studentIds }),

  // Get all students assigned to a teacher
  getAssignedStudents: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/assignments/teacher/${teacherId}${q ? `?${q}` : ''}`);
  },

  // Get the assigned teacher for a student
  getAssignedTeacher: (studentId) =>
    api.get(`/admin/assignments/student/${studentId}`),

  // Get assignment summary
  getAssignmentSummary: () => api.get('/admin/assignments/summary'),

  // Get assignment counts for multiple teachers in one call
  getTeacherAssignmentCounts: (teacherIds) =>
    api.post('/admin/assignments/teacher-counts', { teacherIds }),

  // Course-aware: get eligible students whose courses match this teacher's assigned courses
  getEligibleStudents: (teacherId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/assignments/eligible-students/${teacherId}${q ? `?${q}` : ''}`);
  },

  // Course-aware: get eligible teachers whose assigned courses match this student's courses
  getEligibleTeachers: (studentId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/assignments/eligible-teachers/${studentId}${q ? `?${q}` : ''}`);
  },
};

export default assignmentService;
