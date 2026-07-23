import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentPortalService from '../../services/studentPortalService';
import attendanceService from '../../services/attendanceService';
import {
  FiBookOpen, FiCalendar, FiClipboard,
  FiAward, FiCheckCircle, FiUser, FiRefreshCw,
  FiClock, FiBell, FiTrendingUp,
  FiStar, FiTarget,
  FiChevronRight, FiEdit3,
  FiMapPin,
  FiPhone, FiMail,
  FiBook, FiZap,
} from 'react-icons/fi';

// ─── Helper Functions ────────────────────────────────────

function calcPercentage(obtained, total) {
  if (!total || total <= 0) return 0;
  return Math.round((obtained / total) * 100);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return null; }
}

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return null; }
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) {
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `Today • ${timeStr}`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateTime(dateStr);
  } catch {
    return '';
  }
}

function getDaysRemaining(dateStr) {
  if (!dateStr) return null;
  try {
    const due = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  } catch { return null; }
}

function getInitials(name) {
  if (!name) return 'S';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getGradeInfo(percentage) {
  if (percentage >= 90) return { grade: 'A+', label: 'Excellent', color: 'text-green-600 bg-green-50 border-green-200' };
  if (percentage >= 80) return { grade: 'A', label: 'Very Good', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (percentage >= 70) return { grade: 'B+', label: 'Good', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
  if (percentage >= 60) return { grade: 'B', label: 'Above Average', color: 'text-purple-600 bg-purple-50 border-purple-200' };
  if (percentage >= 50) return { grade: 'C', label: 'Average', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  if (percentage >= 40) return { grade: 'D', label: 'Below Average', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  return { grade: 'F', label: 'Needs Improvement', color: 'text-red-600 bg-red-50 border-red-200' };
}

// ─── Stat Card ─────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor || 'bg-primary/10'} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} className={color || 'text-primary'} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-light font-medium">{label}</p>
          <p className={`text-lg font-bold ${color || 'text-primary'} truncate`}>{value ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Components ─────────────────────────────────

function SectionSkeleton({ rows = 3 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-border-light p-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WelcomeSkeleton() {
  return (
    <div className="bg-gradient-to-r from-primary/30 via-primary-dark/30 to-primary-dark/30 rounded-2xl p-6 sm:p-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-white/20 rounded w-24" />
            <div className="h-7 bg-white/20 rounded w-48" />
            <div className="h-3 bg-white/20 rounded w-36" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[320px]">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/10 rounded-xl p-3">
              <div className="h-3 bg-white/10 rounded w-16 mb-2" />
              <div className="h-5 bg-white/10 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────

function DashboardEmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-gray-300" />
      </div>
      <h4 className="font-semibold text-text-dark text-sm mb-1">{title}</h4>
      <p className="text-xs text-text-body/70 text-center max-w-xs">{message}</p>
    </div>
  );
}

// ─── Course Card ─────────────────────────────────────────

function ContinueCourseCard({ courseData, index, onClick }) {
  const title = courseData.title || courseData.name || 'Course';
  const teacher = courseData.teacher || courseData.teacherName || courseData.instructor || '';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      className="group relative bg-white rounded-xl border border-border-light overflow-hidden transition-all duration-300 cursor-pointer
        hover:shadow-lg hover:-translate-y-1 hover:border-primary/30
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Banner */}
      <div className="relative h-32 sm:h-36 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-primary-dark/10">
        {courseData.banner ? (
          <img src={courseData.banner} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary-dark/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4">
        <h4 className="font-heading font-semibold text-text-dark text-sm leading-snug group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h4>

        {teacher && (
          <p className="text-[11px] text-text-light mt-1 flex items-center gap-1">
            <FiUser className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{teacher}</span>
          </p>
        )}

        {/* Divider + Continue */}
        <div className="mt-2.5 pt-2 border-t border-border-light flex items-center justify-between">
          <span className="text-[10px] text-text-light">{courseData.duration || 'Active'}</span>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary group-hover:gap-1 transition-all">
            Continue
            <FiChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Hover bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary-dark scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </article>
  );
}

// ─── Assignment Card ─────────────────────────────────────

function PendingAssignmentCard({ assignment, courseMap, onNavigate }) {
  const dueDate = assignment.dueDate;
  const daysRemaining = getDaysRemaining(dueDate);
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const courseTitle = courseMap[assignment.course?._id || assignment.course] || '';

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-sm ${
      isOverdue ? 'border-red-200 bg-red-50/30' : 'border-border-light hover:border-primary/20'
    }`}>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-text-dark text-sm leading-snug line-clamp-1">{assignment.title}</h4>
            {courseTitle && (
              <p className="text-[11px] text-text-light mt-0.5">{courseTitle}</p>
            )}
          </div>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap ${
            isOverdue ? 'bg-red-100 text-red-700' :
            daysRemaining !== null && daysRemaining <= 2 ? 'bg-amber-100 text-amber-700' :
            'bg-green-100 text-green-700'
          }`}>
            {isOverdue ? 'Overdue' : daysRemaining !== null ? `${daysRemaining}d left` : '—'}
          </span>
        </div>

        {dueDate && (
          <p className="text-[11px] text-text-light mt-1.5 flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            Due: {formatDate(dueDate)}
          </p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onNavigate?.(assignment.course?._id || assignment.course); }}
          className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition-colors text-xs"
        >
          <FiEdit3 className="w-3 h-3" />
          Submit
        </button>
      </div>
    </div>
  );
}

// ─── Result Card ─────────────────────────────────────────

function LatestResultCard({ result, onView }) {
  const totalMarks = result.totalMarks || 100;
  const obtained = result.obtainedMarks ?? result.score ?? 0;
  const percentage = calcPercentage(obtained, totalMarks);
  const gradeInfo = getGradeInfo(percentage);

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-sm hover:border-primary/20 transition-all duration-200 group">
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-text-dark text-sm leading-snug flex-1 min-w-0 line-clamp-1">
            {result.examName || result.title || 'Exam'}
          </h4>
          <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${gradeInfo.color}`}>
            <FiStar className="w-2.5 h-2.5" />
            {gradeInfo.grade}
          </span>
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-1.5 bg-bg-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                background: `linear-gradient(90deg, ${percentage >= 80 ? '#10b981' : percentage >= 60 ? '#6366f1' : percentage >= 40 ? '#f59e0b' : '#ef4444'}, ${percentage >= 80 ? '#059669' : percentage >= 60 ? '#4f46e5' : percentage >= 40 ? '#d97706' : '#dc2626'})`,
              }}
            />
          </div>
          <span className="text-xs font-semibold text-text-dark">{obtained}/{totalMarks}</span>
        </div>

        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border-light">
          <span className="text-[11px] text-text-light">{percentage}%</span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onView?.(result); }}
            onKeyDown={(e) => { if (e.key === 'Enter') onView?.(result); }}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:gap-1 transition-all cursor-pointer"
          >
            View Result
            <FiChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Announcement Card ───────────────────────────────────

function AnnouncementCard({ announcement, onRead }) {
  const hasResource = !!announcement.resourceLink;

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-sm hover:border-primary/20 transition-all duration-200 group">
      <div className="p-3.5">
        <div className="flex items-start gap-1.5 mb-1.5">
          {announcement.isPinned && (
            <FiMapPin className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
          )}
          <h4 className="font-medium text-text-dark text-sm leading-snug flex-1 min-w-0 line-clamp-1">
            {announcement.title}
          </h4>
        </div>

        {announcement.content && (
          <p className="text-[11px] text-text-body/70 line-clamp-2 leading-relaxed mb-2">
            {announcement.content}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-text-light min-w-0">
            {announcement.teacher?.fullName && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <FiUser className="w-2.5 h-2.5" />
                {announcement.teacher.fullName.split(' ')[0]}
              </span>
            )}
            {hasResource && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[9px] font-semibold border border-purple-100">
                Resource
              </span>
            )}
            <span className="truncate">{formatTimeAgo(announcement.createdAt)}</span>
          </div>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onRead?.(announcement); }}
            onKeyDown={(e) => { if (e.key === 'Enter') onRead?.(announcement); }}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:gap-1 transition-all cursor-pointer flex-shrink-0 ml-2"
          >
            Read
            <FiChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Teacher Card ────────────────────────────────────────

function MyTeacherCard({ teacher }) {
  if (!teacher) return null;
  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Gradient header with avatar */}
      <div className="bg-gradient-to-r from-primary via-primary-dark to-[#0a3d25] px-5 py-5 flex items-center gap-4">
        <div className="flex-shrink-0 relative">
          {teacher.profilePhoto ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/40 shadow-md">
              <img src={teacher.profilePhoto} alt={teacher.fullName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-white">{getInitials(teacher.fullName)}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-heading font-bold text-white text-sm truncate">{teacher.fullName}</h4>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            {teacher.qualification && (
              <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                <FiBook className="w-3 h-3" />
                {teacher.qualification}
              </span>
            )}
            {teacher.experience && (
              <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                {teacher.experience}yrs
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Subjects */}
        {teacher.subjects && teacher.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {teacher.subjects.slice(0, 3).map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary/5 text-primary rounded-lg text-[10px] font-medium">{s}</span>
            ))}
            {teacher.subjects.length > 3 && (
              <span className="text-[10px] text-text-light">+{teacher.subjects.length - 3} more</span>
            )}
          </div>
        )}

        {/* Contact */}
        <div className="space-y-1.5">
          {teacher.email && (
            <div className="flex items-center gap-2 text-[11px] text-text-light">
              <FiMail className="w-3 h-3 text-primary/60 flex-shrink-0" />
              <span className="truncate">{teacher.email}</span>
            </div>
          )}
          {teacher.phone && (
            <div className="flex items-center gap-2 text-[11px] text-text-light">
              <FiPhone className="w-3 h-3 text-primary/60 flex-shrink-0" />
              <span>{teacher.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Activity Item ───────────────────────────────────────

const ACTIVITY_ICONS = {
  assignment_submitted: { icon: FiEdit3, color: 'bg-blue-500' },
  result_published: { icon: FiAward, color: 'bg-green-500' },
  attendance_marked: { icon: FiCalendar, color: 'bg-purple-500' },
  announcement: { icon: FiBell, color: 'bg-amber-500' },
  course_enrolled: { icon: FiBookOpen, color: 'bg-primary' },
  default: { icon: FiClock, color: 'bg-gray-400' },
};

function getActivityConfig(type) {
  return ACTIVITY_ICONS[type] || ACTIVITY_ICONS.default;
}

function ActivityItem({ activity }) {
  const config = getActivityConfig(activity.type);
  const Icon = config.icon;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border-light/50 last:border-b-0">
      <div className={`w-7 h-7 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-dark font-medium">{activity.title}</p>
        <p className="text-[10px] text-text-light mt-0.5">{formatTimeAgo(activity.time || activity.date)}</p>
      </div>
    </div>
  );
}

// ─── Quick Action Button ─────────────────────────────────

function QuickActionBtn({ icon: Icon, label, onClick, color, bgColor }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 p-3 sm:p-3.5 rounded-xl border border-border-light hover:border-primary/30 hover:shadow-sm hover:bg-primary/[0.02] transition-all duration-200 group min-h-[80px]"
    >
      <div className={`w-9 h-9 rounded-lg ${bgColor || 'bg-primary/10'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-4.5 h-4.5" style={{ color: color || 'var(--color-primary)' }} />
      </div>
      <span className="text-[10px] font-semibold text-text-body text-center leading-tight">{label}</span>
    </button>
  );
}

// ─── Attendance Overview ─────────────────────────────────

function AttendanceOverview({ summary }) {
  const total = (summary.present || 0) + (summary.absent || 0) + (summary.late || 0) + (summary.leave || 0);
  const percentage = summary.percentage || (total > 0 ? Math.round(((summary.present || 0) / total) * 100) : 0);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              stroke={percentage >= 75 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={`${percentage} 100`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-text-dark">{percentage}%</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          <div className="text-center py-2 rounded-lg bg-green-50 border border-green-100">
            <p className="text-sm font-bold text-green-600">{summary.present || 0}</p>
            <p className="text-[9px] text-green-600/70 font-medium">Present</p>
          </div>
          <div className="text-center py-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-sm font-bold text-red-600">{summary.absent || 0}</p>
            <p className="text-[9px] text-red-600/70 font-medium">Absent</p>
          </div>
          <div className="text-center py-2 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-sm font-bold text-amber-600">{summary.late || 0}</p>
            <p className="text-[9px] text-amber-600/70 font-medium">Late</p>
          </div>
          <div className="text-center py-2 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-sm font-bold text-blue-600">{summary.leave || 0}</p>
            <p className="text-[9px] text-blue-600/70 font-medium">Leave</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ────────────────────────────

export default function StudentDashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-course data
  const [courseAssignments, setCourseAssignments] = useState({});
  const [courseResults, setCourseResults] = useState({});
  const [courseAnnouncements, setCourseAnnouncements] = useState({});
  const [attendanceDetail, setAttendanceDetail] = useState({});
  const [extraLoading, setExtraLoading] = useState(false);

  const studentId = user?._id || user?.id;

  // ─── Fetch Dashboard Data ────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await studentPortalService.getDashboard(studentId);
      const data = res?.data || res;
      setDashboardData(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
      return null;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // ─── Fetch Per-Course Data ───────────────────────────────

  const fetchCourseData = useCallback(async (data) => {
    if (!data?.courses?.length) return;
    setExtraLoading(true);

    const courses = data.courses;
    const courseIds = courses
      .map(e => e.course?._id || e._id || e.id)
      .filter(Boolean);

    const assignPromises = courseIds.map(id =>
      studentPortalService.getCourseAssignments(id)
        .then(r => ({ id, data: r?.data || [] }))
        .catch(() => ({ id, data: [] }))
    );

    const resultPromises = courseIds.map(id =>
      studentPortalService.getCourseResults(id)
        .then(r => ({ id, data: r?.data || [] }))
        .catch(() => ({ id, data: [] }))
    );

    const announcePromises = courseIds.map(id =>
      studentPortalService.getCourseAnnouncements(id)
        .then(r => ({ id, data: r?.data || [] }))
        .catch(() => ({ id, data: [] }))
    );

    let attendanceData = {};
    if (studentId) {
      try {
        const attRes = await attendanceService.getStudentAttendance(studentId, { month: new Date().getMonth() + 1, year: new Date().getFullYear() });
        attendanceData = attRes?.data?.stats || {};
      } catch (_) {}
    }

    const [assignResults, resultResults, announceResults] = await Promise.all([
      Promise.all(assignPromises),
      Promise.all(resultPromises),
      Promise.all(announcePromises),
    ]);

    const assignMap = {};
    assignResults.forEach(r => { assignMap[r.id] = r.data; });
    const resultMap = {};
    resultResults.forEach(r => { resultMap[r.id] = r.data; });
    const announceMap = {};
    announceResults.forEach(r => { announceMap[r.id] = r.data; });

    setCourseAssignments(assignMap);
    setCourseResults(resultMap);
    setCourseAnnouncements(announceMap);
    setAttendanceDetail(attendanceData);
    setExtraLoading(false);
  }, [studentId]);

  useEffect(() => {
    const init = async () => {
      const data = await fetchDashboard();
      if (data) {
        await fetchCourseData(data);
      }
    };
    init();
  }, [fetchDashboard, fetchCourseData]);

  // ─── Derived Data ────────────────────────────────────────

  const profile = dashboardData?.profile || {};
  const assignedTeacher = dashboardData?.assignedTeacher || null;
  const courses = dashboardData?.courses || [];
  const attendanceSummary = dashboardData?.attendanceSummary || { totalClasses: 0, attended: 0, percentage: 0 };

  const pendingAssignments = useMemo(() => {
    const all = [];
    Object.entries(courseAssignments).forEach(([courseId, assignList]) => {
      (assignList || []).forEach(a => {
        if (!a.mySubmission || a.mySubmission.status !== 'submitted') {
          all.push({ ...a, course: { _id: courseId } });
        }
      });
    });
    all.sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate) : new Date('9999');
      const db = b.dueDate ? new Date(b.dueDate) : new Date('9999');
      return da - db;
    });
    return all.slice(0, 5);
  }, [courseAssignments]);

  const latestResults = useMemo(() => {
    const all = [];
    Object.entries(courseResults).forEach(([courseId, resultList]) => {
      (resultList || []).forEach(r => {
        all.push({ ...r, course: { _id: courseId } });
      });
    });
    all.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db - da;
    });
    return all.slice(0, 5);
  }, [courseResults]);

  const latestAnnouncements = useMemo(() => {
    const all = [];
    Object.entries(courseAnnouncements).forEach(([courseId, announceList]) => {
      (announceList || []).forEach(a => {
        all.push({ ...a, course: { _id: courseId } });
      });
    });
    all.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db - da;
    });
    return all.slice(0, 5);
  }, [courseAnnouncements]);

  const recentActivity = useMemo(() => {
    const activities = [];
    Object.entries(courseAssignments).forEach(([, assignList]) => {
      (assignList || []).forEach(a => {
        if (a.mySubmission?.submittedAt) {
          activities.push({
            type: 'assignment_submitted',
            title: `Submitted: ${a.title}`,
            time: a.mySubmission.submittedAt,
            date: a.mySubmission.submittedAt,
          });
        }
      });
    });
    Object.entries(courseResults).forEach(([, resultList]) => {
      (resultList || []).forEach(r => {
        if (r.createdAt) {
          activities.push({
            type: 'result_published',
            title: `Result: ${r.examName || r.title || 'Exam'}`,
            time: r.createdAt,
            date: r.createdAt,
          });
        }
      });
    });
    Object.entries(courseAnnouncements).forEach(([, announceList]) => {
      (announceList || []).forEach(a => {
        if (a.createdAt) {
          activities.push({
            type: 'announcement',
            title: `New: ${a.title}`,
            time: a.createdAt,
            date: a.createdAt,
          });
        }
      });
    });
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    return activities.slice(0, 8);
  }, [courseAssignments, courseResults, courseAnnouncements]);

  const courseNameMap = useMemo(() => {
    const map = {};
    courses.forEach(e => {
      const c = e.course || e;
      const id = c._id || c.id;
      if (id) map[id] = c.title || c.name || '';
    });
    return map;
  }, [courses]);

  const upcomingDeadlines = useMemo(() => {
    return pendingAssignments.filter(a => {
      const days = getDaysRemaining(a.dueDate);
      return days !== null && days >= 0 && days <= 7;
    });
  }, [pendingAssignments]);

  const firstName = (profile.studentName || user?.fullName || user?.name || '').split(' ')[0] || 'Student';
  const fullName = profile.studentName || user?.fullName || user?.name || 'Student';
  const profilePhoto = user?.profilePhoto || profile.studentPhoto || '';
  const totalPublishedResults = latestResults.length;

  const goToCourse = (courseId) => {
    if (courseId) navigate(`/student/my-courses/${courseId}`);
  };

  // ─── Render ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <WelcomeSkeleton />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SectionSkeleton rows={3} /></div>
          <div><SectionSkeleton rows={4} /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <FiRefreshCw size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-text-dark mb-2">Something went wrong</h3>
        <p className="text-sm text-text-light text-center max-w-sm mb-5">{error}</p>
        <button onClick={fetchDashboard} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm">
          <FiRefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ═══════════════════════════════════════════════════════
          1. PREMIUM WELCOME HERO — Two-Column Layout
         ═══════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-[#0a3d25] rounded-2xl overflow-hidden shadow-xl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute -top-16 -right-16 w-64 h-64 sm:w-80 sm:h-80 opacity-[0.06]" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-emerald-300/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">

            {/* ── Left: Avatar + Greeting ── */}
            <div className="flex-1 flex items-center gap-4 sm:gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0 self-start sm:self-center">
                {profilePhoto ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg shadow-black/20">
                    <img src={profilePhoto} alt={fullName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg shadow-black/20">
                    <span className="text-xl sm:text-2xl font-bold text-white">{getInitials(fullName)}</span>
                  </div>
                )}
              </div>

              {/* Greeting */}
              <div className="min-w-0">
                <p className="text-emerald-300 text-xs sm:text-sm font-medium">Assalam o Alaikum</p>
                <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-white mt-0.5">{firstName}!</h1>
                <p className="text-emerald-100/70 text-xs sm:text-sm mt-1 max-w-md">
                  Welcome to your academic dashboard. Track your progress, manage assignments, and stay connected.
                </p>
                <p className="text-emerald-200/50 text-[11px] italic mt-1.5 hidden sm:block">
                  &ldquo;Seeking knowledge is an obligation upon every Muslim.&rdquo;
                </p>
              </div>
            </div>

            {/* ── Right: Summary Cards (2×2) ── */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full lg:w-auto lg:min-w-[280px]">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-3">
                <FiUser className="w-4 h-4 text-emerald-300 mb-1.5" />
                <p className="text-emerald-200/70 text-[10px] font-medium">Teacher</p>
                <p className="text-white font-bold text-sm mt-0.5 truncate">
                  {assignedTeacher ? assignedTeacher.fullName?.split(' ')[0] : '—'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-3">
                <FiBookOpen className="w-4 h-4 text-emerald-300 mb-1.5" />
                <p className="text-emerald-200/70 text-[10px] font-medium">Courses</p>
                <p className="text-white font-bold text-sm mt-0.5">{courses.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-3">
                <FiCalendar className="w-4 h-4 text-emerald-300 mb-1.5" />
                <p className="text-emerald-200/70 text-[10px] font-medium">Attendance</p>
                <p className="text-white font-bold text-sm mt-0.5">{attendanceSummary.percentage || 0}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-3">
                <FiCheckCircle className="w-4 h-4 text-emerald-300 mb-1.5" />
                <p className="text-emerald-200/70 text-[10px] font-medium">Status</p>
                <p className="text-white font-bold text-sm mt-0.5 capitalize">{profile.status || 'Active'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          2. ACADEMIC OVERVIEW
         ═══════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FiTrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-base font-bold text-text-dark">Academic Overview</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={FiBookOpen} label="My Courses" value={courses.length} color="text-primary" bgColor="bg-primary/10" />
          <StatCard icon={FiCalendar} label="Attendance" value={`${attendanceSummary.percentage || 0}%`} color="text-purple-600" bgColor="bg-purple-100" />
          <StatCard icon={FiClipboard} label="Pending Work" value={pendingAssignments.length} color="text-orange-600" bgColor="bg-orange-100" />
          <StatCard icon={FiAward} label="Results" value={totalPublishedResults} color="text-green-600" bgColor="bg-green-100" />
          <StatCard icon={FiBell} label="Announcements" value={latestAnnouncements.length} color="text-blue-600" bgColor="bg-blue-100" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN GRID: 2 columns on desktop
         ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

        {/* ─────────── LEFT COLUMN (2/3) ──────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* 3. CONTINUE LEARNING */}
          <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-text-dark text-sm sm:text-base flex items-center gap-2">
                <FiBookOpen className="w-4 h-4 text-primary" />
                Continue Learning
              </h3>
              {courses.length > 4 && (
                <button onClick={() => navigate('/student/courses')} className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5">
                  View All <FiChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.slice(0, 4).map((enrollment, i) => {
                  const courseData = enrollment.course || enrollment;
                  const courseId = courseData._id || courseData.id;
                  return (
                    <ContinueCourseCard
                      key={courseId || i}
                      courseData={courseData}
                      index={i}
                      onClick={() => goToCourse(courseId)}
                    />
                  );
                })}
              </div>
            ) : (
              <DashboardEmptyState
                icon={FiBookOpen}
                title="No Courses Yet"
                message="You are not enrolled in any courses yet. Contact the administration to get started."
              />
            )}
          </div>

          {/* 4. PENDING ASSIGNMENTS */}
          <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-text-dark text-sm sm:text-base flex items-center gap-2">
                <FiClipboard className="w-4 h-4 text-orange-500" />
                Pending Assignments
                {pendingAssignments.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold ml-1">{pendingAssignments.length}</span>
                )}
              </h3>
              {pendingAssignments.length > 3 && (
                <button onClick={() => navigate('/student/courses')} className="text-[11px] font-semibold text-primary hover:underline">View All</button>
              )}
            </div>

            {extraLoading ? (
              <SectionSkeleton rows={2} />
            ) : pendingAssignments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pendingAssignments.map((a, i) => (
                  <PendingAssignmentCard
                    key={a._id || i}
                    assignment={a}
                    courseMap={courseNameMap}
                    onNavigate={goToCourse}
                  />
                ))}
              </div>
            ) : (
              <DashboardEmptyState icon={FiCheckCircle} title="All Caught Up!" message="You have no pending assignments. Great work!" />
            )}
          </div>

          {/* 5. LATEST RESULTS */}
          <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-text-dark text-sm sm:text-base flex items-center gap-2">
                <FiAward className="w-4 h-4 text-green-500" />
                Latest Results
              </h3>
            </div>

            {extraLoading ? (
              <SectionSkeleton rows={2} />
            ) : latestResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {latestResults.map((r, i) => (
                  <LatestResultCard
                    key={r._id || i}
                    result={r}
                    onView={(result) => goToCourse(result.course?._id)}
                  />
                ))}
              </div>
            ) : (
              <DashboardEmptyState icon={FiAward} title="No Results Yet" message="Your exam results will appear here once they are published." />
            )}
          </div>

          {/* 6. LATEST ANNOUNCEMENTS */}
          <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-text-dark text-sm sm:text-base flex items-center gap-2">
                <FiBell className="w-4 h-4 text-blue-500" />
                Latest Announcements
              </h3>
            </div>

            {extraLoading ? (
              <SectionSkeleton rows={2} />
            ) : latestAnnouncements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {latestAnnouncements.map((a, i) => (
                  <AnnouncementCard
                    key={a._id || i}
                    announcement={a}
                    onRead={() => goToCourse(a.course?._id)}
                  />
                ))}
              </div>
            ) : (
              <DashboardEmptyState icon={FiBell} title="No Announcements" message="There are no announcements yet. Check back later." />
            )}
          </div>
        </div>

        {/* ─────────── RIGHT COLUMN (1/3) ────────────────── */}
        <div className="space-y-4">

          {/* 7. ATTENDANCE OVERVIEW */}
          <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 sm:p-5">
            <h3 className="font-heading font-semibold text-text-dark text-sm sm:text-base flex items-center gap-2 mb-3">
              <FiCalendar className="w-4 h-4 text-purple-500" />
              Attendance Overview
            </h3>
            <AttendanceOverview summary={attendanceDetail} />
          </div>

          {/* 8. MY TEACHER */}
          {assignedTeacher && <MyTeacherCard teacher={assignedTeacher} />}

          {/* 9. RECENT ACTIVITY */}
          <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 sm:p-5">
            <h3 className="font-heading font-semibold text-text-dark text-sm sm:text-base flex items-center gap-2 mb-2">
              <FiClock className="w-4 h-4 text-primary" />
              Recent Activity
            </h3>
            {extraLoading ? (
              <div className="py-4 text-center text-xs text-text-light">Loading...</div>
            ) : recentActivity.length > 0 ? (
              <div>
                {recentActivity.slice(0, 5).map((act, i) => (
                  <ActivityItem key={i} activity={act} />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <FiClock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-text-light">No recent activity</p>
              </div>
            )}
          </div>

          {/* 10. UPCOMING DEADLINES */}
          {upcomingDeadlines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 sm:p-5">
              <h3 className="font-heading font-semibold text-text-dark text-sm sm:text-base flex items-center gap-2 mb-3">
                <FiTarget className="w-4 h-4 text-rose-500" />
                Upcoming Deadlines
                <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold ml-0.5">{upcomingDeadlines.length}</span>
              </h3>
              <div className="space-y-1.5">
                {upcomingDeadlines.map((a, i) => {
                  const days = getDaysRemaining(a.dueDate);
                  return (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-text-dark truncate">{a.title}</p>
                        <p className="text-[10px] text-text-light mt-0.5">Due {formatDate(a.dueDate)}</p>
                      </div>
                      <span className="flex-shrink-0 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded ml-2">
                        {days}d
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 11. QUICK ACTIONS */}
          <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 sm:p-5">
            <h3 className="font-heading font-semibold text-text-dark text-sm sm:text-base flex items-center gap-2 mb-3">
              <FiZap className="w-4 h-4 text-primary" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <QuickActionBtn icon={FiBookOpen} label="Courses" onClick={() => navigate('/student/courses')} bgColor="bg-primary/10" color="#0b4f30" />
              <QuickActionBtn icon={FiClipboard} label="Assign" onClick={() => navigate('/student/courses')} bgColor="bg-orange-100" color="#ea580c" />
              <QuickActionBtn icon={FiAward} label="Results" onClick={() => navigate('/student/courses')} bgColor="bg-green-100" color="#16a34a" />
              <QuickActionBtn icon={FiBell} label="Updates" onClick={() => navigate('/student/courses')} bgColor="bg-blue-100" color="#2563eb" />
              <QuickActionBtn icon={FiCalendar} label="Attendance" onClick={() => navigate('/student/courses')} bgColor="bg-purple-100" color="#9333ea" />
              <QuickActionBtn icon={FiUser} label="Profile" onClick={() => navigate('/student/profile')} bgColor="bg-gray-100" color="#4b5563" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
