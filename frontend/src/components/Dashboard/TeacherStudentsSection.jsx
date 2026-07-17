import { useState, useEffect, useCallback } from 'react';
import teacherAcademicService from '../../services/teacherAcademicService';
import { useAuth } from '../../context/AuthContext';
import {
  FiUsers, FiSearch, FiChevronLeft, FiChevronRight,
  FiUser, FiPhone, FiMail, FiEye
} from 'react-icons/fi';

export default function TeacherStudentsSection() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const teacherId = user?._id || user?.id;

  const fetchStudents = useCallback(async (p = 1) => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await teacherAcademicService.getMyStudents(teacherId, params);
      const responseData = res?.data || res;
      setStudents(responseData?.students || []);
      setTotalPages(responseData?.totalPages || Math.ceil((responseData?.total || 0) / 10) || 1);
      setTotal(responseData?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [teacherId, searchQuery, statusFilter]);

  useEffect(() => {
    fetchStudents(page);
  }, [page, fetchStudents]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const renderStudentDetail = (student) => (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 pb-10 overflow-y-auto"
      onClick={() => setSelectedStudent(null)}>
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-xl font-bold text-text-dark">Student Details</h3>
          <button onClick={() => setSelectedStudent(null)}
            className="text-text-light hover:text-text-dark text-xl">&times;</button>
        </div>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {student.studentName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-dark">{student.studentName}</h3>
              {student.studentId && (
                <span className="text-xs font-mono text-primary font-semibold">
                  ID: {student.studentId}
                </span>
              )}
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(student.status)}`}>
                  {student.status}
                </span>
                {student.attendancePercentage !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getAttendanceColor(student.attendancePercentage)}`}>
                    {student.attendancePercentage}% Attendance
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-bg-light rounded-xl">
              <p className="text-xs text-text-light font-medium uppercase tracking-wider">Email</p>
              <p className="text-sm font-semibold text-text-dark mt-1 break-all">{student.email || '-'}</p>
            </div>
            <div className="p-4 bg-bg-light rounded-xl">
              <p className="text-xs text-text-light font-medium uppercase tracking-wider">Phone</p>
              <p className="text-sm font-semibold text-text-dark mt-1">{student.phone || '-'}</p>
            </div>
            <div className="p-4 bg-bg-light rounded-xl">
              <p className="text-xs text-text-light font-medium uppercase tracking-wider">Country</p>
              <p className="text-sm font-semibold text-text-dark mt-1">{student.country || '-'}</p>
            </div>
            <div className="p-4 bg-bg-light rounded-xl">
              <p className="text-xs text-text-light font-medium uppercase tracking-wider">City</p>
              <p className="text-sm font-semibold text-text-dark mt-1">{student.city || '-'}</p>
            </div>
            <div className="p-4 bg-bg-light rounded-xl">
              <p className="text-xs text-text-light font-medium uppercase tracking-wider">Gender</p>
              <p className="text-sm font-semibold text-text-dark mt-1 capitalize">{student.gender || '-'}</p>
            </div>
            <div className="p-4 bg-bg-light rounded-xl">
              <p className="text-xs text-text-light font-medium uppercase tracking-wider">Enrolled</p>
              <p className="text-sm font-semibold text-text-dark mt-1">{student.enrollmentDate ? formatDate(student.enrollmentDate) : '-'}</p>
            </div>
          </div>

          {/* Enrolled Courses */}
          {student.courses?.length > 0 && (
            <div>
              <p className="text-xs text-text-light font-medium uppercase tracking-wider mb-2">Enrolled Courses</p>
              <div className="space-y-2">
                {student.courses.map((enrollment, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                    <p className="text-sm font-semibold text-text-dark">
                      {enrollment.course?.title || 'Course'}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance */}
          {student.attendanceSummary && (
            <div className="p-4 bg-bg-light rounded-xl">
              <p className="text-xs text-text-light font-medium uppercase tracking-wider mb-2">Attendance Summary</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-text-dark">{student.attendanceSummary.totalClasses || 0}</p>
                  <p className="text-xs text-text-light">Total Classes</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{student.attendanceSummary.attended || 0}</p>
                  <p className="text-xs text-text-light">Attended</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">{student.attendanceSummary.percentage || student.attendancePercentage || 0}%</p>
                  <p className="text-xs text-text-light">Rate</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-border-light">
          <button
            onClick={() => setSelectedStudent(null)}
            className="w-full px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-dark">My Students</h2>
          <p className="text-sm text-text-light mt-1">
            {total > 0 ? `${total} student${total !== 1 ? 's' : ''} enrolled in your courses` : 'Students assigned to your courses'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            placeholder="Search by name, email or student ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
          <option value="suspended">Suspended</option>
          <option value="transferred">Transferred</option>
        </select>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16">
          <FiUsers className="w-16 h-16 text-border-light mx-auto mb-4" />
          <p className="text-text-light font-medium">No students found</p>
          <p className="text-sm text-text-light mt-2">
            {searchQuery || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Students will appear here once they enroll in your courses.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
          <table className="w-full min-w-[700px]">
            <thead className="border-b-2 border-border-light">
              <tr>
                <th className="text-left p-3 font-semibold text-text-dark text-sm">Student</th>
                <th className="text-left p-3 font-semibold text-text-dark text-sm hidden md:table-cell">Course</th>
                <th className="text-center p-3 font-semibold text-text-dark text-sm">Attendance</th>
                <th className="text-center p-3 font-semibold text-text-dark text-sm">Status</th>
                <th className="text-center p-3 font-semibold text-text-dark text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-bg-light transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {student.studentPhoto ? (
                        <img src={student.studentPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {student.studentName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-text-dark text-sm">{student.studentName}</p>
                        <p className="text-xs text-text-light">
                          {student.studentId || student.email || ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-text-body hidden md:table-cell">
                    {student.courses?.map(e => e.course?.title).filter(Boolean).join(', ') ||
                     student.selectedCourse?.title || '-'}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getAttendanceColor(student.attendancePercentage || 0)}`}>
                      {student.attendancePercentage || 0}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-primary font-semibold text-sm hover:bg-primary-light rounded-lg transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-light">
          <p className="text-sm text-text-light">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50 transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50 transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && renderStudentDetail(selectedStudent)}
    </div>
  );
}
