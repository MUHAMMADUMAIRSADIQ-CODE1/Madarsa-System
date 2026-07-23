import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiUsers,
  FiRefreshCw, FiAlertCircle, FiLoader, FiSave,
  FiBarChart2, FiSun,
} from 'react-icons/fi';
import attendanceService from '../../services/attendanceService';
import teacherPortalService from '../../services/teacherPortalService';
import studentPortalService from '../../services/studentPortalService';
import { useAuth } from '../../context/AuthContext';
import StatusPopover from './StatusPopover';

// ─── Constants ───────────────────────────────────────────
const STATUS_MAP = {
  present: { label: 'Present', classes: 'bg-green-100 text-green-700 border-green-200' },
  absent: { label: 'Absent', classes: 'bg-red-100 text-red-700 border-red-200' },
  late: { label: 'Late', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  excused: { label: 'Leave', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
};

// ─── Helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatFullDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function todayString() {
  return new Date().toISOString().split('T')[0];
}

// ─── Stat Card ───────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 sm:p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${bg || 'bg-primary/10'} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color || 'text-primary'}`} />
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-text-dark">{value}</p>
          <p className="text-xs sm:text-sm text-text-light font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}



// ─── Teacher Attendance View ─────────────────────────────
function TeacherAttendanceView({ courseId, courseStudents }) {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [selectedDate, setSelectedDate] = useState(todayString());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [noteMap, setNoteMap] = useState({});
  const [profileId, setProfileId] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch teacher profile to get Teacher._id (backend queries by Teacher._id, not User._id)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await teacherPortalService.getProfile();
        const profile = res?.data || res;
        setProfileId(profile?._id || userId);
      } catch {
        setProfileId(userId);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // Fetch existing attendance for the selected date
  const fetchAttendance = useCallback(async () => {
    if (!profileId || !courseId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceService.getTeacherAttendance(profileId, {
        date: selectedDate,
        course: courseId,
        limit: 200,
      });
      const data = res?.data || res;
      const records = data?.data || [];

      // Build attendance map: studentId -> { status, remarks, recordId }
      const map = {};
      const notes = {};
      records.forEach(r => {
        const sid = r.student?._id || r.student;
        map[sid] = r.status || 'present';
        notes[sid] = r.remarks || '';
      });
      setAttendanceMap(map);
      setNoteMap(notes);
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [profileId, courseId, selectedDate]);

  useEffect(() => {
    if (profileId) fetchAttendance();
  }, [fetchAttendance, profileId]);

  const students = courseStudents;

  // Combined loading state
  const isLoading = profileLoading || loading;

  // Stats
  const stats = useMemo(() => {
    const total = students.length;
    let present = 0, absent = 0, late = 0, excused = 0;
    students.forEach(s => {
      const sid = s._id || s.id;
      const status = attendanceMap[sid];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });
    return { total, present, absent, late, excused };
  }, [students, attendanceMap]);

  // Handle status change
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleNoteChange = (studentId, note) => {
    setNoteMap(prev => ({ ...prev, [studentId]: note }));
  };

  // Mark All Present
  const handleMarkAllPresent = async () => {
    if (!profileId || !courseId) return;
    setSaving(true);
    setError(null);
    try {
      const records = students.map(s => ({
        student: s._id || s.id,
        course: courseId,
        teacher: profileId,
        classDate: selectedDate,
      }));
      await attendanceService.markAllPresent({ records });
      // Update local state
      const newMap = {};
      students.forEach(s => {
        newMap[s._id || s.id] = 'present';
      });
      setAttendanceMap(newMap);
      setSuccessMsg('All students marked present');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to mark all present');
    } finally {
      setSaving(false);
    }
  };

  // Save attendance
  const handleSave = async () => {
    if (!profileId || !courseId) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const records = students.map(s => {
        const sid = s._id || s.id;
        return {
          student: sid,
          course: courseId,
          teacher: profileId,
          classDate: selectedDate,
          status: attendanceMap[sid] || 'present',
          remarks: noteMap[sid] || '',
        };
      });
      const res = await attendanceService.bulkMarkAttendance({ records });
      const result = res?.data || res;
      setSuccessMsg(`Saved: ${result.created || 0} new, ${result.updated || 0} updated`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FiUsers} label="Total Students" value={stats.total} color="text-primary" bg="bg-primary/10" />
        <StatCard icon={FiCheckCircle} label="Present" value={stats.present} color="text-green-600" bg="bg-green-50" />
        <StatCard icon={FiXCircle} label="Absent" value={stats.absent} color="text-red-600" bg="bg-red-50" />
        <StatCard icon={FiClock} label="Late" value={stats.late} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-text-light" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border-light bg-white text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={handleMarkAllPresent}
            disabled={saving || students.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-50 transition-all disabled:opacity-50"
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            Mark All Present
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAttendance}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-light text-text-dark text-xs font-semibold hover:bg-bg-light transition-all"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
            Save Attendance
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 animate-fade-in">
          <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Date Display ────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-text-light">
        <FiCalendar className="w-4 h-4 text-primary/60" />
        <span className="font-medium text-text-dark">{formatFullDate(selectedDate)}</span>
      </div>

      {/* ── Attendance Table ────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : students.length > 0 ? (
        <div className="space-y-2">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-border-light">
            <table className="w-full">
              <thead className="bg-bg-light border-b border-border-light">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider">Student</th>
                  <th className="text-center p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {students.map((student) => {
                  const sid = student._id || student.id;
                  const status = attendanceMap[sid] || '';
                  return (
                    <tr key={sid} className="hover:bg-bg-light/50 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          {student.studentPhoto ? (
                            <img src={student.studentPhoto} alt="" className="w-9 h-9 rounded-full object-cover border border-border-light flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">
                                {(student.studentName || '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-text-dark text-sm truncate">{student.studentName || 'Unnamed'}</p>
                            {student.studentId && (
                              <p className="text-xs text-text-light font-mono">{student.studentId}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <StatusPopover
                          value={status}
                          onChange={(val) => handleStatusChange(sid, val)}
                        />
                      </td>
                      <td className="p-3 sm:p-4">
                        <input
                          type="text"
                          value={noteMap[sid] || ''}
                          onChange={(e) => handleNoteChange(sid, e.target.value)}
                          placeholder="Optional note..."
                          className="w-full px-3 py-1.5 rounded-lg border border-border-light bg-white text-xs text-text-dark placeholder:text-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          maxLength={200}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2">
            {students.map((student) => {
              const sid = student._id || student.id;
              const status = attendanceMap[sid] || '';
              return (
                <div key={sid} className="bg-white rounded-xl border border-border-light p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {student.studentPhoto ? (
                      <img src={student.studentPhoto} alt="" className="w-10 h-10 rounded-full object-cover border border-border-light flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-base font-bold text-primary">
                          {(student.studentName || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-dark text-sm truncate">{student.studentName || 'Unnamed'}</p>
                      {student.studentId && (
                        <p className="text-xs text-text-light">{student.studentId}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPopover
                      value={status}
                      onChange={(val) => handleStatusChange(sid, val)}
                    />
                    {status && (
                      <StatusBadge status={status} />
                    )}
                  </div>
                  <input
                    type="text"
                    value={noteMap[sid] || ''}
                    onChange={(e) => handleNoteChange(sid, e.target.value)}
                    placeholder="Optional note..."
                    className="w-full px-3 py-2 rounded-lg border border-border-light bg-white text-xs text-text-dark placeholder:text-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    maxLength={200}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-border-light">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <FiUsers className="w-7 h-7 text-gray-300" />
          </div>
          <h4 className="font-bold text-text-dark text-sm mb-1">No Students Enrolled</h4>
          <p className="text-xs text-text-light/60 text-center max-w-xs">
            No students are currently enrolled in this course. Assign students first to mark attendance.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Student Attendance View ─────────────────────────────
function StudentAttendanceView({ courseId }) {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 });
  const [profileId, setProfileId] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student profile to get Student._id (backend queries by Student._id, not User._id)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentPortalService.getProfile();
        const profile = res?.data || res;
        setProfileId(profile?._id || userId);
      } catch {
        setProfileId(userId);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // Current month/year for filtering
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const fetchAttendance = useCallback(async () => {
    if (!profileId || !courseId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceService.getStudentAttendance(profileId, {
        course: courseId,
        month: filterMonth,
        year: filterYear,
        limit: 100,
      });
      const data = res?.data || res;
      setRecords(data?.data || []);
      setStats(data?.stats || { total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [profileId, courseId, filterMonth, filterYear]);

  useEffect(() => {
    if (profileId) fetchAttendance();
  }, [fetchAttendance, profileId]);

  return (
    <div className="space-y-6">
      {/* ── Stats Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <StatCard icon={FiBarChart2} label="Attendance %" value={`${stats.percentage || 0}%`} color="text-primary" bg="bg-primary/10" />
        <StatCard icon={FiCheckCircle} label="Present" value={stats.present} color="text-green-600" bg="bg-green-50" />
        <StatCard icon={FiXCircle} label="Absent" value={stats.absent} color="text-red-600" bg="bg-red-50" />
        <StatCard icon={FiClock} label="Late" value={stats.late} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={FiSun} label="Leave" value={stats.excused} color="text-blue-600" bg="bg-blue-50" className="col-span-2 sm:col-span-1" />
      </div>

      {/* ── Month Filter ─────────────────────────────── */}
      <div className="flex items-center gap-3">
        <FiCalendar className="w-4 h-4 text-text-light" />
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(parseInt(e.target.value))}
          className="px-3 py-2 rounded-xl border border-border-light bg-white text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          {monthNames.map((name, idx) => (
            <option key={idx + 1} value={idx + 1}>{name}</option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(parseInt(e.target.value))}
          className="px-3 py-2 rounded-xl border border-border-light bg-white text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          {[now.getFullYear(), now.getFullYear() - 1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={fetchAttendance}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-light text-text-dark text-xs font-semibold hover:bg-bg-light transition-all"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Attendance History ───────────────────────── */}
      {(profileLoading || loading) ? (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <FiAlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchAttendance} className="mt-4 text-xs text-primary font-semibold hover:underline">Retry</button>
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-text-dark flex items-center gap-2 mb-3">
            <FiCalendar className="w-4 h-4 text-primary" />
            Attendance History — {monthNames[filterMonth - 1]} {filterYear}
          </h4>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-border-light">
            <table className="w-full">
              <thead className="bg-bg-light border-b border-border-light">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider">Date</th>
                  <th className="text-center p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-text-dark text-xs uppercase tracking-wider">Teacher Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-bg-light/50 transition-colors">
                    <td className="p-3 sm:p-4 text-sm text-text-dark font-medium">{formatDate(r.classDate)}</td>
                    <td className="p-3 sm:p-4 text-center"><StatusBadge status={r.status} /></td>
                    <td className="p-3 sm:p-4 text-sm text-text-body/70 italic">
                      {r.remarks || <span className="text-text-light/40">&mdash;</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2">
            {records.map((r) => (
              <div key={r._id} className="bg-white rounded-xl border border-border-light p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-dark">{formatDate(r.classDate)}</p>
                  {r.remarks && (
                    <p className="text-xs text-text-body/70 mt-0.5 italic">{r.remarks}</p>
                  )}
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 bg-white rounded-xl border border-dashed border-border-light">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <FiCalendar className="w-7 h-7 text-gray-300" />
          </div>
          <h4 className="font-bold text-text-dark text-sm mb-1">No Attendance Records</h4>
          <p className="text-xs text-text-light/60 text-center max-w-xs">
            No attendance records found for {monthNames[filterMonth - 1]} {filterYear}.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main CourseAttendanceTab ────────────────────────────
export default function CourseAttendanceTab({ course, role, students: propStudents }) {
  const isTeacher = role === 'teacher';
  const courseId = course?._id || course?.id || course?.course?._id;
  const courseStudents = propStudents || [];

  if (!courseId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <FiCalendar className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="font-heading text-lg font-bold text-text-dark mb-2">Course Not Found</h3>
        <p className="text-sm text-text-body/70">Unable to load course data for attendance.</p>
      </div>
    );
  }

  if (isTeacher) {
    return <TeacherAttendanceView courseId={courseId} courseStudents={courseStudents} />;
  }

  return <StudentAttendanceView courseId={courseId} />;
}
