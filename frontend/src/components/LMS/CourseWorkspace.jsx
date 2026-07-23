import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import teacherAcademicService from '../../services/teacherAcademicService';
import teacherPortalService from '../../services/teacherPortalService';
import studentPortalService from '../../services/studentPortalService';
import courseService from '../../services/courseService';
import YouTubeEmbed from './YouTubeEmbed';
import TabPlaceholder from './TabPlaceholder';
import CourseContent from './CourseContent';
import CourseAssignmentTab from './CourseAssignmentTab';
import CourseAttendanceTab from './CourseAttendanceTab';
import CourseResultsTab from './CourseResultsTab';
import CourseAnnouncementTab from './CourseAnnouncementTab';
import CourseStudentsTab from './CourseStudentsTab';
import {
  FiArrowLeft, FiBookOpen, FiClock, FiGlobe, FiUser, FiAward,
  FiBarChart2, FiFileText, FiCheckCircle, FiCalendar, FiBell,
  FiUsers, FiLayers, FiGrid, FiChevronDown,  FiTrendingUp, FiTarget,
  FiActivity,
} from 'react-icons/fi';

// ─── Tab Configuration ────────────────────────────────────────
const TEACHER_TABS = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'content', label: 'Course Content', icon: FiLayers },
  { id: 'assignments', label: 'Assignments', icon: FiFileText },
  { id: 'attendance', label: 'Attendance', icon: FiCheckCircle },
  { id: 'results', label: 'Results', icon: FiBarChart2 },
  { id: 'announcements', label: 'Announcements', icon: FiBell },
  { id: 'students', label: 'Students', icon: FiUsers },
];

const STUDENT_TABS = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'content', label: 'Course Content', icon: FiLayers },
  { id: 'assignments', label: 'Assignments', icon: FiFileText },
  { id: 'attendance', label: 'Attendance', icon: FiCheckCircle },
  { id: 'results', label: 'Results', icon: FiBarChart2 },
  { id: 'announcements', label: 'Announcements', icon: FiBell },
];

