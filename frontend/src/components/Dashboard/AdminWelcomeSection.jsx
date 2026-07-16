import { adminDashboardData } from '../../data/adminDashboardData';
import { FiUsers, FiUser, FiBook, FiFileText, FiDollarSign } from 'react-icons/fi';

export default function AdminWelcomeSection() {
  const stats = adminDashboardData.dashboard.statistics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {[
        { label: 'Total Students', value: stats.totalStudents, icon: FiUsers, color: 'from-blue-500 to-blue-600' },
        { label: 'Total Teachers', value: stats.totalTeachers, icon: FiUser, color: 'from-green-500 to-green-600' },
        { label: 'Total Courses', value: stats.totalCourses, icon: FiBook, color: 'from-purple-500 to-purple-600' },
        { label: 'New Admissions', value: stats.totalAdmissions, icon: FiFileText, color: 'from-orange-500 to-orange-600' },
        { label: 'Revenue', value: `$${stats.revenue}`, icon: FiDollarSign, color: 'from-yellow-500 to-yellow-600' },
      ].map((stat, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-white/80 text-xs sm:text-sm font-medium truncate">{stat.label}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">{stat.value}</p>
            </div>
            <span className="text-3xl sm:text-5xl opacity-20 flex-shrink-0"><stat.icon size={48} /></span>
          </div>
        </div>
      ))}
    </div>
  );
}
