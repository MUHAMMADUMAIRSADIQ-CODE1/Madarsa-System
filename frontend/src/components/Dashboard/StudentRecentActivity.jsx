import {
  FiClock, FiCheckCircle, FiUserPlus, FiBookOpen,
  FiUser, FiEdit3, FiShield, FiFlag,
} from 'react-icons/fi';

const ACTIVITY_ICONS = {
  profile_approved: { icon: FiCheckCircle, color: 'bg-green-500 text-white border-green-500' },
  profile_updated: { icon: FiEdit3, color: 'bg-blue-500 text-white border-blue-500' },
  teacher_assigned: { icon: FiUserPlus, color: 'bg-primary text-white border-primary' },
  course_assigned: { icon: FiBookOpen, color: 'bg-purple-500 text-white border-purple-500' },
  account_created: { icon: FiFlag, color: 'bg-gray-500 text-white border-gray-500' },
  profile_verified: { icon: FiShield, color: 'bg-green-500 text-white border-green-500' },
  default: { icon: FiClock, color: 'bg-gray-400 text-white border-gray-400' },
};

function getActivityConfig(type) {
  return ACTIVITY_ICONS[type] || ACTIVITY_ICONS.default;
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
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr || '';
  }
}

export default function StudentRecentActivity({ activities = [], loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-9 h-9 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2 pb-4">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Generate default timeline if no activities exist
  const defaultActivities = [
    { type: 'profile_approved', title: 'Profile Approved', time: '2 days ago' },
    { type: 'teacher_assigned', title: 'Teacher Assigned', time: '1 week ago' },
    { type: 'course_assigned', title: 'Course Assigned', time: '1 week ago' },
    { type: 'profile_updated', title: 'Profile Updated', time: '2 weeks ago' },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-border-light">
      <h3 className="font-heading text-lg font-bold text-text-dark mb-6 flex items-center gap-2">
        <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <FiClock size={18} className="text-primary" />
        </span>
        Recent Activity
      </h3>

      {activities.length === 0 ? (
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-border-light" />
          {displayActivities.map((activity, idx) => {
            const config = getActivityConfig(activity.type);
            const Icon = config.icon;
            const isLast = idx === displayActivities.length - 1;

            return (
              <div key={idx} className={`relative flex gap-4 ${!isLast ? 'pb-6' : ''}`}>
                {!isLast && (
                  <div className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-border-light" />
                )}
                <div className={`relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 shadow-sm ${config.color}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-semibold text-text-dark">{activity.title}</p>
                  <p className="text-xs text-text-light mt-0.5">
                    {activity.time ? formatTimeAgo(activity.time) : activity.date || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-border-light" />
          {activities.map((activity, idx) => {
            const config = getActivityConfig(activity.type);
            const Icon = config.icon;
            const isLast = idx === activities.length - 1;

            return (
              <div key={activity._id || activity.id || idx} className={`relative flex gap-4 ${!isLast ? 'pb-6' : ''}`}>
                {!isLast && (
                  <div className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-border-light" />
                )}
                <div className={`relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 shadow-sm ${config.color}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-semibold text-text-dark">{activity.title}</p>
                  <p className="text-xs text-text-light mt-0.5">{formatTimeAgo(activity.time || activity.date || activity.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
