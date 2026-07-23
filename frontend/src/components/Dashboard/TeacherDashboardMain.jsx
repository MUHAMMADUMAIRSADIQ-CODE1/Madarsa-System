import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import teacherAcademicService from '../../services/teacherAcademicService';
import teacherPortalService from '../../services/teacherPortalService';
import attendanceService from '../../services/attendanceService';
import {
  FiBookOpen, FiUsers, FiCheckCircle, FiFileText, FiBell, FiBarChart2,
  FiCalendar, FiAward, FiClock, FiTrendingUp, FiTarget, FiEye,
  FiChevronRight, FiPlus, FiLoader, FiAlertCircle, FiRefreshCw,
  FiUser, FiArrowRight, FiStar, FiLayers,
} from 'react-icons/fi';

// ─── Helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return dateStr; }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch { return dateStr; }
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return parts.map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase();
}

function getAttendanceColor(pct) {
  if (pct == null) return 'text-gray-400 bg-gray-50';
  if (pct >= 80) return 'text-green-600 bg-green-50';
  if (pct >= 60) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

// ─── Stat Card ───────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 sm:p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color || 'bg-primary/10'} flex items-center justify-center group-hover:scale-105 transition-transform`}>
          <Icon className={`w-5 h-5 ${color ? color.split(' ')[0] || 'text-primary' : 'text-primary'}`} />
        </div>
        {trend != null && (
          <span className={`text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-text-dark">{value}</p>
      <p className="text-xs sm:text-sm text-text-light font-medium mt-0.5">{label}</p>
    </div>
  );
}

// ─── Course Card ─────────────────────────────────────────
function CourseCard({ course, onOpen, onStudents }) {
  const courseData = course.course || course;
  const thumbnail = courseData.thumbnail;
  const title = courseData.title || 'Untitled Course';
  const category = courseData.categoryName || courseData.level || '';
  const enrolledCount = course.enrolledCount || courseData.enrolledCount || 0;
  const status = course.status || courseData.status || 'active';

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative h-28 sm:h-32 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-primary-dark/20">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FiBookOpen className="w-10 h-10 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Status badge */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold border shadow-sm ${
          status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
          status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
          'bg-gray-100 text-gray-600 border-gray-200'
        }`}>
          {status}
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <h4 className="font-bold text-text-dark text-sm leading-snug group-hover:text-primary transition-colors line-clamp-1">{title}</h4>
        {category && (
          <p className="text-xs text-text-light mt-0.5">{category}</p>
        )}

        {/* Enrollment count */}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-text-light">
          <FiUsers className="w-3.5 h-3.5" />
          <span>{enrolledCount} student{enrolledCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onOpen?.(course)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all"
          >
            Open Course
          </button>
          <button
            onClick={() => onStudents?.(course)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-border-light text-xs font-semibold text-text-dark hover:bg-bg-light transition-all"
          >
            Students
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Item ───────────────────────────────────────
function ActivityItem({ icon: Icon, iconBg, iconColor, title, subtitle, time }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg-light/50 transition-colors">
      <div className={`w-9 h-9 rounded-lg ${iconBg || 'bg-primary/10'} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor || 'text-primary'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-dark truncate">{title}</p>
        {subtitle && <p className="text-xs text-text-light/70 mt-0.5 line-clamp-1">{subtitle}</p>}
      </div>
      <div className="flex-shrink-0 text-[11px] text-text-light/50 font-medium whitespace-nowrap">{time}</div>
    </div>
  );
}

// ─── Quick Action Button ─────────────────────────────────
function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3.5 sm:p-4 rounded-xl border border-border-light bg-white hover:shadow-sm hover:border-primary/20 transition-all group"
    >
      <div className={`w-9 h-9 rounded-lg ${color || 'bg-primary/10'} flex items-center justify-center group-hover:scale-105 transition-transform`}>
        <Icon className={`w-4 h-4 ${color ? color.split(' ')[0] || 'text-primary' : 'text-primary'}`} />
      </div>
      <span className="text-[11px] font-semibold text-text-dark text-center leading-tight">{label}</span>
    </button>
  );
}

// ─── Pending Work Card ───────────────────────────────────
function PendingItem({ icon: Icon, label, count, color, onClick }) {
  if (!count || count <= 0) return null;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border border-border-light hover:bg-bg-light/50 hover:border-primary/20 transition-all w-full text-left group"
    >
      <div className={`w-9 h-9 rounded-lg ${color || 'bg-amber-50'} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color ? color.split(' ')[0] || 'text-amber-600' : 'text-amber-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-dark">{label}</p>
        <p className="text-xs text-text-light/70">{count} item{count !== 1 ? 's' : ''} pending</p>
      </div>
      <span className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
        <FiChevronRight className="w-4 h-4" />
      </span>
    </button>
  );
}

// ─── Loading Skeleton ────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome skeleton */}
      <div className="h-40 sm:h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl" />
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-40 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded-lg" />
          {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────
function DashboardError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <FiAlertCircle className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="font-heading text-xl font-bold text-text-dark mb-2">Failed to Load Dashboard</h3>
      <p className="text-sm text-text-body/60 text-center max-w-md mb-6">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light hover:border-primary/30 hover:text-primary transition-all text-sm">
        <FiRefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function TeacherDashboardMain() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  // Data states
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teacherName = profile?.fullName || user?.fullName || user?.name || 'Teacher';
  const firstName = teacherName.split(' ')[0];

  // ─── Fetch all dashboard data ──────────────────────
  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      // Get teacher profile (Teacher._id) + User._id is 'userId' already
      const profileRes = await teacherPortalService.getProfile();
      const teacherProfile = profileRes?.data || profileRes;
      const teacherModelId = teacherProfile?._id;
      if (!teacherModelId) throw new Error('Teacher profile not found');
      setProfile(teacherProfile);

      // NOTE: Different APIs need different Ids:
      //   - courses: backend uses Teacher.findOne({ user: teacherId }) → needs User._id
      //   - analytics: backend uses Teacher.findById(teacherId) → works with Teacher._id
      //   - announcements/assignments/results: teacher field → varies by model

      // Fetch all data in parallel
      const [
        analyticsRes,
        coursesRes,
        announcementsRes,
        assignmentsRes,
        resultsRes,
        attendanceRes,
      ] = await Promise.allSettled([
        teacherAcademicService.getDashboardAnalytics(teacherModelId),
        // getAssignedCourses expects User._id for Teacher.findOne({ user: teacherId })
        teacherPortalService.getCourses(userId, { limit: 20 }),
        teacherAcademicService.getAnnouncements(userId, { limit: 5 }),
        teacherAcademicService.getAssignments(teacherModelId, { limit: 10 }),
        // Fetch ALL results (both draft + published) so we can count published correctly
        teacherAcademicService.getResults(userId, { limit: 50 }),

        // Fetch today's attendance records
        attendanceService.getTeacherAttendance(teacherModelId, { today: 'true', limit: 50 }),
      ]);

      if (analyticsRes.status === 'fulfilled') {
        const aData = analyticsRes.value?.data || analyticsRes.value;
        setAnalytics(aData);
      }
      if (coursesRes.status === 'fulfilled') {
        const cData = coursesRes.value?.data || coursesRes.value;
        setCourses(cData?.courses || []);
      }
      if (announcementsRes.status === 'fulfilled') {
        const aData = announcementsRes.value?.data || announcementsRes.value;
        setAnnouncements(aData?.announcements || []);
      }
      if (assignmentsRes.status === 'fulfilled') {
        const aData = assignmentsRes.value?.data || assignmentsRes.value;
        setAssignments(aData?.assignments || []);
      }
      if (resultsRes.status === 'fulfilled') {
        const rData = resultsRes.value?.data || resultsRes.value;
        setResults(rData?.results || []);
      }
      if (attendanceRes.status === 'fulfilled') {
        const aData = attendanceRes.value?.data || attendanceRes.value;
        setAttendanceRecords(aData?.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Compute real attendance percentage from fetched records ────
  const attendancePercentage = useMemo(() => {
    if (attendanceRecords.length === 0) return analytics?.attendancePercentage;
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    return Math.round((present / total) * 100);
  }, [attendanceRecords, analytics]);

  // ─── Published results count (filter from all results) ────
  const publishedResults = useMemo(() => {
    return results.filter(r => r.status === 'published' || r.isPublished === true);
  }, [results]);

  // ─── Derived data ──────────────────────────────────────
  const overviewCards = useMemo(() => {
    const a = analytics || {};
    return [
      // Use courses.length (what the list shows), NOT analytics.totalCourses (separate API call that may diverge)
      { icon: FiBookOpen, label: 'My Courses', value: courses.length || '—', color: 'bg-blue-50 text-blue-600' },
      { icon: FiUsers, label: 'Total Students', value: a.totalStudents ?? (courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0) || '—'), color: 'bg-green-50 text-green-600' },
      // Real attendance percentage from fetched attendance records
      { icon: FiCheckCircle, label: 'Avg Attendance', value: attendancePercentage != null ? `${attendancePercentage}%` : (a.attendancePercentage != null ? `${a.attendancePercentage}%` : '—'), color: getAttendanceColor(attendancePercentage) },
      { icon: FiFileText, label: 'Assignments', value: a.totalAssignments ?? assignments.length, color: 'bg-orange-50 text-orange-600' },
      { icon: FiBell, label: 'Announcements', value: a.totalAnnouncements ?? announcements.length, color: 'bg-purple-50 text-purple-600' },
      // Real published results count
      { icon: FiBarChart2, label: 'Published Results', value: publishedResults.length, color: 'bg-indigo-50 text-indigo-600' },
    ];
  }, [analytics, courses.length, assignments.length, announcements.length, publishedResults.length, attendancePercentage]);

  // Pending work
  const pendingWork = useMemo(() => {
    const items = [];
    // Draft announcements
    const draftAnnouncements = announcements.filter(a => !a.isPublished);
    if (draftAnnouncements.length > 0) {
      items.push({ icon: FiBell, label: 'Draft Announcements', count: draftAnnouncements.length, color: 'bg-amber-50 text-amber-600', onClick: () => navigate('/teacher/announcements') });
    }
    // Draft assignments
    const draftAssignments = assignments.filter(a => !a.isPublished);
    if (draftAssignments.length > 0) {
      items.push({ icon: FiFileText, label: 'Draft Assignments', count: draftAssignments.length, color: 'bg-orange-50 text-orange-600', onClick: () => navigate('/teacher/assignments') });
    }
    // Unpublished results (draft status)
    const unpublishedResults = results.filter(r => r.status !== 'published');
    if (unpublishedResults.length > 0) {
      items.push({ icon: FiBarChart2, label: 'Unpublished Results', count: unpublishedResults.length, color: 'bg-indigo-50 text-indigo-600', onClick: () => navigate('/teacher/results') });
    }
    // Courses with no attendance today
    if (courses.length > 0 && attendanceRecords.length === 0) {
      items.push({ icon: FiCheckCircle, label: 'Attendance Not Marked Today', count: courses.length, color: 'bg-red-50 text-red-600', onClick: () => navigate('/teacher/attendance') });
    }
    return items;
  }, [announcements, assignments, results, courses, attendanceRecords, navigate]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const items = [];
    // Published results
    results.forEach(r => {
      if (r.status === 'published') {
        items.push({
          icon: FiAward, iconBg: 'bg-green-50', iconColor: 'text-green-600',
          title: `Result published: ${r.examName || 'Exam'}`,
          subtitle: r.student?.studentName ? `For ${r.student.studentName}` : '',
          time: formatRelativeTime(r.publishedAt || r.createdAt),
          order: new Date(r.publishedAt || r.createdAt || 0).getTime(),
        });
      }
    });
    // Published announcements
    announcements.filter(a => a.isPublished).forEach(a => {
      items.push({
        icon: FiBell, iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
        title: `Announcement: ${a.title || 'Untitled'}`,
        subtitle: '',
        time: formatRelativeTime(a.publishedAt || a.createdAt),
        order: new Date(a.publishedAt || a.createdAt || 0).getTime(),
      });
    });
    // Recent assignments
    assignments.forEach(a => {
      items.push({
        icon: FiFileText, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
        title: a.isPublished ? `Assignment published: ${a.title}` : `Assignment drafted: ${a.title}`,
        subtitle: `Due ${formatDate(a.dueDate) || 'No date'}`,
        time: formatRelativeTime(a.createdAt),
        order: new Date(a.createdAt || 0).getTime(),
      });
    });
    // Recent attendance records (today)
    attendanceRecords.slice(0, 5).forEach(r => {
      items.push({
        icon: FiCheckCircle, iconBg: 'bg-green-50', iconColor: 'text-green-600',
        title: `Attendance marked: ${r.student?.studentName || 'Student'} - ${r.status}`,
        subtitle: r.course?.title ? `Course: ${r.course.title}` : '',
        time: formatRelativeTime(r.createdAt || r.classDate),
        order: new Date(r.createdAt || r.classDate || 0).getTime(),
      });
    });
    // Sort newest first
    items.sort((a, b) => b.order - a.order);
    return items.slice(0, 10);
  }, [results, announcements, assignments, attendanceRecords]);

  // ─── Handlers ──────────────────────────────────────────
  const handleOpenCourse = useCallback((course) => {
    const courseId = course._id || course.id || course.course?._id;
    navigate(`/teacher/my-courses/${courseId}`);
  }, [navigate]);

  const handleViewStudents = useCallback((course) => {
    const courseId = course._id || course.id || course.course?._id;
    navigate(`/teacher/my-courses/${courseId}?tab=students`);
  }, [navigate]);

  // ─── Render ────────────────────────────────────────────
  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError message={error} onRetry={fetchAll} />;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ═══ 1. Welcome Section ═══ */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-primary-dark rounded-2xl p-6 sm:p-8 md:p-10 text-white overflow-hidden relative shadow-xl">
        <div className="absolute top-0 right-0 opacity-[0.06]">
          <svg className="w-80 h-80" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="1" />
            <circle cx="200" cy="200" r="110" stroke="currentColor" strokeWidth="1" />
            <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="1" />
            <path d="M200 40 L280 80 L280 160 L200 200 L120 160 L120 80 Z" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30 shadow-lg bg-white/20">
              {profile?.profilePhoto ? (
                <img src={profile.profilePhoto} alt={teacherName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl md:text-2xl font-bold text-white">
                  {getInitials(teacherName)}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold">
                Welcome back, {firstName}
              </h1>
              <p className="text-green-100/80 text-sm sm:text-base mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <p className="text-green-100/60 text-sm max-w-xl leading-relaxed">
            Your dedication shapes the next generation. {courses.length > 0 ? `You're teaching ${courses.length} course${courses.length !== 1 ? 's' : ''} with purpose and passion.` : 'Stay organized and inspire your students every day.'}
          </p>
        </div>
      </div>

      {/* ═══ 2. Real-Time Overview Cards ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {overviewCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* ═══ 3+4+5+6+7: Main Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ─── LEFT COLUMN: My Courses + Activity ──── */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">

          {/* ═══ 3. My Courses Section ═══ */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FiBookOpen className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-text-dark">My Courses</h3>
              </div>
              {courses.length > 0 && (
                <button
                  onClick={() => navigate('/teacher/courses')}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-all"
                >
                  View All
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {courses.slice(0, 4).map((course, i) => (
                  <CourseCard
                    key={course._id || course.id || i}
                    course={course}
                    onOpen={handleOpenCourse}
                    onStudents={handleViewStudents}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-border-light p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <FiBookOpen className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-text-dark">No courses assigned yet</p>
                <p className="text-xs text-text-light/60 mt-1">Courses assigned by admin will appear here.</p>
              </div>
            )}
          </div>

          {/* ═══ 4. Recent Academic Activity ═══ */}
          <div className="bg-white rounded-xl border border-border-light overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border-light/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/10 to-primary-dark/10 flex items-center justify-center">
                  <FiClock className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-heading text-base font-bold text-text-dark">Recent Activity</h3>
              </div>
              {recentActivity.length > 0 && (
                <span className="text-[11px] text-text-light/50 font-medium">{recentActivity.length} activities</span>
              )}
            </div>
            <div className="p-2 sm:p-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 8).map((item, i) => (
                  <ActivityItem key={i} {...item} />
                ))
              ) : (
                <div className="py-8 text-center">
                  <FiClock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-text-light/60">No recent activity to show.</p>
                  <p className="text-xs text-text-light/40 mt-0.5">Your activities will appear here as you teach.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Performance + Quick Actions + Pending ──── */}
        <div className="space-y-5 sm:space-y-6">

          {/* ═══ 5. Performance Overview ═══ */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <FiTrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-heading text-base font-bold text-text-dark">Performance Overview</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: FiTarget, label: 'Avg Attendance', value: attendancePercentage != null ? `${attendancePercentage}%` : (analytics?.attendancePercentage != null ? `${analytics.attendancePercentage}%` : '—'), color: getAttendanceColor(attendancePercentage) },
                { icon: FiStar, label: 'Published Results', value: publishedResults.length, color: 'bg-indigo-50 text-indigo-600' },
                { icon: FiUsers, label: 'Active Students', value: analytics?.totalStudents ?? (courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0) || '—'), color: 'bg-green-50 text-green-600' },
                { icon: FiLayers, label: 'Active Courses', value: courses.length || '—', color: 'bg-blue-50 text-blue-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-bg-light/50 hover:bg-bg-light transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center`}>
                      <item.icon className={`w-3.5 h-3.5 ${item.color.split(' ')[0]}`} />
                    </div>
                    <span className="text-xs font-medium text-text-light">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-text-dark">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ 6. Quick Actions ═══ */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <FiArrowRight className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-heading text-base font-bold text-text-dark">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <QuickAction icon={FiBookOpen} label="My Courses" color="bg-blue-50 text-blue-600" onClick={() => navigate('/teacher/courses')} />
              <QuickAction icon={FiCheckCircle} label="Take Attendance" color="bg-green-50 text-green-600" onClick={() => navigate('/teacher/attendance')} />
              <QuickAction icon={FiBarChart2} label="Publish Result" color="bg-indigo-50 text-indigo-600" onClick={() => navigate('/teacher/results')} />
              <QuickAction icon={FiFileText} label="Create Assignment" color="bg-orange-50 text-orange-600" onClick={() => navigate('/teacher/assignments')} />
              <QuickAction icon={FiBell} label="Create Announcement" color="bg-purple-50 text-purple-600" onClick={() => navigate('/teacher/announcements')} />
              <QuickAction icon={FiUsers} label="View Students" color="bg-teal-50 text-teal-600" onClick={() => navigate('/teacher/students')} />
            </div>
          </div>

          {/* ═══ 7. Pending Work ═══ */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <FiClock className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-heading text-base font-bold text-text-dark">Pending Work</h3>
            </div>
            {pendingWork.length > 0 ? (
              <div className="space-y-2">
                {pendingWork.map((item, i) => (
                  <PendingItem key={i} {...item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-2">
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm font-semibold text-text-dark">All caught up!</p>
                <p className="text-xs text-text-light/60 mt-0.5 text-center">No pending items require your attention.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
