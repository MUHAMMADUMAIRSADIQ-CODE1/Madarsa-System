import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import teacherAcademicService from '../../services/teacherAcademicService';
import attendanceService from '../../services/attendanceService';
import teacherPortalService from '../../services/teacherPortalService';
import {
  FiUsers, FiSearch, FiX, FiChevronDown, FiChevronUp,
  FiChevronRight, FiArrowUp, FiArrowDown,
  FiUser, FiMail, FiCalendar, FiClock, FiAward,
  FiCheckCircle, FiTrendingUp, FiTarget, FiBookOpen,
  FiRefreshCw, FiLoader, FiAlertCircle,
  FiBarChart2, FiEye, FiStar,
} from 'react-icons/fi';

// ─── Helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return dateStr; }
}

function getInitials(name) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

function getStatusBadge(status) {
  switch ((status || 'active').toLowerCase()) {
    case 'active':
      return { label: 'Active', classes: 'bg-green-100 text-green-700 border-green-200' };
    case 'inactive':
      return { label: 'Inactive', classes: 'bg-gray-100 text-gray-600 border-gray-200' };
    case 'completed':
      return { label: 'Completed', classes: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'suspended':
      return { label: 'Suspended', classes: 'bg-red-100 text-red-700 border-red-200' };
    default:
      return { label: status || 'Active', classes: 'bg-green-100 text-green-700 border-green-200' };
  }
}

function getGradeInfo(percentage) {
  if (percentage == null) return null;
  if (percentage >= 90) return { grade: 'A+', color: 'text-green-600 bg-green-50' };
  if (percentage >= 80) return { grade: 'A', color: 'text-blue-600 bg-blue-50' };
  if (percentage >= 70) return { grade: 'B+', color: 'text-indigo-600 bg-indigo-50' };
  if (percentage >= 60) return { grade: 'B', color: 'text-purple-600 bg-purple-50' };
  if (percentage >= 50) return { grade: 'C', color: 'text-amber-600 bg-amber-50' };
  return { grade: 'F', color: 'text-red-600 bg-red-50' };
}

function calcPercentage(obtained, total) {
  if (!total || total <= 0) return null;
  return Math.round((obtained / total) * 100);
}

function getAttendanceColor(pct) {
  if (pct == null) return 'bg-gray-100 text-gray-600';
  if (pct >= 80) return 'bg-green-100 text-green-700 border-green-200';
  if (pct >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

// ─── Sub-Components ──────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 sm:p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${color || 'bg-primary/10'} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color ? color.split(' ')[0] || 'text-primary' : 'text-primary'}`} />
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-text-dark">{value}</p>
          <p className="text-xs sm:text-sm text-text-light font-medium">{label}</p>
          {sub && <p className="text-[11px] text-text-light/70 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = getStatusBadge(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function InfoCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-border-light hover:border-primary/20 hover:shadow-sm transition-all duration-200">
      <div className={`w-8 h-8 rounded-lg ${iconBg || 'bg-primary/10'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${iconColor || 'text-primary'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">{label}</p>
        <p className="text-sm font-semibold text-text-dark truncate mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

function Avatar({ photo, name, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl',
  };
  const cls = sizeClasses[size] || sizeClasses.md;

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={`${cls} rounded-full object-cover border-2 border-border-light flex-shrink-0`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center flex-shrink-0 border-2 border-border-light`}>
      <span className="font-bold text-primary">{getInitials(name)}</span>
    </div>
  );
}

// ─── Sort Controls ───────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'studentId', label: 'Student ID' },
  { value: 'enrolledAt', label: 'Recently Enrolled' },
];

function SortDropdown({ value, direction, onChange, onDirectionToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-light text-xs font-semibold text-text-dark hover:bg-bg-light transition-all"
      >
        <span>Sort: {SORT_OPTIONS.find(o => o.value === value)?.label || 'Name'}</span>
        {open ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-border-light shadow-xl z-20 py-1 animate-pop-down overflow-hidden">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-left transition-colors ${
                value === opt.value ? 'bg-primary/10 text-primary' : 'text-text-body hover:bg-bg-light'
              }`}
            >
              {value === opt.value && <FiCheckCircle className="w-3.5 h-3.5 text-primary" />}
              <span className={value === opt.value ? 'font-semibold' : ''}>{opt.label}</span>
            </button>
          ))}
          <div className="border-t border-border-light/50 my-1" />
          <button
            onClick={() => { onDirectionToggle(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-text-body hover:bg-bg-light transition-colors"
          >
            {direction === 'asc' ? <FiArrowUp className="w-3.5 h-3.5" /> : <FiArrowDown className="w-3.5 h-3.5" />}
            <span>{direction === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Student Profile Drawer ──────────────────────────────
function StudentProfileDrawer({ student, courseId, onClose, onNavigateTab }) {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [attendanceStats, setAttendanceStats] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setDrawerLoading(true);
      try {
        // ── Step 1: Get teacher profile for Teacher._id (needed by Attendance model) ──
        let teacherModelId = userId;
        try {
          const profileRes = await teacherPortalService.getProfile();
          const teacherProfile = profileRes?.data || profileRes;
          if (teacherProfile?._id) {
            teacherModelId = teacherProfile._id;
          }
        } catch (_) { /* use userId as fallback */ }

        // No results container needed — setting state directly per API

        // ── Step 2: Attendance — uses Teacher._id (Attendance.teacher refs Teacher) ──
        try {
          const attRes = await attendanceService.getTeacherAttendance(teacherModelId, {
            course: courseId,
            student: student._id,
            limit: 500,
          });
          const attData = attRes?.data || attRes;
          const attRecords = attData?.data || [];
          const total = attRecords.length;
          let present = 0, absent = 0, late = 0, excused = 0;
          attRecords.forEach(r => {
            if (r.status === 'present') present++;
            else if (r.status === 'absent') absent++;
            else if (r.status === 'late') late++;
            else if (r.status === 'excused') excused++;
          });
          if (!cancelled) setAttendanceStats({ total, present, absent, late, excused });
        } catch (_) { /* attendance not available */ }

        // ── Step 3: Latest Result — uses User._id (Result.teacher refs User) ──
        try {
          const resRes = await teacherAcademicService.getResults(userId, {
            course: courseId,
            student: student._id,
            limit: 1,
          });
          const resData = resRes?.data || resRes;
          const resultsList = resData?.results || [];
          if (resultsList.length > 0 && !cancelled) {
            setLatestResult(resultsList[0]);
          }
        } catch (_) { /* results not available */ }

        // ── Step 4: Assignments Submitted — count this student's submissions ──
        try {
          const assignRes = await teacherAcademicService.getAssignments(userId, {
            course: courseId,
            limit: 100,
          });
          const assignData = assignRes?.data || assignRes;
          const assignments = assignData?.assignments || [];
          let submitted = 0;
          assignments.forEach(a => {
            const subs = a.submissions || [];
            if (subs.some(s => {
              const sid = s.student?._id || s.student;
              return sid && sid.toString() === student._id.toString();
            })) {
              submitted++;
            }
          });
          if (!cancelled) setSubmissionCount(submitted);
        } catch (_) { /* assignments not available */ }

        // ── Step 5: Announcements Count — count published announcements for this course ──
        try {
          const annRes = await teacherAcademicService.getCourseAnnouncements(courseId);
          const annData = annRes?.data || annRes;
          const announcements = Array.isArray(annData) ? annData : (annData?.announcements || annData?.data || []);
          if (!cancelled) setAnnouncementCount(announcements.length);
        } catch (_) { /* announcements not available */ }
      } catch (_) { /* data fetching failed */ }
      if (!cancelled) setDrawerLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [student._id, courseId, userId]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-border-light overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border-light z-10">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <FiUser className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-text-dark text-sm">Student Profile</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light/50 hover:text-text-dark hover:bg-bg-light transition-all"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center py-4">
            <Avatar photo={student.studentPhoto} name={student.studentName} size="xl" />
            <h2 className="font-heading font-bold text-text-dark text-xl mt-4">{student.studentName || 'Unnamed Student'}</h2>
            {student.studentId && (
              <p className="text-sm text-text-light font-mono mt-1">{student.studentId}</p>
            )}
            <div className="mt-3">
              <StatusBadge status={student.status} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light flex items-center gap-2">
              <FiUser className="w-3.5 h-3.5 text-primary/60" />
              Contact Information
            </h4>
            <InfoCard icon={FiMail} iconBg="bg-blue-50" iconColor="text-blue-500" label="Email" value={student.email || '—'} />
            {student.phone && (
              <InfoCard icon={FiMail} iconBg="bg-green-50" iconColor="text-green-500" label="Phone" value={student.phone} />
            )}
          </div>

          {/* Attendance Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light flex items-center gap-2">
              <FiCalendar className="w-3.5 h-3.5 text-primary/60" />
              Attendance Summary
            </h4>
            {drawerLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
              </div>
            ) : attendanceStats && attendanceStats.total > 0 ? (
              <>
                {/* Colored percentage badge */}
                {(() => {
                  const pct = Math.round(((attendanceStats.present + (attendanceStats.late || 0)) / Math.max(1, attendanceStats.total)) * 100);
                  const color = getAttendanceColor(pct);
                  return (
                    <div className={`p-4 rounded-xl border ${color} bg-opacity-30 text-center mb-3`}>
                      <p className="text-2xl sm:text-3xl font-black">{pct}%</p>
                      <p className="text-xs font-semibold uppercase tracking-wider mt-0.5">
                        {pct >= 80 ? 'Excellent Attendance' : pct >= 60 ? 'Fair Attendance' : 'Needs Improvement'}
                      </p>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                    <p className="text-[11px] font-semibold uppercase text-green-600">Present</p>
                    <p className="text-lg font-bold text-green-800 mt-1">{attendanceStats.present}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-[11px] font-semibold uppercase text-red-600">Absent</p>
                    <p className="text-lg font-bold text-red-800 mt-1">{attendanceStats.absent}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-[11px] font-semibold uppercase text-amber-600">Late</p>
                    <p className="text-lg font-bold text-amber-800 mt-1">{attendanceStats.late}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[11px] font-semibold uppercase text-blue-600">Leave</p>
                    <p className="text-lg font-bold text-blue-800 mt-1">{attendanceStats.excused}</p>
                  </div>
                </div>
                {attendanceStats.total > 0 && (
                  <div className="p-3 rounded-xl bg-white border border-border-light">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-text-light">Overall Attendance</span>
                      <span className="text-sm font-bold text-primary">
                        {Math.round(((attendanceStats.present + (attendanceStats.late || 0)) / Math.max(1, attendanceStats.total)) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.round(((attendanceStats.present + (attendanceStats.late || 0)) / Math.max(1, attendanceStats.total)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <InfoCard icon={FiClock} iconBg="bg-gray-50" iconColor="text-gray-400" label="Attendance" value="No records yet" />
            )}

            {/* Navigate to Attendance tab */}
            <button
              onClick={() => { onNavigateTab?.('attendance'); onClose?.(); }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-xs font-semibold text-text-dark hover:bg-bg-light hover:border-primary/30 hover:text-primary transition-all"
            >
              <FiCalendar className="w-3.5 h-3.5" />
              View Full Attendance
              <FiChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Latest Result */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light flex items-center gap-2">
              <FiAward className="w-3.5 h-3.5 text-primary/60" />
              Latest Result
            </h4>
            {drawerLoading ? (
              <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ) : latestResult ? (
              (() => {
                const pct = calcPercentage(latestResult.obtainedMarks, latestResult.totalMarks);
                const grade = getGradeInfo(pct);
                return (
                  <div className="p-4 rounded-xl bg-white border border-border-light">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-text-dark">{latestResult.examName}</p>
                        <p className="text-xs text-text-light">{formatDate(latestResult.examDate)}</p>
                      </div>
                      {grade && (
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${grade.color.split(' ').join(' ')}`}>
                          {grade.grade}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-text-dark">{latestResult.obtainedMarks}</span>
                      <span className="text-sm text-text-light">/ {latestResult.totalMarks}</span>
                      {pct != null && (
                        <span className={`text-sm font-bold ml-auto ${grade?.color.split(' ')[0] || ''}`}>
                          {pct}%
                        </span>
                      )}
                    </div>
                    {/* View Result button */}
                    <button
                      onClick={() => { onNavigateTab?.('results'); onClose?.(); }}
                      className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-xs font-semibold text-text-dark hover:bg-bg-light hover:border-primary/30 hover:text-primary transition-all"
                    >
                      <FiBarChart2 className="w-3.5 h-3.5" />
                      View Full Result Details
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })()
            ) : (
              <InfoCard icon={FiAward} iconBg="bg-gray-50" iconColor="text-gray-400" label="Latest Result" value="No results published yet" />
            )}
          </div>

          {/* Course Enrollment & Stats */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light flex items-center gap-2">
              <FiTrendingUp className="w-3.5 h-3.5 text-primary/60" />
              Course Stats
            </h4>
            <InfoCard
              icon={FiCalendar}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-500"
              label="Enrollment Date"
              value={student.enrolledAt ? formatDate(student.enrolledAt) : (drawerLoading ? '...' : 'Enrollment date unavailable')}
            />
            <InfoCard
              icon={FiBookOpen}
              iconBg="bg-purple-50"
              iconColor="text-purple-500"
              label="Assignments Submitted"
              value={submissionCount > 0 ? submissionCount : (drawerLoading ? '...' : (submissionCount === 0 && !drawerLoading ? 'No submissions yet' : '—'))}
            />
            <InfoCard
              icon={FiEye}
              iconBg="bg-teal-50"
              iconColor="text-teal-500"
              label="Course Announcements"
              value={announcementCount != null ? announcementCount : (drawerLoading ? '...' : '—')}
            />
          </div>

          {/* Quick Navigation Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light flex items-center gap-2">
              <FiTrendingUp className="w-3.5 h-3.5 text-primary/60" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onNavigateTab?.('attendance'); onClose?.(); }}
                className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 hover:shadow-sm transition-all"
              >
                <FiCalendar className="w-4 h-4" />
                <span className="text-[11px] font-bold">Attendance</span>
              </button>
              <button
                onClick={() => { onNavigateTab?.('results'); onClose?.(); }}
                className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:shadow-sm transition-all"
              >
                <FiBarChart2 className="w-4 h-4" />
                <span className="text-[11px] font-bold">Results</span>
              </button>
              <button
                onClick={() => { onNavigateTab?.('assignments'); onClose?.(); }}
                className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 hover:shadow-sm transition-all"
              >
                <FiBookOpen className="w-4 h-4" />
                <span className="text-[11px] font-bold">Assignments</span>
              </button>
              <button
                onClick={() => { onNavigateTab?.('announcements'); onClose?.(); }}
                className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:shadow-sm transition-all"
              >
                <FiEye className="w-4 h-4" />
                <span className="text-[11px] font-bold">Announcements</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-border-light">
        <table className="w-full">
          <thead className="bg-bg-light border-b border-border-light">
            <tr>
              {[1, 2, 3, 4, 5].map(i => (
                <th key={i} className="p-4"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i}>
                <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 rounded-full" /><div><div className="h-4 w-28 bg-gray-200 rounded" /><div className="h-3 w-20 bg-gray-200 rounded mt-1.5" /></div></div></td>
                <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                <td className="p-4 hidden md:table-cell"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                <td className="p-4 text-center"><div className="h-6 w-16 bg-gray-200 rounded-full mx-auto" /></td>
                <td className="p-4 text-right"><div className="h-8 w-20 bg-gray-200 rounded-lg ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-border-light p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-8 w-full bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <FiUsers className="w-12 h-12 sm:w-14 sm:h-14 text-primary/60" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-primary/10 flex items-center justify-center">
          <FiX className="w-3.5 h-3.5 text-text-light" />
        </div>
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-3">No Students Enrolled</h3>
      <p className="text-sm text-text-body/70 text-center max-w-md leading-relaxed">
        No students are enrolled in this course yet. Students will appear here 
        once they are assigned to this course through the admin panel.
      </p>
    </div>
  );
}

// ─── Error State ────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <FiAlertCircle className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="font-heading text-lg font-bold text-text-dark mb-2">Failed to Load Students</h3>
      <p className="text-sm text-text-body/60 text-center max-w-sm mb-6 leading-relaxed">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light hover:border-primary/30 hover:text-primary transition-all text-sm shadow-sm">
        <FiRefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function CourseStudentsTab({ course, role, students, attendanceSummary, onNavigateTab }) {
  const isTeacher = role === 'teacher';
  const courseId = course?._id || course?.id || course?.course?._id;
  const courseStudents = students || [];

  // Search & Sort state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ─── Summary Stats ────────────────────────────────────
  const stats = useMemo(() => {
    const total = courseStudents.length;
    const active = courseStudents.filter(s => (s.status || 'active').toLowerCase() === 'active').length;
    const inactive = courseStudents.filter(s => (s.status || 'active').toLowerCase() !== 'active').length;

    // Compute average attendance from course-level attendanceSummary
    // percentage = (present + late) / total * 100
    let avgAttendance = null;
    let hasAttendanceData = false;
    if (attendanceSummary && attendanceSummary.total > 0) {
      hasAttendanceData = true;
      avgAttendance = Math.round(
        ((attendanceSummary.present + attendanceSummary.late) / attendanceSummary.total) * 100
      );
    }

    return { total, active, inactive, avgAttendance, hasAttendanceData };
  }, [courseStudents, attendanceSummary]);

  // ─── Filtered & Sorted Students ─────────────────────
  const filteredStudents = useMemo(() => {
    let list = [...courseStudents];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(s =>
        (s.studentName || '').toLowerCase().includes(q) ||
        (s.studentId || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = (a.studentName || '').localeCompare(b.studentName || '');
          break;
        case 'studentId':
          cmp = (a.studentId || '').localeCompare(b.studentId || '');
          break;
        case 'enrolledAt':
          cmp = new Date(a.enrolledAt || 0) - new Date(b.enrolledAt || 0);
          break;
        default:
          cmp = (a.studentName || '').localeCompare(b.studentName || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [courseStudents, search, sortBy, sortDir]);

  // ─── Handlers ──────────────────────────────────────────
  const handleViewProfile = useCallback((student) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Delay clearing selected student for animation
    setTimeout(() => setSelectedStudent(null), 300);
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
  }, []);

  const handleDirectionToggle = useCallback(() => {
    setSortDir(d => d === 'asc' ? 'desc' : 'asc');
  }, []);

  // ─── Render ───────────────────────────────────────────
  if (!isTeacher) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
          <FiUsers className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="font-heading text-lg font-bold text-text-dark mb-2">Not Available</h3>
        <p className="text-sm text-text-body/70 text-center max-w-md">
          Student listing is only available for teachers.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-xl font-bold text-text-dark flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiUsers className="w-4 h-4 text-primary" />
            </div>
            Students
          </h3>
          <p className="text-sm text-text-light mt-1.5 ml-10">
            {courseStudents.length} student{courseStudents.length !== 1 ? 's' : ''} enrolled · {stats.active} active
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {courseStudents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard icon={FiUsers} label="Total Students" value={stats.total} color="bg-primary/10 text-primary" />
          <StatCard icon={FiCheckCircle} label="Active" value={stats.active} color="bg-green-50 text-green-600" sub={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : ''} />
          <StatCard icon={FiBarChart2} label="Inactive" value={stats.inactive} color="bg-gray-50 text-gray-600" />
          <StatCard
            icon={FiClock}
            label="Avg Attendance"
            value={stats.hasAttendanceData ? `${stats.avgAttendance}%` : '—'}
            color={stats.hasAttendanceData
              ? (stats.avgAttendance >= 80 ? 'bg-green-50 text-green-600' : stats.avgAttendance >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600')
              : 'bg-gray-50 text-gray-600'
            }
            sub={stats.hasAttendanceData ? '' : 'No attendance yet'}
          />
        </div>
      )}

      {/* Search & Sort Toolbar */}
      {courseStudents.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border-light bg-white text-sm text-text-dark placeholder:text-text-light/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-text-light/50 hover:text-text-dark hover:bg-bg-light transition-all"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <SortDropdown
            value={sortBy}
            direction={sortDir}
            onChange={handleSortChange}
            onDirectionToggle={handleDirectionToggle}
          />
          {search && (
            <p className="text-xs text-text-light whitespace-nowrap">
              {filteredStudents.length} of {courseStudents.length} students
            </p>
          )}
        </div>
      )}

      {/* Content */}
      {courseStudents.length === 0 ? (
        <EmptyState />
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-border-light animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <FiSearch className="w-7 h-7 text-gray-300" />
          </div>
          <h4 className="font-bold text-text-dark text-sm mb-1">No Matching Students</h4>
          <p className="text-xs text-text-light/60 text-center max-w-xs">
            No students match your search criteria. Try different keywords.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-border-light">
            <table className="w-full">
              <thead className="bg-bg-light border-b border-border-light">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider">Student</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider hidden lg:table-cell">Student ID</th>
                  <th className="text-center p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-bg-light/50 transition-colors">
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <Avatar photo={student.studentPhoto} name={student.studentName} />
                        <div className="min-w-0">
                          <p className="font-semibold text-text-dark text-sm truncate">
                            {student.studentName || 'Unnamed Student'}
                          </p>
                          {student.studentId && (
                            <p className="text-xs text-text-light font-mono truncate">
                              {student.studentId}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-sm text-text-body hidden md:table-cell">
                      {student.email || (
                        <span className="text-text-light italic">No email</span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-sm text-text-body hidden lg:table-cell">
                      {student.studentId || (
                        <span className="text-text-light italic">N/A</span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="p-3 sm:p-4 text-right">
                      <button
                        onClick={() => handleViewProfile(student)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary-dark hover:shadow-sm transition-all"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-xl border border-border-light p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar photo={student.studentPhoto} name={student.studentName} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-dark text-sm truncate">
                      {student.studentName || 'Unnamed Student'}
                    </p>
                    <p className="text-xs text-text-light truncate">
                      {student.email || student.studentId || ''}
                    </p>
                  </div>
                  <StatusBadge status={student.status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-text-light mb-3">
                  {student.studentId && (
                    <span className="font-mono">{student.studentId}</span>
                  )}
                </div>
                <button
                  onClick={() => handleViewProfile(student)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <FiEye className="w-3.5 h-3.5" />
                    View Profile
                  </span>
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Student Profile Drawer */}
      {drawerOpen && selectedStudent && (
        <StudentProfileDrawer
          student={selectedStudent}
          courseId={courseId}
          onClose={handleCloseDrawer}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
}
