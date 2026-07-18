import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentPortalService from '../../services/studentPortalService';
import {
  FiBookOpen, FiUsers, FiCalendar, FiClipboard,
  FiAward, FiCheckCircle, FiUser, FiRefreshCw,
  FiArrowRight,
} from 'react-icons/fi';
import StudentTeacherSection from './StudentTeacherSection';
import StudentCourseInfo from './StudentCourseInfo';
import StudentNotificationsSection from './StudentNotificationsSection';
import StudentQuickActions from './StudentQuickActions';
import StudentRecentActivity from './StudentRecentActivity';
import StudentLoadingState from './StudentLoadingState';

function SummaryCard({ icon: Icon, label, value, color = 'text-primary', bgColor = 'bg-primary/10' }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 border border-border-light hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon size={22} className={color} />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-text-light font-medium">{label}</p>
          <p className={`text-lg sm:text-xl font-bold ${color} truncate`}>{value ?? '-'}</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <FiRefreshCw size={28} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-text-dark mb-2">Something went wrong</h3>
      <p className="text-sm text-text-light text-center max-w-md mb-6">
        {message || 'Failed to load dashboard data. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          <FiRefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  );
}

export default function StudentDashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const studentId = user?._id || user?.id;

  const fetchDashboard = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await studentPortalService.getDashboard(studentId);
      const data = res?.data || res;
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <StudentLoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const profile = dashboardData?.profile || {};
  const assignedTeacher = dashboardData?.assignedTeacher || null;
  const courses = dashboardData?.courses || [];
  const attendanceSummary = dashboardData?.attendanceSummary || { totalClasses: 0, attended: 0, percentage: 0 };
  const firstName = (profile.studentName || user?.fullName || user?.name || '').split(' ')[0] || 'Student';

  // Current course from dashboard data
  const currentCourse = profile.selectedCourse || courses?.[0] || null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-dark rounded-2xl p-6 sm:p-8 md:p-12 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-96 h-96" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" />
            <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" />
            <path d="M200 100 L300 150 L250 250 L150 250 L100 150 Z" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold mb-2">
            Assalamu Alaikum, {firstName}
          </h1>
          <p className="text-base sm:text-lg text-green-100 mb-6 sm:mb-8 opacity-90">
            Welcome to Your Islamic Academy Dashboard
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <p className="text-green-100 text-xs sm:text-sm font-medium">Current Course</p>
              <p className="text-lg sm:text-xl font-bold mt-1 truncate">
                {currentCourse?.title || profile.selectedCourse?.title || 'Not Assigned'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <p className="text-green-100 text-xs sm:text-sm font-medium">Attendance</p>
              <p className="text-lg sm:text-xl font-bold mt-1">{attendanceSummary.percentage || 0}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <p className="text-green-100 text-xs sm:text-sm font-medium">Teacher</p>
              <p className="text-lg sm:text-xl font-bold mt-1 truncate">
                {assignedTeacher ? assignedTeacher.fullName?.split(' ')[0] : 'Unassigned'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <p className="text-green-100 text-xs sm:text-sm font-medium">Status</p>
              <p className="text-lg sm:text-xl font-bold mt-1 capitalize">{profile.status || 'Active'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={FiBookOpen}
          label="Active Course"
          value={currentCourse?.title || profile.selectedCourse?.title || 'Not assigned'}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <SummaryCard
          icon={FiUsers}
          label="Assigned Teacher"
          value={assignedTeacher ? assignedTeacher.fullName : 'Not assigned'}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <SummaryCard
          icon={FiCalendar}
          label="Attendance"
          value={`${attendanceSummary.percentage || 0}%`}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <SummaryCard
          icon={FiCheckCircle}
          label="Enrollment Status"
          value={profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Active'}
          color="text-green-600"
          bgColor="bg-green-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Teacher */}
          <StudentTeacherSection
            teacher={assignedTeacher}
            loading={false}
          />

          {/* Course Information */}
          <StudentCourseInfo
            course={currentCourse}
            loading={false}
          />
        </div>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-border-light">
            <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Courses', value: courses.length, icon: FiBookOpen, color: 'text-primary' },
                { label: 'Assigned Teacher', value: assignedTeacher ? 'Yes' : 'No', icon: FiUsers, color: 'text-blue-600' },
                { label: 'Classes Attended', value: attendanceSummary.attended || 0, icon: FiCalendar, color: 'text-purple-600' },
                { label: 'Total Classes', value: attendanceSummary.totalClasses || 0, icon: FiClipboard, color: 'text-orange-600' },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                  <div className="flex items-center gap-2">
                    <stat.icon size={14} className={stat.color} />
                    <span className="text-xs sm:text-sm text-text-light">{stat.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <StudentQuickActions
            hasTeacher={!!assignedTeacher}
            onAction={(actionId) => {
              switch (actionId) {
                case 'teacher':
                  navigate('/student/teacher');
                  break;
                case 'course':
                  navigate('/student/courses');
                  break;
                case 'attendance':
                  navigate('/student/attendance');
                  break;
                case 'assignments':
                  navigate('/student/assignments');
                  break;
                case 'results':
                  navigate('/student/certificates');
                  break;
                default:
                  break;
              }
            }}
          />

          {/* Recent Activity */}
          <StudentRecentActivity
            activities={[]}
            loading={false}
          />

          {/* Notifications */}
          <StudentNotificationsSection
            notifications={[]}
            loading={false}
          />
        </div>
      </div>
    </div>
  );
}
