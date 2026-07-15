import { adminDashboardData } from '../../data/adminDashboardData';

export default function AdminWelcomeSection() {
  const stats = adminDashboardData.dashboard.statistics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {[
        { label: 'Total Students', value: stats.totalStudents, icon: '👥', color: 'from-blue-500 to-blue-600' },
        { label: 'Total Teachers', value: stats.totalTeachers, icon: '👨‍🏫', color: 'from-green-500 to-green-600' },
        { label: 'Total Courses', value: stats.totalCourses, icon: '📚', color: 'from-purple-500 to-purple-600' },
        { label: 'New Admissions', value: stats.totalAdmissions, icon: '📝', color: 'from-orange-500 to-orange-600' },
        { label: 'Revenue', value: `$${stats.revenue}`, icon: '💰', color: 'from-yellow-500 to-yellow-600' },
      ].map((stat, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
            <span className="text-5xl opacity-20">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
