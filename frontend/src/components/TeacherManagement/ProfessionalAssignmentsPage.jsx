import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import teacherAcademicService from '../../services/teacherAcademicService';
import teacherPortalService from '../../services/teacherPortalService';
import AssignmentFormModal from '../LMS/AssignmentFormModal';
import AssignmentGradeModal from '../LMS/AssignmentGradeModal';
import { ResourceCard, InfoCard, PublishedBadge, hasResource, formatFullDate, formatDateTime } from '../LMS/CourseAssignmentTab';
import { toast } from 'react-toastify';
import {
  FiFileText, FiSearch, FiPlus, FiLoader, FiAlertCircle, FiRefreshCw,
  FiCheck, FiClock, FiCalendar, FiEye, FiEdit2, FiTrash2, FiEyeOff, FiX,
  FiAward, FiUsers, FiExternalLink, FiUpload, FiMessageSquare, FiCheckCircle,
} from 'react-icons/fi';

// ─── Helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return dateStr; }
}

// ─── Stat Card ───────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 sm:p-5 hover:shadow-md transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl ${color || 'bg-primary/10'} flex items-center justify-center mb-2`}>
        <Icon className={`w-5 h-5 ${color ? color.split(' ')[0] || 'text-primary' : 'text-primary'}`} />
      </div>
      <p className="text-2xl font-bold text-text-dark">{value}</p>
      <p className="text-xs text-text-light font-medium mt-0.5">{label}</p>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-xl w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-12 bg-gray-100 rounded-xl w-full" />
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function ProfessionalAssignmentsPage() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courses, setCourses] = useState([]);

  // Create/Edit modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [createCourseId, setCreateCourseId] = useState('');
  const [showCoursePicker, setShowCoursePicker] = useState(false);

  // View detail state
  const [viewAssignment, setViewAssignment] = useState(null);
  const [viewAssignmentLoading, setViewAssignmentLoading] = useState(false);

  // Grade modal state
  const [gradeSubmission, setGradeSubmission] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [profileRes, coursesRes] = await Promise.allSettled([
        teacherPortalService.getProfile(),
        teacherPortalService.getCourses(userId, { limit: 50 }),
      ]);
      let teacherId = null;
      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value?.data || profileRes.value;
        setProfile(p);
      }
      if (coursesRes.status === 'fulfilled') {
        const d = coursesRes.value?.data || coursesRes.value;
        setCourses(d?.courses || []);
      }
      if (userId) {
        const params = { limit: 100 };
        if (courseFilter !== 'all') params.course = courseFilter;
        const res = await teacherAcademicService.getAssignments(userId, params);
        const d = res?.data || res;
        setAssignments(d?.assignments || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [userId, courseFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    let list = [...assignments];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => (a.title || '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter(a => {
        const pub = a.isPublished || a.status === 'published';
        return statusFilter === 'published' ? pub : !pub;
      });
    }
    return list;
  }, [assignments, search, statusFilter]);

  const stats = useMemo(() => {
    const published = filtered.filter(a => a.isPublished || a.status === 'published').length;
    const draft = filtered.filter(a => !a.isPublished && a.status !== 'published').length;
    return { total: filtered.length, published, draft };
  }, [filtered]);

  const handleCreateClick = () => {
    if (courseFilter !== 'all') {
      setCreateCourseId(courseFilter);
      setShowCreate(true);
    } else {
      setCreateCourseId('');
      setShowCoursePicker(true);
    }
  };

  const handleConfirmCourse = () => {
    if (!createCourseId) {
      toast.error('Please select a course');
      return;
    }
    setShowCoursePicker(false);
    setEditAssignment(null);
    setShowCreate(true);
  };

  const handleEdit = (assignment) => {
    setEditAssignment(assignment);
    setCreateCourseId(assignment.course?._id || assignment.course?.id || assignment.course || '');
    setShowCreate(true);
  };

  const handleDelete = async (assignment) => {
    const id = assignment._id || assignment.id;
    if (!window.confirm(`Delete assignment "${assignment.title || 'Untitled'}"?`)) return;
    try {
      await teacherAcademicService.deleteAssignment(id);
      toast.success('Assignment deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleViewAssignment = async (assignment) => {
    setViewAssignment(assignment);
    setViewAssignmentLoading(true);
    try {
      const res = await teacherAcademicService.getAssignmentById(assignment._id || assignment.id);
      const d = res?.data || res;
      setViewAssignment(d);
    } catch {
      // Fallback to list data if detail fetch fails
      setViewAssignment(assignment);
    } finally {
      setViewAssignmentLoading(false);
    }
  };

  const handleTogglePublish = async (assignment) => {
    const id = assignment._id || assignment.id;
    const isPublished = assignment.isPublished || assignment.status === 'published';
    try {
      await teacherAcademicService.updateAssignment(id, { isPublished: !isPublished });
      toast.success(`Assignment ${isPublished ? 'unpublished' : 'published'}`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  if (loading) return <Skeleton />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <button onClick={fetchAll} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light transition-all text-sm">
          <FiRefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark">Assignments</h1>
          <p className="text-text-light text-sm mt-1">Manage assignments across all courses</p>
        </div>
        <button onClick={handleCreateClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
          <FiPlus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FiFileText} label="Total" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={FiCheck} label="Published" value={stats.published} color="bg-green-50 text-green-600" />
        <StatCard icon={FiClock} label="Drafts" value={stats.draft} color="bg-amber-50 text-amber-600" />
        <StatCard icon={FiCalendar} label="Active Courses" value={new Set(assignments.map(a => a.course?._id || a.course).filter(Boolean)).size} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/50" />
          <input type="text" placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
          <option value="all">All Courses</option>
          {courses.map(c => {
            const cd = c.course || c;
            return <option key={cd._id || cd.id} value={cd._id || cd.id}>{cd.title || 'Untitled'}</option>;
          })}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Assignments List */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="divide-y divide-border-light">
            {filtered.map((assignment) => {
              const isPublished = assignment.isPublished || assignment.status === 'published';
              return (
                <div key={assignment._id || assignment.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-bg-light/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPublished ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FiFileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-dark truncate">{assignment.title || 'Untitled'}</p>
                    <p className="text-xs text-text-light/70 truncate">
                      {assignment.course?.title || '—'} · Due: {formatDate(assignment.dueDate)} · {assignment.totalMarks || 0} marks
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold hidden sm:inline-block ${isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleViewAssignment(assignment)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" title="View">
                      <FiEye className="w-4 h-4 text-text-light/60" />
                    </button>
                    <button onClick={() => handleEdit(assignment)} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors" title="Edit">
                      <FiEdit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button onClick={() => handleTogglePublish(assignment)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" title={isPublished ? 'Unpublish' : 'Publish'}>
                      {isPublished ? <FiEyeOff className="w-4 h-4 text-amber-500" /> : <FiEye className="w-4 h-4 text-green-500" />}
                    </button>
                    <button onClick={() => handleDelete(assignment)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors" title="Delete">
                      <FiTrash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-border-light p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <FiFileText className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="font-heading text-lg font-bold text-text-dark mb-1">No assignments yet</h3>
          <button onClick={handleCreateClick} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
            <FiPlus className="w-4 h-4" /> Create Assignment
          </button>
        </div>
      )}

      {/* ─── Course Picker Modal ──────────────────────── */}
      {showCoursePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCoursePicker(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Select Course</h3>
            <p className="text-sm text-text-light mb-4">Choose the course for this assignment:</p>
            <select value={createCourseId} onChange={e => setCreateCourseId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-4">
              <option value="">— Select Course —</option>
              {courses.map(c => {
                const cd = c.course || c;
                return <option key={cd._id || cd.id} value={cd._id || cd.id}>{cd.title || 'Untitled'}</option>;
              })}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCoursePicker(false)} className="px-5 py-2.5 rounded-xl border border-border-light text-text-dark text-sm font-semibold hover:bg-bg-light transition-all">Cancel</button>
              <button onClick={handleConfirmCourse} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reuse existing AssignmentFormModal ───────── */}
      <AssignmentFormModal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setEditAssignment(null); }}
        onSave={fetchAll}
        courseId={createCourseId}
        teacherId={userId}
        editAssignment={editAssignment}
      />

      {/* ─── View Detail Modal ─────────────────────────── */}
      {viewAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setViewAssignment(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <div className="flex items-center gap-3 min-w-0">
                <PublishedBadge published={viewAssignment.isPublished} />
                <h3 className="font-heading font-bold text-text-dark text-lg truncate">{viewAssignment.title || 'Assignment Details'}</h3>
              </div>
              <button onClick={() => setViewAssignment(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light hover:text-text-dark hover:bg-bg-light transition-colors flex-shrink-0">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              {viewAssignment.description && (
                <div>
                  <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-text-body bg-bg-light rounded-xl p-4 whitespace-pre-wrap">{viewAssignment.description}</p>
                </div>
              )}

              {/* Attachments / Resources */}
              {viewAssignment.attachments?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-2">Resources</p>
                  <ResourceCard attachments={viewAssignment.attachments} />
                </div>
              )}
              {viewAssignment.resourceUrl && !viewAssignment.attachments?.length && (
                <div>
                  <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-2">Resource Link</p>
                  <a href={viewAssignment.resourceUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-200/60 hover:border-purple-300 text-sm font-semibold text-primary transition-all">
                    <FiExternalLink className="w-4 h-4" />
                    Open Resource
                  </a>
                </div>
              )}

              {/* Submission Summary */}
              <div>
                <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-2">Submission Summary</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xl font-bold text-blue-600">{viewAssignment.submissions?.length || 0}</p>
                    <p className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-wider mt-0.5">Submitted</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xl font-bold text-amber-600">
                      {(() => {
                        const subs = viewAssignment.submissions || [];
                        const totalStudents = viewAssignment.totalStudents || 0;
                        const pending = Math.max(0, totalStudents - subs.length);
                        return pending || '—';
                      })()}
                    </p>
                    <p className="text-[10px] font-semibold text-amber-600/70 uppercase tracking-wider mt-0.5">Pending</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100">
                    <p className="text-xl font-bold text-green-600">
                      {viewAssignment.submissions?.filter(s => s.status === 'graded').length || 0}
                    </p>
                    <p className="text-[10px] font-semibold text-green-600/70 uppercase tracking-wider mt-0.5">Graded</p>
                  </div>
                </div>
              </div>

              {/* Student Submissions */}
              {viewAssignmentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-text-light">Loading submissions...</span>
                </div>
              ) : viewAssignment.submissions?.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiUsers className="w-4 h-4" />
                    Student Submissions
                    <span className="text-[10px] font-medium text-text-light/60">({viewAssignment.submissions.length})</span>
                  </p>
                  <div className="space-y-2">
                    {viewAssignment.submissions.map((sub, idx) => {
                      const studentName = sub.student?.studentName || `Student ${idx + 1}`;
                      const studentId = sub.student?.studentId || '';
                      const isGraded = sub.status === 'graded';
                      const isSub = sub.status === 'submitted';
                      const isLate = sub.status === 'late' || (isSub && sub.submittedAt && viewAssignment.dueDate && new Date(sub.submittedAt) > new Date(viewAssignment.dueDate));
                      const scorePct = isGraded && sub.score !== undefined && viewAssignment.totalMarks
                        ? Math.round((sub.score / viewAssignment.totalMarks) * 100) : 0;

                      return (
                        <div key={sub._id || idx} className="bg-white rounded-xl border border-border-light p-4 hover:shadow-sm hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer" onClick={() => setGradeSubmission(sub)}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary">{studentName.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-text-dark text-sm truncate">{studentName}</p>
                                <p className="text-xs text-text-light/70">{studentId || '—'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isGraded && (
                                <div className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-right">
                                  <span className="text-sm font-bold text-green-700">{sub.score}</span>
                                  <span className="text-[10px] text-green-500"> / {viewAssignment.totalMarks || 100}</span>
                                </div>
                              )}
                              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                                isGraded ? 'bg-green-100 text-green-700 border border-green-200' :
                                isSub && isLate ? 'bg-red-100 text-red-700 border border-red-200' :
                                isSub ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                                {isGraded ? <FiCheckCircle className="w-3 h-3" /> :
                                 isSub && isLate ? <FiClock className="w-3 h-3" /> :
                                 isSub ? <FiUpload className="w-3 h-3" /> :
                                 <FiClock className="w-3 h-3" />}
                                {isGraded ? 'Graded' : isSub && isLate ? 'Late' : isSub ? 'Submitted' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          {sub.submittedAt && (
                            <p className="mt-2 text-xs text-text-light/60 ml-[52px]">
                              Submitted {formatDateTime(sub.submittedAt)}
                            </p>
                          )}
                          {isGraded && sub.feedback && (
                            <div className="mt-2 ml-[52px] p-3 rounded-xl bg-blue-50/80 border border-blue-200/60">
                              <p className="text-[11px] font-bold text-blue-700 mb-1 flex items-center gap-1">
                                <FiMessageSquare className="w-3 h-3" /> Feedback
                              </p>
                              <p className="text-xs text-blue-800 leading-relaxed">{sub.feedback}</p>
                            </div>
                          )}
                          {isGraded && (
                            <div className="mt-2 ml-[52px]">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all" style={{ width: `${scorePct}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-green-600">{scorePct}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : viewAssignment.submissions && viewAssignment.submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 bg-white rounded-xl border border-dashed border-border-light">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <FiUsers className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-text-dark mb-1">No Submissions Yet</p>
                  <p className="text-xs text-text-light/60 text-center max-w-xs">Students haven&apos;t submitted anything for this assignment.</p>
                </div>
              ) : null}

              {/* Grade Modal */}
              <AssignmentGradeModal
                isOpen={!!gradeSubmission}
                onClose={() => setGradeSubmission(null)}
                onSave={async () => {
                  // Re-fetch assignment details to refresh submissions list
                  if (viewAssignment) {
                    try {
                      const res = await teacherAcademicService.getAssignmentById(viewAssignment._id || viewAssignment.id);
                      setViewAssignment(res?.data || res);
                    } catch { /* keep current data */ }
                  }
                }}
                submission={gradeSubmission}
                assignment={viewAssignment}
              />

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard icon={FiCalendar} iconBg="bg-blue-50" iconColor="text-blue-500" label="Course" value={viewAssignment.course?.title || '—'} />
                <InfoCard icon={FiClock} iconBg="bg-amber-50" iconColor="text-amber-500" label="Due Date" value={formatFullDate(viewAssignment.dueDate) || '—'} />
                <InfoCard icon={FiAward} iconBg="bg-purple-50" iconColor="text-purple-500" label="Total Marks" value={`${viewAssignment.totalMarks || 0}`} />
                <InfoCard icon={FiEye} iconBg={viewAssignment.isPublished ? 'bg-green-50' : 'bg-yellow-50'} iconColor={viewAssignment.isPublished ? 'text-green-500' : 'text-yellow-500'} label="Status" value={viewAssignment.isPublished ? 'Published' : 'Draft'} />
                <InfoCard icon={FiUsers} iconBg="bg-green-50" iconColor="text-green-500" label="Submissions Received" value={`${viewAssignment.submissions?.length || 0}`} />
                <InfoCard icon={FiCalendar} iconBg="bg-indigo-50" iconColor="text-indigo-500" label="Created" value={formatFullDate(viewAssignment.createdAt) || '—'} />
              </div>
              {viewAssignment.dueDate && new Date(viewAssignment.dueDate) < new Date() && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  <FiClock className="w-4 h-4 flex-shrink-0" />
                  This assignment is overdue
                </div>
              )}
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-border-light">
              <button onClick={() => setViewAssignment(null)} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
