import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import teacherPortalService from '../../services/teacherPortalService';
import { useAuth } from '../../context/AuthContext';
import ActionDropdown from '../common/ActionDropdown';
import AdminDetailView, { Badge } from '../common/AdminDetailView';
import {
  FiUsers, FiSearch, FiChevronLeft, FiChevronRight,
  FiEye, FiPrinter, FiMessageSquare, FiCheckSquare,
  FiAward, FiRefreshCw, FiUser, FiPhone, FiMail,
  FiBookOpen, FiGrid, FiSliders, FiX, FiCalendar,
  FiFlag, FiPhoneCall,
} from 'react-icons/fi';

const STUDENT_STATUS_MAP = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  graduated: { label: 'Graduated', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-800 border-red-200' },
  transferred: { label: 'Transferred', color: 'bg-orange-100 text-orange-800 border-orange-200' },
};

const PROFILE_STATUS_MAP = {
  not_submitted: { label: 'Not Submitted', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  changes_requested: { label: 'Changes Required', color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export default function TeacherAssignedStudentsSection() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const teacherId = user?._id || user?.id;

  const fetchAssignedStudents = useCallback(async (p = 1) => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await teacherPortalService.getAssignedStudents(teacherId, params);
      const responseData = res?.data || res;
      
      // DEBUG: Log API response data for first student
      const debugStudents = responseData?.students || [];
      if (debugStudents.length > 0) {
        const s0 = debugStudents[0];
        console.log('[DEBUG TeacherAssignedStudents] API response first student user:', s0.user);
        console.log('[DEBUG TeacherAssignedStudents] user keys:', s0.user ? Object.keys(s0.user) : 'NO USER');
        console.log('[DEBUG TeacherAssignedStudents] user.status:', s0.user?.status);
        console.log('[DEBUG TeacherAssignedStudents] user.profileVerificationStatus:', s0.user?.profileVerificationStatus);
        console.log('[DEBUG TeacherAssignedStudents] user.completionPercentage:', s0.user?.completionPercentage);
        console.log('[DEBUG TeacherAssignedStudents] user.profileComplete:', s0.user?.profileComplete);
        console.log('[DEBUG TeacherAssignedStudents] user.createdAt:', s0.user?.createdAt);
      }
      
      setStudents(debugStudents);
      setTotal(responseData?.pagination?.total || 0);
      setTotalPages(responseData?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned students');
    } finally {
      setLoading(false);
    }
  }, [teacherId, searchQuery, statusFilter]);

  useEffect(() => {
    fetchAssignedStudents(page);
  }, [page, fetchAssignedStudents]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAssignedStudents(page);
    setRefreshing(false);
  };

  const getStatusBadge = (status) => {
    const s = STUDENT_STATUS_MAP[status] || STUDENT_STATUS_MAP.active;
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${s.color}`}>{s.label}</span>;
  };

  const getProfileStatusBadge = (status) => {
    const s = PROFILE_STATUS_MAP[status] || PROFILE_STATUS_MAP.not_submitted;
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${s.color}`}>{s.label}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  // Derive unique course/class values from students for filters
  const courseOptions = [...new Set(students.map(s => s.selectedCourse?.title || s.course || '').filter(Boolean))];
  const classOptions = [...new Set(students.map(s => s.currentClass || s.class || '').filter(Boolean))];

  // ==================== STUDENT DETAIL MODAL ====================

  const renderStudentDetail = (student) => {
    // DEBUG: Log selected student before rendering AdminDetailView
    console.log('[DEBUG renderStudentDetail] student.user:', student.user);
    console.log('[DEBUG renderStudentDetail] user keys:', student.user ? Object.keys(student.user) : 'NO USER');
    console.log('[DEBUG renderStudentDetail] user.status:', student.user?.status);
    console.log('[DEBUG renderStudentDetail] user.profileVerificationStatus:', student.user?.profileVerificationStatus);
    console.log('[DEBUG renderStudentDetail] user.completionPercentage:', student.user?.completionPercentage);
    console.log('[DEBUG renderStudentDetail] user.profileComplete:', student.user?.profileComplete);
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 pt-6 sm:pt-10 pb-6 sm:pb-10 overflow-y-auto"
        onClick={() => setSelectedStudent(null)}>
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 w-full max-w-4xl mx-3 sm:mx-4 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 sm:mb-6 sticky -top-8 bg-white pb-3 z-100 border-b border-border-light/50">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-text-dark">Student Details</h3>
            <button onClick={() => setSelectedStudent(null)}
              className="w-8 h-8 rounded-xl bg-bg-light hover:bg-border-light text-text-light hover:text-text-dark flex items-center justify-center transition-colors text-lg">&times;</button>
          </div>

          <AdminDetailView entity={student} type="student" statusMaps={{
            userStatus: {
              pending: { label: 'Pending', variant: 'pending' },
              active: { label: 'Active', variant: 'active' },
              rejected: { label: 'Rejected', variant: 'rejected' },
              blocked: { label: 'Blocked', variant: 'blocked' },
            },
            verification: {
              not_submitted: { label: 'Not Submitted', variant: 'not_submitted' },
              pending: { label: 'Pending', variant: 'pending' },
              verified: { label: 'Verified', variant: 'verified' },
              rejected: { label: 'Rejected', variant: 'rejected' },
              changes_requested: { label: 'Changes Requested', variant: 'changes_requested' },
            },
          }} />
        </div>
      </div>,
      document.body
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-dark">My Assigned Students</h2>
          <p className="text-sm text-text-light mt-1">
            {total > 0
              ? `${total} student${total !== 1 ? 's' : ''} assigned to you`
              : 'Students assigned to you by admin'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
              showFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-body border-border-light hover:bg-bg-light'
            }`}
          >
            <FiSliders size={15} />
            Filters
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-text-body rounded-xl text-sm font-semibold hover:bg-bg-light transition-colors border border-border-light disabled:opacity-50"
          >
            <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <FiX size={16} />
          {error}
          <button onClick={() => fetchAssignedStudents(page)} className="ml-auto text-red-700 font-bold hover:underline">Retry</button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-5 bg-bg-light rounded-2xl border border-border-light">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Course Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-light mb-1.5">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
              >
                <option value="">All Courses</option>
                {courseOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {/* Class Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-light mb-1.5">Class</label>
              <select
                value={classFilter}
                onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
              >
                <option value="">All Classes</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-light mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
            {/* Gender Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-light mb-1.5">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {(courseFilter || classFilter || statusFilter || genderFilter) && (
            <button
              onClick={() => { setCourseFilter(''); setClassFilter(''); setStatusFilter(''); setGenderFilter(''); setPage(1); }}
              className="mt-3 text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <FiX size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            placeholder="Search by name, roll number, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
          />
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-bg-light rounded-full flex items-center justify-center">
            <FiUsers size={36} className="text-border-light" />
          </div>
          <h3 className="text-xl font-bold text-text-dark mb-2">No Assigned Students</h3>
          <p className="text-text-light max-w-md mx-auto mb-2">
            {searchQuery || statusFilter || courseFilter || classFilter || genderFilter
              ? 'No students match your search criteria. Try adjusting your filters.'
              : 'You have no students assigned yet. The admin will assign students to you.'}
          </p>
          <p className="text-sm text-text-light">
            {searchQuery || statusFilter || courseFilter || classFilter || genderFilter
              ? 'Try clearing your search or filters.'
              : 'Once assigned, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
          <table className="w-full min-w-[900px]">
            <thead className="border-b-2 border-border-light">
              <tr>
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Photo</th>
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Student Name</th>
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden md:table-cell">Roll No</th>
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden lg:table-cell">Course</th>
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden xl:table-cell">Class</th>
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden lg:table-cell">Phone</th>
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden xl:table-cell">Email</th>
                <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Status</th>
                <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden sm:table-cell">Profile</th>
                <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {students
                .filter((s) => {
                  // Client-side filters for gender, course, class
                  if (genderFilter && s.gender !== genderFilter) return false;
                  if (courseFilter && (s.selectedCourse?.title !== courseFilter && s.course !== courseFilter)) return false;
                  if (classFilter && s.currentClass !== classFilter && s.class !== classFilter) return false;
                  return true;
                })
                .map((student) => {
                  const userData = student.user || {};
                  const dropdownActions = [
                    {
                      label: 'View Profile',
                      icon: FiEye,
                      onClick: () => setSelectedStudent(student),
                    },
                    { divider: true },
                    {
                      label: 'Print Profile',
                      icon: FiPrinter,
                      onClick: () => window.print(),
                    },
                    { divider: true },
                    {
                      label: 'Send Message',
                      icon: FiMessageSquare,
                      onClick: () => {},
                    },
                    {
                      label: 'Mark Attendance',
                      icon: FiCheckSquare,
                      onClick: () => {},
                    },
                    {
                      label: 'View Marks',
                      icon: FiAward,
                      onClick: () => {},
                    },
                  ];

                  return (
                    <tr key={student._id} className="hover:bg-bg-light transition-colors">
                      {/* Photo */}
                      <td className="px-4 sm:px-6 py-3.5">
                        {student.studentPhoto ? (
                          <img src={student.studentPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {student.studentName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </td>
                      {/* Student Name */}
                      <td className="px-4 sm:px-6 py-3.5">
                        <p className="font-semibold text-text-dark text-sm">{student.studentName || 'Unknown'}</p>
                        <p className="text-xs text-text-light">{student.studentId || ''}</p>
                      </td>
                      {/* Roll No */}
                      <td className="px-4 sm:px-6 py-3.5 text-sm text-text-body font-mono hidden md:table-cell">
                        {student.studentId || student.rollNumber || '-'}
                      </td>
                      {/* Course */}
                      <td className="px-4 sm:px-6 py-3.5 text-sm text-text-body hidden lg:table-cell">
                        {student.selectedCourse?.title || student.course || '-'}
                      </td>
                      {/* Class */}
                      <td className="px-4 sm:px-6 py-3.5 text-sm text-text-body hidden xl:table-cell">
                        {student.currentClass || student.class || '-'}
                      </td>
                      {/* Phone */}
                      <td className="px-4 sm:px-6 py-3.5 text-sm text-text-body hidden lg:table-cell">
                        {student.phone || '-'}
                      </td>
                      {/* Email */}
                      <td className="px-4 sm:px-6 py-3.5 text-sm text-text-body hidden xl:table-cell truncate max-w-[180px]">
                        {student.email || '-'}
                      </td>
                      {/* Status */}
                      <td className="px-4 sm:px-6 py-3.5 text-center">
                        {getStatusBadge(student.status)}
                      </td>
                      {/* Profile Status */}
                      <td className="px-4 sm:px-6 py-3.5 text-center hidden sm:table-cell">
                        {getProfileStatusBadge(userData?.profileVerificationStatus)}
                      </td>
                      {/* Actions */}
                      <td className="px-4 sm:px-6 py-3.5">
                        <div className="flex items-center justify-center">
                          <ActionDropdown actions={dropdownActions} align="right" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50 transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
