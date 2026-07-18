import { useAuth } from '../../context/AuthContext';
import {
  FiBookOpen, FiUsers, FiCalendar, FiClipboard,
} from 'react-icons/fi';

export default function TeacherWelcomeSection({ stats = {} }) {
  const { user } = useAuth();
  const firstName = (user?.fullName || user?.name || '').split(' ')[0] || 'Teacher';

  const statItems = [
    { label: 'Active Courses', value: stats.totalCourses ?? '-', icon: FiBookOpen },
    { label: 'Total Students', value: stats.totalStudents ?? '-', icon: FiUsers },
    { label: "Today's Classes", value: stats.todaysClasses ?? '-', icon: FiCalendar },
    { label: 'Pending Reviews', value: stats.pendingReviews ?? '-', icon: FiClipboard },
  ];

  return (
    <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-dark rounded-2xl p-6 sm:p-8 md:p-12 text-white shadow-xl overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 opacity-10">
        <svg className="w-96 h-96" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" />
          <path d="M200 100 L300 150 L250 250 L150 250 L100 150 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="relative z-10">
        <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold mb-2">
          Welcome back, {firstName}
        </h1>
        <p className="text-base sm:text-lg text-green-100 mb-6 sm:mb-8 opacity-90">
          Manage your courses and students effectively
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {statItems.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-green-100/70" />
                  <p className="text-green-100 text-xs sm:text-sm font-medium">{stat.label}</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
