import { useState, useEffect, useCallback } from 'react';
import assignmentService from '../../services/assignmentService';
import teacherService from '../../services/teacherService';
import {
  FiUser, FiMail, FiBookOpen, FiBriefcase, FiCheck, FiX,
  FiChevronLeft, FiSearch, FiUsers, FiUserPlus, FiUserX,
  FiRefreshCw, FiEye, FiArrowRight, FiCheckSquare,
  FiSquare, FiCalendar, FiPhone, FiShield, FiClock,
  FiAlertTriangle, FiChevronRight, FiTrash2, FiBook,
} from 'react-icons/fi';

const STATUS_MAP = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  blocked: { label: 'Blocked', color: 'bg-gray-100 text-gray-800' },
};

const VERIFICATION_MAP = {
  not_submitted: { label: 'Not Submitted', color: 'bg-gray-100 text-gray-800' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  changes_requested: { label: 'Changes Required', color: 'bg-blue-100 text-blue-800' },
};

function Badge({ children, variant = 'default' }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent';
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    blocked: 'bg-gray-100 text-gray-800 border-gray-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    not_submitted: 'bg-gray-100 text-gray-800 border-gray-200',
    inactive: 'bg-orange-100 text-orange-800 border-orange-200',
    graduated: 'bg-blue-100 text-blue-800 border-blue-200',
    suspended: 'bg-red-100 text-red-800 border-red-200',
    complete: 'bg-green-100 text-green-800 border-green-200',
    incomplete: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return <span className={`${base} ${variants[variant] || variants.default}`}>{children}</span>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border-light">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Assign Modal ───────────────────────────────────
function AssignModal({ teacher, onClose, onSuccess }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'assigned'
  const [refreshKey, setRefreshKey] = useState(0);
  const [reassignModal, setReassignModal] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [viewStudentDetail, setViewStudentDetail] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);

  // Load teacher's officially assigned courses
  useEffect(() => {
    if (teacher?._id) {
      teacherService.getAssignedCourses(teacher._id).then((res) => {
        const data = res.data || {};
        setTeacherCourses(data.assignedCourses || []);
      }).catch(() => {});
    }
  }, [teacher?._id]);

  // Load eligible students (course-aware: only students whose courses match this teacher's assigned courses)
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await assignmentService.getEligibleStudents(teacher._id, params);
      const eligible = res.data?.students || [];

      // Exclude students already assigned to this teacher
      const assignedIds = new Set(assignedStudents.map((s) => s._id));
      const filtered = eligible.filter((s) => !assignedIds.has(s._id));

      setStudents(filtered);
    } catch (err) {
      setError(err.message || 'Failed to load eligible students');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, assignedStudents, teacher._id]);

  const loadAssignedStudents = useCallback(async () => {
    try {
      const res = await assignmentService.getAssignedStudents(teacher._id, { limit: 200 });
      setAssignedStudents(res.data?.students || []);
    } catch (_) {}
  }, [teacher._id]);

  useEffect(() => {
    loadAssignedStudents();
  }, [loadAssignedStudents]);

  useEffect(() => {
    if (activeTab === 'available') loadStudents();
  }, [activeTab, loadStudents, refreshKey]);

  useEffect(() => {
    if (!search && !statusFilter) return;
    const timer = setTimeout(() => {
      if (activeTab === 'available') loadStudents();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const toggleStudent = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s._id)));
    }
  };

  const handleAssign = async () => {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const studentIds = Array.from(selectedIds);
      const res = await assignmentService.bulkAssignStudents(teacher._id, studentIds);
      // Get actual result from backend response
      const result = res?.data || res;
      const totalAssigned = result?.totalAssigned ?? result?.results?.assigned?.length ?? studentIds.length;
      const skippedCount = (result?.results?.noCourseOverlap?.length || 0) + (result?.results?.skipped?.length || 0);
      const alreadyAssignedCount = result?.results?.alreadyAssigned?.length || 0;
      
      setSelectedIds(new Set());
      // Re-fetch assigned students, then trigger a refresh of available list
      await loadAssignedStudents();
      setRefreshKey((k) => k + 1);
      
      if (totalAssigned > 0) {
        setSuccessMsg(`${totalAssigned} student${totalAssigned !== 1 ? 's' : ''} assigned successfully`);
      } else if (skippedCount > 0 || alreadyAssignedCount > 0) {
        setError(`${skippedCount} student${skippedCount !== 1 ? 's' : ''} could not be assigned (no course overlap or validation issues). ${alreadyAssignedCount} already had a teacher.`);
      } else {
        setError('No students could be assigned. They may be ineligible or already assigned to a teacher.');
      }
      
      // Notify parent to refresh teacher assignment counts immediately
      if (onSuccess && totalAssigned > 0) onSuccess();
      setTimeout(() => { setSuccessMsg(null); setError(null); }, 5000);
    } catch (err) {
      setError(err.message || 'Failed to assign students');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (studentId) => {
    setSubmitting(true);
    setError(null);
    try {
      await assignmentService.removeStudent(teacher._id, studentId);
      setRemoveConfirm(null);
      await Promise.all([loadAssignedStudents(), loadStudents()]);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to remove student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async (newTeacherId, studentId) => {
    setSubmitting(true);
    setError(null);
    try {
      await assignmentService.reassignStudent(newTeacherId, studentId);
      setReassignModal(null);
      await Promise.all([loadAssignedStudents(), loadStudents()]);
    } catch (err) {
      setError(err.message || 'Failed to reassign student');
    } finally {
      setSubmitting(false);
    }
  };

  const user = teacher.user || {};
  const assignedCount = assignedStudents.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-8 pb-8 overflow-y-auto"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl mx-4 relative max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white z-10 border-b border-border-light px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-bg-light rounded-lg transition-colors text-text-light hover:text-text-dark">
              <FiChevronLeft size={20} />
            </button>
            <h2 className="font-heading text-xl font-bold text-text-dark">Assign Students</h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {successMsg && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
              <FiCheck size={16} />
              {successMsg}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <FiAlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* ── Teacher Profile Card ── */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/[0.02] rounded-2xl border border-primary/10 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* Photo */}
              <div className="flex-shrink-0">
                {teacher.profilePhoto ? (
                  <img src={teacher.profilePhoto} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-border-light" />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FiUser size={28} className="text-primary" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="font-heading text-lg font-bold text-text-dark">{teacher.fullName}</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-1.5">
                  {teacher.qualification && (
                    <span className="text-xs text-text-light flex items-center gap-1">
                      <FiBookOpen size={12} /> {teacher.qualification}
                    </span>
                  )}
                  {teacher.specialization && (
                    <span className="text-xs text-text-light flex items-center gap-1">
                      <FiBriefcase size={12} /> {teacher.specialization}
                    </span>
                  )}
                  {teacher.email && (
                    <span className="text-xs text-text-light flex items-center gap-1">
                      <FiMail size={12} /> {teacher.email}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                  <Badge variant={user?.status || 'pending'}>
                    {STATUS_MAP[user?.status]?.label || 'Pending'}
                  </Badge>
                  <Badge variant={user?.profileVerificationStatus || 'not_submitted'}>
                    {VERIFICATION_MAP[user?.profileVerificationStatus]?.label || 'Not Submitted'}
                  </Badge>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <FiUsers size={12} /> {assignedCount} Student{assignedCount !== 1 ? 's' : ''}
                  </span>
                </div>
                {/* Assigned Courses */}
                {teacherCourses.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-3">
                    <span className="text-xs text-text-light font-medium mr-1">Courses:</span>
                    {teacherCourses.map((course, idx) => (
                      <span key={course._id || idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                      >
                        <FiBook size={10} />
                        {course.title || 'Course'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Stats */}
              <div className="flex sm:flex-col gap-3 justify-center">
                <div className="text-center px-3 py-2 bg-white rounded-lg border border-border-light">
                  <p className="text-xs text-text-light">Students</p>
                  <p className="text-lg font-bold text-primary">{assignedCount}</p>
                </div>
                <div className="text-center px-3 py-2 bg-white rounded-lg border border-border-light">
                  <p className="text-xs text-text-light">Courses</p>
                  <p className="text-lg font-bold text-blue-600">{teacherCourses.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabs: Available / Assigned ── */}
          <div className="flex gap-1 bg-bg-light rounded-xl p-1">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'available'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-light hover:text-text-dark'
              }`}
            >
              <FiUserPlus size={16} />
              Available Students
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'assigned'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-light hover:text-text-dark'
              }`}
            >
              <FiUsers size={16} />
              Assigned Students ({assignedCount})
            </button>
          </div>

          {/* ════════════════════════════════════════════
              TAB: AVAILABLE STUDENTS
          ════════════════════════════════════════════ */}
          {activeTab === 'available' && (
            <div className="space-y-4">
              {/* Search & Filters - Course-aware filtering is handled by the backend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16} />
                  <input
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students by name, email, phone..."
                    className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>

              {/* Select All + Assign button */}
              {students.length > 0 && (
                <div className="flex items-center justify-between">
                  <button onClick={selectAll} className="flex items-center gap-2 text-sm font-semibold text-text-body hover:text-primary transition-colors">
                    {selectedIds.size === students.length ? (
                      <FiCheckSquare size={18} className="text-primary" />
                    ) : (
                      <FiSquare size={18} />
                    )}
                    {selectedIds.size === students.length ? 'Deselect All' : 'Select All'}
                    <span className="text-text-light font-normal">({students.length} students)</span>
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={selectedIds.size === 0 || submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {submitting ? (
                      <FiRefreshCw size={16} className="animate-spin" />
                    ) : (
                      <FiUserPlus size={16} />
                    )}
                    Assign Selected ({selectedIds.size})
                  </button>
                </div>
              )}

              {/* Students List */}
              {loading ? (
                <LoadingSkeleton />
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-bg-light rounded-full flex items-center justify-center">
                    <FiUser size={28} className="text-text-light" />
                  </div>
                  <h3 className="text-lg font-bold text-text-dark mb-1">No eligible students</h3>
                  <p className="text-sm text-text-light max-w-md mx-auto">
                    {search || statusFilter
                      ? 'Try adjusting your search or filters.'
                      : 'No students have selected courses matching this teacher\'s assigned courses. Students must select courses that match this teacher\'s official courses to be assignable.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {students.map((student) => {
                    const selected = selectedIds.has(student._id);
                    // Get matching course names (courses that overlap with teacher's courses)
                    const studentCourses = student.courses || [];
                    const matchingCourses = studentCourses.filter(
                      (c) => c.course && teacherCourses.some(tc => String(tc._id) === String(c.course._id))
                    );
                    return (
                      <div
                        key={student._id}
                        onClick={() => toggleStudent(student._id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border-light hover:border-primary/30 hover:bg-bg-light'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {selected ? (
                            <FiCheckSquare size={20} className="text-primary" />
                          ) : (
                            <FiSquare size={20} className="text-text-light" />
                          )}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {student.studentName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-dark text-sm truncate">{student.studentName}</p>
                          <p className="text-xs text-text-light truncate">
                            {[student.studentId, student.email, student.phone].filter(Boolean).join(' · ')}
                          </p>
                          {/* Course badges */}
                          {matchingCourses.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {matchingCourses.map((c, idx) => (
                                <span key={idx}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200"
                                >
                                  <FiBook size={9} />
                                  {c.course?.title || 'Course'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={student.status || 'active'}>
                            {student.status || 'Active'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB: ASSIGNED STUDENTS
          ════════════════════════════════════════════ */}
          {activeTab === 'assigned' && (
            <div className="space-y-4">
              {assignedStudents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-bg-light rounded-full flex items-center justify-center">
                    <FiUsers size={28} className="text-text-light" />
                  </div>
                  <h3 className="text-lg font-bold text-text-dark mb-1">No assigned students</h3>
                  <p className="text-sm text-text-light max-w-md mx-auto">
                    Switch to the "Available Students" tab to assign students to this teacher.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-t border-b-2 border-border-light">
                        <th className="text-left px-4 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Student</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden md:table-cell">Roll No</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden lg:table-cell">Course</th>
                        <th className="text-center px-4 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                        <th className="text-center px-4 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {assignedStudents.map((student) => (
                        <tr key={student._id} className="hover:bg-bg-light/80 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                {student.studentName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-text-dark text-sm truncate">{student.studentName}</p>
                                <p className="text-xs text-text-light truncate">{student.email || student.phone || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-text-body hidden md:table-cell">
                            {student.rollNumber || student.studentId || '-'}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-text-body hidden lg:table-cell">
                            {student.courses && student.courses.length > 0
                              ? student.courses.filter(c => c.course).map(c => c.course?.title).filter(Boolean).join(', ')
                              : student.selectedCourse?.title || student.course || '-'}
                          </td>
                          <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                            <Badge variant={student.status || 'active'}>
                              {student.status || 'Active'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setViewStudentDetail(student)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FiEye size={15} />
                              </button>
                              <button
                                onClick={() => setReassignModal({ student })}
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Reassign"
                              >
                                <FiArrowRight size={15} />
                              </button>
                              <button
                                onClick={() => setRemoveConfirm({ student })}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove"
                              >
                                <FiUserX size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── View Student Detail Modal ── */}
        {viewStudentDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            onClick={() => setViewStudentDetail(null)}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-text-dark">Student Details</h3>
                <button onClick={() => setViewStudentDetail(null)} className="text-text-light hover:text-text-dark text-xl">&times;</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {viewStudentDetail.studentName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-dark">{viewStudentDetail.studentName}</h4>
                    <p className="text-xs text-text-light">{viewStudentDetail.studentId || ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-bg-light rounded-xl">
                    <p className="text-xs text-text-light">Email</p>
                    <p className="text-sm font-semibold text-text-dark">{viewStudentDetail.email || 'Not provided'}</p>
                  </div>
                  <div className="p-3 bg-bg-light rounded-xl">
                    <p className="text-xs text-text-light">Phone</p>
                    <p className="text-sm font-semibold text-text-dark">{viewStudentDetail.phone || 'Not provided'}</p>
                  </div>
                  <div className="p-3 bg-bg-light rounded-xl">
                    <p className="text-xs text-text-light">Roll Number</p>
                    <p className="text-sm font-semibold text-text-dark">{viewStudentDetail.rollNumber || viewStudentDetail.studentId || '-'}</p>
                  </div>
                  <div className="p-3 bg-bg-light rounded-xl">
                    <p className="text-xs text-text-light">Status</p>
                    <p className="text-sm font-semibold text-text-dark capitalize">{viewStudentDetail.status || 'Active'}</p>
                  </div>
                  <div className="p-3 bg-bg-light rounded-xl">
                    <p className="text-xs text-text-light">Course</p>
                    <p className="text-sm font-semibold text-text-dark">{viewStudentDetail.selectedCourse?.title || '-'}</p>
                  </div>
                  <div className="p-3 bg-bg-light rounded-xl">
                    <p className="text-xs text-text-light">Country</p>
                    <p className="text-sm font-semibold text-text-dark">{viewStudentDetail.country || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewStudentDetail(null)}
                className="mt-6 w-full px-4 py-2.5 bg-bg-light text-text-body rounded-xl font-semibold hover:bg-border-light transition-colors text-sm">
                Close
              </button>
            </div>
          </div>
        )}

        {/* ── Reassign Modal ── */}
        {reassignModal && (
          <ReassignTeacherModal
            student={reassignModal.student}
            currentTeacher={teacher}
            onClose={() => setReassignModal(null)}
            onReassign={handleReassign}
            submitting={submitting}
          />
        )}

        {/* ── Remove Confirm Modal ── */}
        {removeConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            onClick={() => setRemoveConfirm(null)}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                <FiAlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-text-dark text-center mb-2">Remove Assignment?</h3>
              <p className="text-sm text-text-body text-center mb-6">
                Are you sure you want to remove <strong className="text-text-dark">{removeConfirm.student.studentName}</strong> from <strong className="text-text-dark">{teacher.fullName}</strong>'s assignment?
              </p>
              <div className="flex gap-3">
                <button onClick={() => handleRemove(removeConfirm.student._id)} disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors text-sm">
                  {submitting ? 'Removing...' : 'Remove'}
                </button>
                <button onClick={() => setRemoveConfirm(null)}
                  className="flex-1 px-4 py-2.5 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reassign Teacher Modal (Course-Aware) ───────────
function ReassignTeacherModal({ student, currentTeacher, onClose, onReassign, submitting }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeachers = async () => {
      setLoading(true);
      try {
        // Use course-aware endpoint to get only teachers with matching courses
        const params = { limit: 50 };
        if (search) params.search = search;
        const res = await assignmentService.getEligibleTeachers(student._id, params);
        const eligibleTeachers = res.data?.teachers || [];
        // Filter out current teacher
        setTeachers(eligibleTeachers.filter((t) => t._id !== currentTeacher._id));
      } catch (err) {
        setError(err.message || 'Failed to load eligible teachers');
      } finally {
        setLoading(false);
      }
    };
    loadTeachers();
  }, [search, currentTeacher._id, student._id]);

  const handleConfirm = () => {
    if (!selectedTeacher) return;
    onReassign(selectedTeacher._id, student._id);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-text-dark">Reassign Student</h3>
          <button onClick={onClose} className="text-text-light hover:text-text-dark text-xl">&times;</button>
        </div>

        <p className="text-sm text-text-body mb-4">
          Reassign <strong className="text-text-dark">{student.studentName}</strong> to a different teacher.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers by name..."
            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
          />
        </div>

        <div className="max-h-[250px] overflow-y-auto space-y-2 mb-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-text-light mt-2">Loading teachers...</p>
            </div>
          ) : teachers.length === 0 ? (
            <p className="text-center text-sm text-text-light py-8">No other eligible teachers found.</p>
          ) : (
            teachers.map((teacher) => (
              <div
                key={teacher._id}
                onClick={() => setSelectedTeacher(teacher)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedTeacher?._id === teacher._id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border-light hover:border-primary/30 hover:bg-bg-light'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {teacher.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-dark text-sm truncate">{teacher.fullName}</p>
                  <p className="text-xs text-text-light truncate">
                    {[teacher.qualification, teacher.specialization, teacher.email].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {selectedTeacher?._id === teacher._id && (
                  <FiCheck className="text-primary flex-shrink-0" size={18} />
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={!selectedTeacher || submitting}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm">
            {submitting ? 'Reassigning...' : 'Confirm Reassign'}
          </button>
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export: AdminAssignmentSection ────────────
export default function AdminAssignmentSection({ teacher, onClose }) {
  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FiUsers size={48} className="text-text-light mb-4" />
        <h3 className="text-lg font-bold text-text-dark mb-1">No teacher selected</h3>
        <p className="text-sm text-text-light">Select a teacher from the management panel to assign students.</p>
      </div>
    );
  }

  return <AssignModal teacher={teacher} onClose={onClose} onSuccess={onClose} />;
}
