import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import teacherPortalService from '../../services/teacherPortalService';
import {
  FiBookOpen, FiUsers, FiSearch, FiChevronRight, FiLoader,
  FiAlertCircle, FiRefreshCw, FiGrid, FiList, FiLayers,
  FiCheckCircle, FiClock, FiCalendar, FiBarChart2,
} from 'react-icons/fi';

// ─── Helpers ─────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return dateStr; }
}

// ─── Stat Card ───────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 sm:p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl ${color || 'bg-primary/10'} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color ? color.split(' ')[0] || 'text-primary' : 'text-primary'}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-dark">{value}</p>
      <p className="text-xs text-text-light font-medium mt-0.5">{label}</p>
    </div>
  );
}

// ─── Course Card ─────────────────────────────────────────
function CourseCard({ course, onOpenCourse, onViewStudents }) {
  const cd = course.course || course;
  const courseId = cd._id || cd.id;
  const enrolledCount = course.enrolledCount || cd.enrolledCount || 0;
  const status = course.status || cd.status || 'active';

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="relative h-28 sm:h-32 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-primary-dark/20">
        {cd.thumbnail ? (
          <img src={cd.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FiBookOpen className="w-10 h-10 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold border shadow-sm ${
          status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
          status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
          status === 'inactive' ? 'bg-gray-100 text-gray-600 border-gray-200' :
          'bg-yellow-100 text-yellow-700 border-yellow-200'
        }`}>
          {status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-text-dark text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {cd.title || 'Untitled Course'}
        </h3>
        {cd.categoryName && (
          <p className="text-xs text-text-light mt-0.5">{cd.categoryName}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-text-light">
          <span className="flex items-center gap-1"><FiUsers className="w-3.5 h-3.5" />{enrolledCount} enrolled</span>
          {cd.level && <span className="capitalize">{cd.level}</span>}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onOpenCourse(courseId)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all"
          >
            Open Course
          </button>
          <button
            onClick={() => onViewStudents(courseId)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-border-light text-xs font-semibold text-text-dark hover:bg-bg-light transition-all"
          >
            Students
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────
function CoursesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-xl w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-10 bg-gray-100 rounded-xl w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function ProfessionalMyCoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCourses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await teacherPortalService.getCourses(userId, { limit: 50 });
      const data = res?.data || res;
      setCourses(data?.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // Filtered + searched courses
  const filtered = useMemo(() => {
    let list = [...courses];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => {
        const cd = c.course || c;
        return (cd.title || '').toLowerCase().includes(q);
      });
    }
    if (statusFilter !== 'all') {
      list = list.filter(c => (c.status || c.course?.status || 'active') === statusFilter);
    }
    return list;
  }, [courses, search, statusFilter]);

  const stats = useMemo(() => {
    const active = courses.filter(c => (c.status || c.course?.status || 'active') === 'active').length;
    const completed = courses.filter(c => (c.status || c.course?.status || 'active') === 'completed').length;
    const inactive = courses.filter(c => {
      const s = c.status || c.course?.status || 'active';
      return s !== 'active' && s !== 'completed';
    }).length;
    const totalStudents = courses.reduce((s, c) => s + (c.enrolledCount || c.course?.enrolledCount || 0), 0);
    return { total: courses.length, active, completed, inactive, totalStudents };
  }, [courses]);

  const handleOpenCourse = useCallback((courseId) => {
    navigate(`/teacher/my-courses/${courseId}`);
  }, [navigate]);

  const handleViewStudents = useCallback((courseId) => {
    navigate(`/teacher/my-courses/${courseId}?tab=students`);
  }, [navigate]);

  if (loading) return <CoursesSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="font-heading text-xl font-bold text-text-dark mb-2">Failed to Load Courses</h3>
        <p className="text-sm text-text-body/60 text-center max-w-md mb-6">{error}</p>
        <button onClick={fetchCourses} className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light hover:border-primary/30 transition-all text-sm">
          <FiRefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── Header ──────────────────────────────────── */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark">My Courses</h1>
        <p className="text-text-light text-sm mt-1">Manage all your assigned courses in one place</p>
      </div>

      {/* ─── Stats ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FiBookOpen} label="Total Courses" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={FiCheckCircle} label="Active" value={stats.active} color="bg-green-50 text-green-600" />
        <StatCard icon={FiClock} label="Completed" value={stats.completed} color="bg-purple-50 text-purple-600" />
        <StatCard icon={FiUsers} label="Total Students" value={stats.totalStudents} color="bg-amber-50 text-amber-600" />
      </div>

      {/* ─── Search & Filters ────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/50" />
          <input
            type="text"
            placeholder="Search courses by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* ─── Course Grid ─────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course, i) => (
            <CourseCard
              key={course._id || course.id || i}
              course={course}
              onOpenCourse={handleOpenCourse}
              onViewStudents={handleViewStudents}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-border-light p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <FiBookOpen className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="font-heading text-lg font-bold text-text-dark mb-1">
            {search || statusFilter !== 'all' ? 'No matching courses' : 'No courses assigned yet'}
          </h3>
          <p className="text-sm text-text-light/60">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Courses assigned by admin will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
}