// ─── Level helpers ────────────────────────────────────────────
const levelDisplay = {
  beginner: { label: 'Beginner', classes: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Intermediate', classes: 'bg-blue-100 text-blue-800' },
  advanced: { label: 'Advanced', classes: 'bg-purple-100 text-purple-800' },
  all: { label: 'All Levels', classes: 'bg-indigo-100 text-indigo-800' },
};

// ─── Progress Placeholder ─────────────────────────────────────
function ProgressPlaceholder({ role }) {
  const isTeacher = role === 'teacher';
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border-light">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          {isTeacher ? (
            <FiTrendingUp className="w-5 h-5 text-primary" />
          ) : (
            <FiTarget className="w-5 h-5 text-primary" />
          )}
        </div>
        <div>
          <h3 className="font-heading font-bold text-text-dark">
            {isTeacher ? 'Course Progress' : 'My Progress'}
          </h3>
          <p className="text-xs text-text-light">
            {isTeacher
              ? 'Overall student progress across this course'
              : 'Your learning progress in this course'}
          </p>
        </div>
      </div>
      <div className="rounded-xl border-2 border-dashed border-border-light p-8 text-center">
        <FiActivity className="w-10 h-10 text-border-light mx-auto mb-3" />
        <p className="text-sm text-text-light font-medium">
          {isTeacher
            ? 'Student progress tracking will be available once modules and lessons are implemented.'
            : 'Your progress will be tracked here once course content is available.'}
        </p>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ course, role, assignedTeacherName, teacherProfileName, teacherQualification, enrolledCount }) {
  const courseData = course.course || course;
  const teacherName = assignedTeacherName || teacherProfileName || courseData.teacher || courseData.instructor || courseData.teacherName || '';

  // Stats cards - only show fields with actual data
  // enrolledCount is passed from the parent using the SAME display.enrolledCount as the Course Header
  const stats = useMemo(() => {
    const items = [];
    if (courseData.level) {
      const lvl = levelDisplay[courseData.level] || { label: courseData.level, classes: 'bg-gray-100 text-gray-800' };
      items.push({ label: 'Level', value: lvl.label, icon: FiBarChart2, color: lvl.classes, bg: lvl.classes.split(' ')[0] });
    }
    if (courseData.duration) {
      items.push({ label: 'Duration', value: courseData.duration, icon: FiClock, color: 'text-green-700 bg-green-100', bg: 'bg-green-100' });
    }
    if (courseData.language) {
      items.push({ label: 'Language', value: courseData.language, icon: FiGlobe, color: 'text-purple-700 bg-purple-100', bg: 'bg-purple-100' });
    }
    if (courseData.totalLessons > 0) {
      items.push({ label: 'Lessons', value: courseData.totalLessons, icon: FiBookOpen, color: 'text-orange-700 bg-orange-100', bg: 'bg-orange-100' });
    }
    if (courseData.certificateAvailable) {
      items.push({ label: 'Certificate', value: 'Yes', icon: FiAward, color: 'text-emerald-700 bg-emerald-100', bg: 'bg-emerald-100' });
    }
    if (enrolledCount !== undefined && enrolledCount >= 0) {
      items.push({ label: 'Enrolled', value: enrolledCount, icon: FiUsers, color: 'text-indigo-700 bg-indigo-100', bg: 'bg-indigo-100' });
    }
    return items;
  }, [courseData, enrolledCount]);

  return (
    <div className="space-y-6">
      {/* Teacher Info */}
      {teacherName && (
        <div className="bg-gradient-to-r from-primary/5 to-primary-dark/5 rounded-2xl p-5 sm:p-6 border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {teacherName.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-text-light font-medium uppercase tracking-wider">Assigned Teacher</p>
              <p className="font-bold text-text-dark text-lg">{teacherName}</p>
              {teacherQualification && (
                <p className="text-sm text-text-light">{teacherQualification}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Description */}
      {courseData.fullDescription && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border-light">
          <h3 className="font-heading text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
            <FiBookOpen className="w-5 h-5 text-primary" />
            About This Course
          </h3>
          <div className="prose prose-sm sm:prose-base max-w-none text-text-body leading-relaxed whitespace-pre-line">
            {courseData.fullDescription}
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`rounded-xl p-4 border ${stat.bg} bg-opacity-50 border-current/10`}>
                <Icon className={`w-5 h-5 mb-2 ${stat.color.split(' ')[0]}`} />
                <p className="text-lg sm:text-xl font-bold text-text-dark">{stat.value}</p>
                <p className="text-xs font-medium text-text-light mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Placeholder */}
      <ProgressPlaceholder role={role} />
    </div>
  );
}



// ─── Tab Content Router ────────────────────────────────────────
function TabContent({ tabId, course, role, assignedTeacherName, teacherProfileName, teacherQualification, students, enrolledCount, attendanceSummary, onNavigateTab }) {
  switch (tabId) {
    case 'overview':
      return (
        <OverviewTab
          course={course}
          role={role}
          assignedTeacherName={assignedTeacherName}
          teacherProfileName={teacherProfileName}
          teacherQualification={teacherQualification}
          enrolledCount={enrolledCount}
        />
      );
    case 'assignments':
      return (
        <CourseAssignmentTab
          course={course}
          role={role}
        />
      );
    case 'attendance':
      return (
        <CourseAttendanceTab
          course={course}
          role={role}
          students={students}
        />
      );
    case 'results':
      return (
        <CourseResultsTab
          course={course}
          role={role}
          students={students}
        />
      );
    case 'announcements':
      return (
        <CourseAnnouncementTab
          course={course}
          role={role}
        />
      );
    case 'students':
      return (
        <CourseStudentsTab
          course={course}
          role={role}
          students={students}
          attendanceSummary={attendanceSummary}
          onNavigateTab={onNavigateTab}
        />
      );
    case 'content':
      return (
        <CourseContent
          course={course}
          role={role}
        />
      );
    default:
      return <TabPlaceholder title="Coming Soon" description="This section is under development." />;
  }
}

// ─── Skeleton Loader ──────────────────────────────────────────
function WorkspaceSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg w-32" />
      <div className="h-48 sm:h-56 lg:h-64 bg-gray-200 rounded-2xl" />
      <div className="space-y-4 bg-white rounded-2xl p-6">
        <div className="h-8 bg-gray-200 rounded-lg w-2/3" />
        <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-4 bg-gray-200 rounded-lg w-full" />
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="h-10 bg-gray-200 rounded-xl w-28" />
        ))}
      </div>
    </div>
  );
}

