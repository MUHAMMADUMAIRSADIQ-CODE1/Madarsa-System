import { adminDashboardData } from '../../data/adminDashboardData';

export default function AdminRecentActivitiesSection() {
  const activities = adminDashboardData.dashboard.recentActivities;

  const getActivityIcon = (type) => {
    const icons = {
      enrollment: '🎓',
      teacher: '👨‍🏫',
      course: '📚',
      system: '⚙️',
    };
    return icons[type] || '📌';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="font-heading text-2xl font-bold text-text-dark mb-6">Recent Activities</h2>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-border-light hover:border-primary hover:bg-bg-light transition-all"
          >
            <span className="text-3xl mt-1">{getActivityIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-text-dark font-medium">{activity.text}</p>
              <p className="text-xs text-text-light mt-1">{activity.time}</p>
            </div>
            <button className="p-2 hover:bg-primary-light rounded-lg transition-colors flex-shrink-0">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
