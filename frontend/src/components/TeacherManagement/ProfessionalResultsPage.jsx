import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import teacherAcademicService from '../../services/teacherAcademicService';
import teacherPortalService from '../../services/teacherPortalService';
import ResultFormModal from '../LMS/ResultFormModal';
import { toast } from 'react-toastify';
import {
  FiBarChart2, FiSearch, FiPlus, FiLoader, FiAlertCircle, FiRefreshCw,
  FiAward, FiCheck, FiClock, FiEye, FiEdit2, FiTrash2, FiX,
} from 'react-icons/fi';

// ─── Helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return dateStr; }
}

// ─── Detail Item (for view modal) ───────────────────────
function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-text-dark">{value}</p>
    </div>
  );
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
export default function ProfessionalResultsPage() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courses, setCourses] = useState([]);

  // Create/Edit modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editResult, setEditResult] = useState(null);
  const [createCourseId, setCreateCourseId] = useState('');
  const [createStudents, setCreateStudents] = useState([]);
  const [showCoursePicker, setShowCoursePicker] = useState(false);

  // View detail modal state
  const [viewResult, setViewResult] = useState(null);

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
        teacherId = p?._id;
      }
      if (coursesRes.status === 'fulfilled') {
        const d = coursesRes.value?.data || coursesRes.value;
        setCourses(d?.courses || []);
      }

      if (userId) {
        const res = await teacherAcademicService.getResults(userId, { limit: 100 });
        const d = res?.data || res;
        setResults(d?.results || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    let list = [...results];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => (r.examName || '').toLowerCase().includes(q));
    }
    if (courseFilter !== 'all') {
      list = list.filter(r => {
        const rc = r.course?._id || r.course?.id || r.course;
        return rc === courseFilter;
      });
    }
    if (statusFilter !== 'all') {
      list = list.filter(r => (r.status || (r.isPublished ? 'published' : 'draft')) === statusFilter);
    }
    return list;
  }, [results, search, courseFilter, statusFilter]);

  const stats = useMemo(() => {
    const published = results.filter(r => r.status === 'published' || r.isPublished).length;
    const draft = results.filter(r => r.status !== 'published' && !r.isPublished).length;
    return { total: results.length, published, draft };
  }, [results]);

  const handleCreateClick = () => {
    setShowCoursePicker(true);
    setCreateCourseId('');
  };

  const handleConfirmCourse = async () => {
    if (!createCourseId) {
      toast.error('Please select a course');
      return;
    }
    setShowCoursePicker(false);
    // Fetch enrolled students for the selected course so ResultFormModal can populate the student dropdown
    try {
      const res = await teacherPortalService.getStudents(userId, { course: createCourseId, limit: 200 });
      const d = res?.data || res;
      setCreateStudents(d?.students || []);
    } catch {
      setCreateStudents([]);
    }
    setEditResult(null);
    setShowCreate(true);
  };

  const handleEdit = (result) => {
    setEditResult(result);
    setCreateCourseId(result.course?._id || result.course?.id || result.course || '');
    setShowCreate(true);
  };

  const handleDelete = async (result) => {
    const id = result._id || result.id;
    if (!window.confirm(`Delete result "${result.examName || 'Untitled'}"?`)) return;
    try {
      await teacherAcademicService.deleteResult(id, userId);
      toast.success('Result deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
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
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark">Results</h1>
          <p className="text-text-light text-sm mt-1">Manage exam results across all courses</p>
        </div>
        <button onClick={handleCreateClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
          <FiPlus className="w-4 h-4" /> Create Result
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FiBarChart2} label="Total Results" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={FiCheck} label="Published" value={stats.published} color="bg-green-50 text-green-600" />
        <StatCard icon={FiClock} label="Drafts" value={stats.draft} color="bg-amber-50 text-amber-600" />
        <StatCard icon={FiAward} label="Exams" value={new Set(results.map(r => r.examName)).size} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/50" />
          <input type="text" placeholder="Search by exam name..." value={search} onChange={e => setSearch(e.target.value)}
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

      {/* Results List */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="divide-y divide-border-light">
            {filtered.map((result) => {
              const pct = result.totalMarks > 0 ? Math.round((result.obtainedMarks / result.totalMarks) * 100) : 0;
              const isPublished = result.status === 'published' || result.isPublished;
              return (
                <div key={result._id || result.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-bg-light/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPublished ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FiAward className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-dark truncate">{result.examName || 'Exam'}</p>
                    <p className="text-xs text-text-light/70 truncate">
                      {result.student?.studentName || '—'} · {result.course?.title || '—'} · {formatDate(result.examDate)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-sm font-bold text-text-dark">{result.obtainedMarks || 0}/{result.totalMarks || 0}</p>
                    <p className="text-xs font-semibold text-text-light">{pct}%</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold hidden sm:inline-block ${isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setViewResult(result)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" title="View">
                      <FiEye className="w-4 h-4 text-text-light/60" />
                    </button>
                    <button onClick={() => handleEdit(result)} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors" title="Edit">
                      <FiEdit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(result)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors" title="Delete">
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
            <FiBarChart2 className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="font-heading text-lg font-bold text-text-dark mb-1">No results yet</h3>
          <button onClick={handleCreateClick} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
            <FiPlus className="w-4 h-4" /> Create Result
          </button>
        </div>
      )}

      {/* ─── Course Picker Modal ──────────────────────── */}
      {showCoursePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCoursePicker(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Select Course</h3>
            <p className="text-sm text-text-light mb-4">Choose the course you want to create a result for:</p>
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

      {/* ─── Reuse existing ResultFormModal ──────────── */}
      <ResultFormModal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setEditResult(null); }}
        onSave={fetchAll}
        courseId={createCourseId}
        teacherId={userId}
        students={createStudents}
        editResult={editResult}
      />

      {/* ─── View Detail Modal ─────────────────────────── */}
      {viewResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setViewResult(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <h3 className="font-heading font-bold text-text-dark text-lg">{viewResult.examName || 'Result Details'}</h3>
              <button onClick={() => setViewResult(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light hover:text-text-dark hover:bg-bg-light transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${viewResult.percentage >= 90 ? 'bg-green-50 text-green-600' : viewResult.percentage >= 70 ? 'bg-blue-50 text-blue-600' : viewResult.percentage >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                  {viewResult.percentage || viewResult.totalMarks > 0 ? Math.round((viewResult.obtainedMarks / viewResult.totalMarks) * 100) : 0}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Student" value={viewResult.student?.studentName || '—'} />
                <DetailItem label="Course" value={viewResult.course?.title || '—'} />
                <DetailItem label="Exam Date" value={formatDate(viewResult.examDate)} />
                <DetailItem label="Status" value={viewResult.status || (viewResult.isPublished ? 'Published' : 'Draft')} />
                <DetailItem label="Obtained Marks" value={`${viewResult.obtainedMarks || 0}`} />
                <DetailItem label="Total Marks" value={`${viewResult.totalMarks || 0}`} />
              </div>
              {viewResult.remarks && (
                <div>
                  <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-1">Remarks</p>
                  <p className="text-sm text-text-body bg-bg-light rounded-lg p-3">{viewResult.remarks}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-border-light">
              <button onClick={() => setViewResult(null)} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Import FiX for the view modal ──────────── */}
    </div>
  );
}
