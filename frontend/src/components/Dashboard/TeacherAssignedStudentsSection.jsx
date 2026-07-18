import { useState, useEffect, useCallback } from 'react';
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
      setStudents(responseData?.students || []);
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
    const userData = student.user || {};
    return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-6 pb-10 overflow-y-auto"
        onClick={() => setSelectedStudent(null)}
      >
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 border-b border-border-light px-6 sm:px-8 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-bg-light rounded-lg transition-colors text-text-light hover:text-text-dark"
              >
                <FiX size={20} />
              </button>
              <h2 className="font-heading text-xl font-bold text-text-dark">Student Details</h2>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/5 text-primary rounded-xl text-sm font-semibold hover:bg-primary/10 transition-colors border border-primary/10">
                <FiEye size={14} /> View Profile
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-bg-light text-text-body rounded-xl text-sm font-semibold hover:bg-primary/5 hover:text-primary transition-colors border border-border-light">
                <FiPrinter size={14} /> Print
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-bg-light text-text-body rounded-xl text-sm font-semibold hover:bg-primary/5 hover:text-primary transition-colors border border-border-light">
                <FiMessageSquare size={14} /> Message
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-bg-light text-text-body rounded-xl text-sm font-semibold hover:bg-primary/5 hover:text-primary transition-colors border border-border-light">
                <FiCheckSquare size={14} /> Attendance
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-bg-light text-text-body rounded-xl text-sm font-semibold hover:bg-primary/5 hover:text-primary transition-colors border border-border-light">
                <FiAward size={14} /> Marks
              </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-gradient-to-br from-primary via-primary-dark to-[#1a3a6b] rounded-2xl overflow-hidden shadow-xl mb-6 relative">
              <div className="absolute inset-0 opacity-[0.04]">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              </div>
              <div className="absolute top-0 right-0 opacity-[0.07]">
                <svg className="w-64 h-64" viewBox="0 0 400 400" fill="none">
                  <circle cx="250" cy="150" r="180" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="250" cy="150" r="120" stroke="currentColor" strokeWidth="0.5" />
                </svg>
              </div>
              <div className="relative z-10 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {/* Photo */}
                  <div className="flex-shrink-0 relative">
                    {student.studentPhoto ? (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl ring-4 ring-white/10">
                        <img src={student.studentPhoto} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 shadow-xl ring-4 ring-white/10">
                        <FiUser size={40} className="text-white/60" />
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-400 border-2 border-white rounded-full shadow-lg" />
                  </div>
                  {/* Basic Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white break-words">
                      {student.studentName || 'Unknown'}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2">
                      {student.studentId && (
                        <span className="text-green-100/80 text-sm font-mono">ID: {student.studentId}</span>
                      )}
                      {student.email && (
                        <span className="text-green-100/60 text-sm flex items-center gap-1">
                          <FiMail size={12} /> {student.email}
                        </span>
                      )}
                      {student.phone && (
                        <span className="text-green-100/60 text-sm flex items-center gap-1">
                          <FiPhone size={12} /> {student.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                      {getStatusBadge(student.status)}
                      {getProfileStatusBadge(userData?.profileVerificationStatus)}
                      {student.gender && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-white/15 text-white border-white/20">
                          {student.gender}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                    {student.selectedCourse?.title && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 text-center">
                        <FiBookOpen size={14} className="text-white/60 mx-auto mb-0.5" />
                        <p className="text-xs font-bold text-white truncate max-w-[80px]">{student.selectedCourse.title}</p>
                      </div>
                    )}
                    {student.currentClass && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 text-center">
                        <FiGrid size={14} className="text-white/60 mx-auto mb-0.5" />
                        <p className="text-xs font-bold text-white">{student.currentClass}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Information Sections using AdminDetailView */}
            <AdminDetailView entity={student} type="student" statusMaps={{
              userStatus: {
                active: { label: 'Active', variant: 'active' },
                inactive: { label: 'Inactive', variant: 'inactive' },
                graduated: { label: 'Graduated', variant: 'graduated' },
                suspended: { label: 'Suspended', variant: 'suspended' },
                transferred: { label: 'Transferred', variant: 'transferred' },
              },
              verification: {
                not_submitted: { label: 'Not Submitted', variant: 'not_submitted' },
                pending: { label: 'Pending', variant: 'pending' },
                verified: { label: 'Verified', variant: 'verified' },
                rejected: { label: 'Rejected', variant: 'rejected' },
                changes_requested: { label: 'Changes Required', variant: 'changes_requested' },
              },
            }} />

            {/* Assignment Date */}
            {student.createdAt && (
              <div className="mt-6 bg-gradient-to-r from-primary/5 to-primary/[0.02] rounded-2xl border border-primary/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FiCalendar size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-light">Assignment Date</p>
                    <p className="text-sm font-bold text-text-dark mt-0.5">
                      {formatDate(student.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section - Teacher can VIEW only */}
            {((student.educationalCertificates && student.educationalCertificates.length > 0) ||
              (student.additionalDocuments && student.additionalDocuments.length > 0)) && (
              <div className="mt-6">
                <h3 className="font-heading text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                  <FiFlag size={18} className="text-primary" />
                  Documents
                </h3>
                <div className="space-y-2">
                  {student.educationalCertificates?.map((doc, i) => {
                    const url = typeof doc === 'string' ? doc : doc?.url || '';
                    const name = typeof doc === 'string' ? `Certificate ${i + 1}` : doc?.name || `Certificate ${i + 1}`;
                    if (!url) return null;
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                        <span className="text-sm font-semibold text-text-dark">{name}</span>
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline px-3 py-1.5 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                          <FiEye size={12} /> View
                        </a>
                      </div>
                    );
                  })}
                  {student.additionalDocuments?.map((doc, i) => {
                    const url = typeof doc === 'string' ? doc : doc?.url || '';
                    const name = typeof doc === 'string' ? `Document ${i + 1}` : doc?.name || `Document ${i + 1}`;
                    if (!url) return null;
                    return (
                      <div key={`add-${i}`} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                        <span className="text-sm font-semibold text-text-dark">{name}</span>
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline px-3 py-1.5 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                          <FiEye size={12} /> View
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {(student.guardianName || student.guardianPhone) && (
              <div className="mt-6">
                <h3 className="font-heading text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                  <FiPhoneCall size={18} className="text-primary" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {student.guardianName && (
                    <div className="p-4 bg-bg-light rounded-xl">
                      <p className="text-xs font-bold uppercase tracking-wider text-text-light">Guardian Name</p>
                      <p className="text-sm font-bold text-text-dark mt-1">{student.guardianName}</p>
                    </div>
                  )}
                  {student.guardianPhone && (
                    <div className="p-4 bg-bg-light rounded-xl">
                      <p className="text-xs font-bold uppercase tracking-wider text-text-light">Guardian Phone</p>
                      <p className="text-sm font-bold text-text-dark mt-1">{student.guardianPhone}</p>
                    </div>
                  )}
                  {student.guardianRelation && (
                    <div className="p-4 bg-bg-light rounded-xl">
                      <p className="text-xs font-bold uppercase tracking-wider text-text-light">Relation</p>
                      <p className="text-sm font-bold text-text-dark mt-1 capitalize">{student.guardianRelation}</p>
                    </div>
                  )}
                  {student.guardianEmail && (
                    <div className="p-4 bg-bg-light rounded-xl">
                      <p className="text-xs font-bold uppercase tracking-wider text-text-light">Guardian Email</p>
                      <p className="text-sm font-bold text-text-dark mt-1">{student.guardianEmail}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-border-light px-6 sm:px-8 py-4 rounded-b-2xl">
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
