import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import teacherPortalService from '../../services/teacherPortalService';
import teacherAcademicService from '../../services/teacherAcademicService';
import CourseAttendanceTab from '../LMS/CourseAttendanceTab';
import {
  FiLoader, FiAlertCircle, FiRefreshCw, FiBookOpen,
} from 'react-icons/fi';

// ─── Skeleton ────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-xl w-64" />
      <div className="h-12 bg-gray-100 rounded-xl w-full" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function ProfessionalAttendancePage() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch profile + courses on mount
  const fetchInitial = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [profileRes, coursesRes] = await Promise.allSettled([
        teacherPortalService.getProfile(),
        teacherPortalService.getCourses(userId, { limit: 50 }),
      ]);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value?.data || profileRes.value);
      if (coursesRes.status === 'fulfilled') {
        const d = coursesRes.value?.data || coursesRes.value;
        const courseList = d?.courses || [];
        setCourses(courseList);
        // Auto-select first course
        if (courseList.length > 0) {
          const firstId = courseList[0]._id || courseList[0].id || courseList[0].course?._id;
          setSelectedCourseId(firstId || '');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  // Fetch course detail + students when course changes
  useEffect(() => {
    if (!selectedCourseId || !profile?._id) {
      setCourseData(null);
      setStudents([]);
      return;
    }
    setCourseLoading(true);
    teacherAcademicService.getCourseDetails(profile._id, selectedCourseId)
      .then(res => {
        const d = res?.data || res;
        setCourseData(d?.course || { _id: selectedCourseId });
        setStudents(d?.students || []);
      })
      .catch(() => {
        setCourseData({ _id: selectedCourseId });
        setStudents([]);
      })
      .finally(() => setCourseLoading(false));
  }, [selectedCourseId, profile?._id]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <button onClick={fetchInitial} className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light transition-all text-sm">
          <FiRefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────── */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark">Take Attendance</h1>
        <p className="text-text-light text-sm mt-1">Mark attendance for any of your courses</p>
      </div>

      {/* ─── Course Selector ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-border-light p-4 sm:p-6">
        <label className="block text-xs font-semibold text-text-light mb-1.5">Select Course *</label>
        <select
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">— Choose a course —</option>
          {courses.map(c => {
            const cd = c.course || c;
            const cId = cd._id || cd.id;
            return <option key={cId} value={cId}>{cd.title || 'Untitled Course'}</option>;
          })}
        </select>
      </div>

      {/* ─── Reuse existing CourseAttendanceTab ──────── */}
      {!selectedCourseId ? (
        <div className="bg-white rounded-xl border border-dashed border-border-light p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <FiBookOpen className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="font-heading text-lg font-bold text-text-dark mb-1">Select a course to begin</h3>
          <p className="text-sm text-text-light/60">Choose a course above, then mark attendance for each student.</p>
        </div>
      ) : courseLoading ? (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <CourseAttendanceTab
          course={courseData || { _id: selectedCourseId }}
          role="teacher"
          students={students}
        />
      )}
    </div>
  );
}