// ─── Main CourseWorkspace Component ───────────────────────────
export default function CourseWorkspace({ role, courseId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [courseTotalStudents, setCourseTotalStudents] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileTabOpen, setMobileTabOpen] = useState(false);

  const userId = user?._id || user?.id;
  const tabs = useMemo(() => role === 'teacher' ? TEACHER_TABS : STUDENT_TABS, [role]);

  const fetchCourse = useCallback(async () => {
    if (!courseId || !userId) return;
    setLoading(true);
    setError(null);
    try {
      if (role === 'teacher') {
        // STEP 1: Fetch teacher profile to get the Teacher._id (not User._id)
        // This fixes the authorization issue where backend looks up Teacher by _id
        const profileRes = await teacherPortalService.getProfile();
        const teacherProfile = profileRes?.data || profileRes;
        const teacherId = teacherProfile?._id;

        if (!teacherId) {
          throw new Error('Teacher profile not found. Ensure you have completed your profile.');
        }

        // STEP 2: Use the Teacher._id to fetch course details
        const res = await teacherAcademicService.getCourseDetails(teacherId, courseId);
        const data = res?.data || res;

        setDashboardData({ teacherProfile, attendanceSummary: data?.attendanceSummary });
        setCourseData(data?.course || data || { _id: courseId });
        setCourseStudents(data?.students || []);
        setCourseTotalStudents(data?.totalStudents || (data?.students?.length || 0));
      } else {
        // Student: fetch dashboard to get courses and assigned teacher
        const res = await studentPortalService.getDashboard(userId);
        const data = res?.data || res;
        const courses = data?.courses || [];

        const found = courses.find(c => {
          const cd = c.course || c;
          return (cd._id === courseId || cd.id === courseId);
        });

        setDashboardData(data);

        // Enrich with full course data from published courses API
        // (dashboard only returns minimal fields: title, slug)
        let fullCourseData = found || { _id: courseId };
        try {
          const pubRes = await courseService.getPublishedCourses();
          const pubData = pubRes?.data?.data || [];
          const fullCourse = pubData.find(c => (c._id === courseId || c.id === courseId));
          if (fullCourse) {
            // Merge full published data with any existing enrollment data (status, progress, etc.)
            fullCourseData = {
              ...fullCourse,
              course: fullCourse,
              status: found?.status || fullCourse.status || 'active',
              progress: found?.progress || 0,
            };
            // Set the enrolled count from the published course's enrolledCount
            // This unifies the display logic with the teacher portal
            setCourseTotalStudents(fullCourse.enrolledCount);
          }
        } catch (_) {
          // If fetching published courses fails, use dashboard data as fallback
          console.warn('Could not fetch full course data, using dashboard data');
        }

        setCourseData(fullCourseData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [role, courseId, userId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    setActiveTab('overview');
    setMobileTabOpen(false);
  }, [courseId]);

  const handleBack = () => {
    const path = role === 'teacher' ? '/teacher/courses' : '/student/courses';
    navigate(path);
  };

  // ─── Derive display data ────────────────────────────────
  // courseTotalStudents is set in fetchCourse for BOTH roles:
  //   Teacher: from getCourseDetails.totalStudents (real assignment-based count)
  //   Student: from published course's enrolledCount (incremented on enrollment)
  const display = useMemo(() => {
    const base = courseData?.course || courseData || {};
    if (courseTotalStudents !== undefined && courseTotalStudents >= 0) {
      return { ...base, enrolledCount: courseTotalStudents };
    }
    return base;
  }, [courseData, courseTotalStudents]);

  // Assigned teacher name from the assignment relationship
  const assignedTeacherName = useMemo(() => {
    if (role === 'teacher') {
      // Teacher's own name from auth context
      return user?.fullName || user?.name || '';
    }
    // Student: from the dashboard's assignedTeacher object
    if (dashboardData?.assignedTeacher) {
      return dashboardData.assignedTeacher.fullName || '';
    }
    return '';
  }, [role, user, dashboardData]);

  const teacherProfileName = useMemo(() => {
    if (role === 'teacher' && dashboardData?.teacherProfile) {
      return dashboardData.teacherProfile.fullName || '';
    }
    return '';
  }, [role, dashboardData]);

  const teacherQualification = useMemo(() => {
    if (role === 'teacher' && dashboardData?.teacherProfile) {
      return dashboardData.teacherProfile.qualification || '';
    }
    if (dashboardData?.assignedTeacher?.qualification) {
      return dashboardData.assignedTeacher.qualification;
    }
    return '';
  }, [role, dashboardData]);

  // Stats for banner meta section - computed once
  const bannerMeta = useMemo(() => {
    const items = [];
    if (display.categoryName) {
      items.push({ label: display.categoryName, classes: 'bg-primary/10 text-primary' });
    }
    if (display.level) {
      const lvl = levelDisplay[display.level] || { label: display.level, classes: 'bg-gray-100 text-gray-800' };
      items.push({ label: lvl.label, classes: lvl.classes });
    }
    if (display.language) {
      items.push({ label: display.language, classes: 'bg-purple-100 text-purple-800', icon: FiGlobe });
    }
    if (display.duration) {
      items.push({ label: display.duration, classes: 'bg-green-100 text-green-800', icon: FiClock });
    }
    if (display.certificateAvailable) {
      items.push({ label: 'Certificate', classes: 'bg-emerald-100 text-emerald-800', icon: FiAward });
    }
    return items;
  }, [display]);

  const bannerTeacherName = assignedTeacherName || teacherProfileName || display.teacher || display.instructor || '';

  // ─── Error State ──────────────────────────────────────────
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <FiBookOpen className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="font-heading text-xl font-bold text-text-dark mb-2">Failed to Load Course</h3>
        <p className="text-text-light text-sm mb-6 max-w-md text-center">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={fetchCourse}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
          >
            Retry
          </button>
          <button
            onClick={handleBack}
            className="px-6 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light transition-colors text-sm"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading State ────────────────────────────────────────
  if (loading) {
    return <WorkspaceSkeleton />;
  }

  // ─── Empty State ──────────────────────────────────────────
  if (!display.title && !display.name) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FiBookOpen className="w-8 h-8 text-border-light" />
        </div>
        <h3 className="font-heading text-xl font-bold text-text-dark mb-2">Course Not Found</h3>
        <p className="text-text-light text-sm mb-6">This course could not be found.</p>
        <button
          onClick={handleBack}
          className="px-6 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light transition-colors text-sm"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  // ─── Render Workspace ─────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-text-light hover:text-text-dark transition-colors mb-4 sm:mb-6 group"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="text-sm font-medium">Back to Courses</span>
      </button>

      {/* ─── Course Header ────────────────────────────────── */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border-light mb-6">
        {/* Banner */}
        <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-primary-dark/20">
          {display.banner ? (
            <img
              src={display.banner}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0">
              <div className="absolute inset-0 opacity-[0.08]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,0 80,40 40,80 0,40' fill='none' stroke='rgba(11,79,48,0.4)' stroke-width='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px',
              }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

          {/* Thumbnail - bottom left on banner */}
          {display.thumbnail && (
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-white shadow-xl overflow-hidden bg-white">
              <img src={display.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
        </div>

        {/* Header Content */}
        <div className={`px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 ${display.thumbnail ? 'pt-4 sm:pt-6' : 'pt-6 sm:pt-8'}`}>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-dark leading-tight">
              {display.title || display.name}
            </h1>

            {/* Meta badges row */}
            {bannerMeta.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {bannerMeta.map((meta, idx) => {
                  const MetaIcon = meta.icon;
                  return (
                    <span key={idx} className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${meta.classes}`}>
                      {MetaIcon && <MetaIcon className="w-3 h-3" />}
                      {meta.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Teacher + Details row */}
            {(bannerTeacherName || display.totalLessons > 0 || (display.enrolledCount !== undefined && display.enrolledCount >= 0)) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-text-light">
                {bannerTeacherName && (
                  <span className="flex items-center gap-1.5">
                    <FiUser className="w-4 h-4" />
                    <span className="font-medium text-text-dark">{bannerTeacherName}</span>
                    {role === 'teacher' && (
                      <span className="hidden sm:inline text-text-light">(You)</span>
                    )}
                  </span>
                )}
                {display.totalLessons > 0 && (
                  <span className="flex items-center gap-1.5">
                    <FiBookOpen className="w-4 h-4" />
                    <span>{display.totalLessons} {display.totalLessons === 1 ? 'Lesson' : 'Lessons'}</span>
                  </span>
                )}
                {display.enrolledCount !== undefined && display.enrolledCount >= 0 && (
                  <span className="flex items-center gap-1.5">
                    <FiUsers className="w-4 h-4" />
                    <span>{display.enrolledCount} Enrolled</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Short Description */}
          {display.shortDescription && (
            <p className="mt-4 text-sm sm:text-base text-text-body leading-relaxed max-w-3xl">
              {display.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* ─── Intro Video ──────────────────────────────────── */}
      {display.introVideoUrl && (
        <div className="mb-6">
          <YouTubeEmbed url={display.introVideoUrl} />
        </div>
      )}

      {/* ─── Responsive Tabs ──────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden">
        {/* Mobile Tab Selector (accordion dropdown) */}
        <div className="sm:hidden border-b border-border-light">
          <button
            onClick={() => setMobileTabOpen(!mobileTabOpen)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-2">
              {(() => {
                const activeTabConfig = tabs.find(t => t.id === activeTab);
                if (!activeTabConfig) return null;
                const Icon = activeTabConfig.icon;
                return <Icon className="w-5 h-5 text-primary" />;
              })()}
              <span className="font-semibold text-text-dark text-sm">
                {tabs.find(t => t.id === activeTab)?.label || 'Overview'}
              </span>
            </div>
            <FiChevronDown className={`w-5 h-5 text-text-light transition-transform ${mobileTabOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileTabOpen && (
            <div className="px-3 pb-3 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMobileTabOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-text-body hover:bg-primary-light hover:text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop / Tablet Tabs (horizontal scrollable) */}
        <div className="hidden sm:flex border-b border-border-light overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 p-2 flex-nowrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-body hover:bg-primary-light hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <TabContent
            tabId={activeTab}
            course={courseData}
            role={role}
            assignedTeacherName={assignedTeacherName}
            teacherProfileName={teacherProfileName}
            teacherQualification={teacherQualification}
            students={courseStudents}
            enrolledCount={display.enrolledCount}
            attendanceSummary={dashboardData?.attendanceSummary}
            onNavigateTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}
