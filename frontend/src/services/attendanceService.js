import api from './api';

export const attendanceService = {
  getAdminAttendance: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/admin/attendance${q ? `?${q}` : ''}`);
  },

  getAdminAttendanceStats: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/admin/attendance/stats${q ? `?${q}` : ''}`);
  },

  getAttendanceById: (id) => api.get(`/admin/attendance/${id}`),

  createAttendance: (data) => api.post('/admin/attendance', data),

  updateAttendance: (id, data) => api.put(`/admin/attendance/${id}`, data),

  deleteAttendance: (id) => api.delete(`/admin/attendance/${id}`),

  restoreAttendance: (id) => api.patch(`/admin/attendance/${id}/restore`),

  getTeacherAttendance: (teacherId, params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/teacher/attendance/${teacherId}${q ? `?${q}` : ''}`);
  },

  markTeacherAttendance: (data) => api.post('/teacher/attendance', data),

  updateTeacherAttendance: (id, data) => api.put(`/teacher/attendance/${id}`, data),

  getStudentAttendance: (studentId, params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api.get(`/student/attendance/${studentId}${q ? `?${q}` : ''}`);
  },

  bulkMarkAttendance: (data) => api.post('/teacher/attendance/bulk', data),

  markAllPresent: (data) => api.post('/teacher/attendance/mark-all-present', data),
};

export default attendanceService;
