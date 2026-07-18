import { useState } from 'react';
import {
  FiBell, FiCheckSquare, FiInfo, FiAlertTriangle,
  FiCheckCircle, FiXCircle, FiClock, FiBook,
  FiClipboard, FiCalendar, FiChevronRight,
} from 'react-icons/fi';

const TYPE_ICONS = {
  info: FiInfo,
  warning: FiAlertTriangle,
  success: FiCheckCircle,
  error: FiXCircle,
  assignment: FiClipboard,
  attendance: FiCalendar,
  course: FiBook,
  class: FiClock,
  system: FiBell,
  grade: FiCheckCircle,
};

const TYPE_COLORS = {
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  assignment: 'bg-orange-100 text-orange-700 border-orange-200',
  attendance: 'bg-purple-100 text-purple-700 border-purple-200',
  course: 'bg-primary/10 text-primary border-primary/20',
  class: 'bg-blue-100 text-blue-700 border-blue-200',
  system: 'bg-gray-100 text-gray-700 border-gray-200',
  grade: 'bg-green-100 text-green-700 border-green-200',
};

function getTypeColor(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.info;
}

function getTypeIcon(type) {
  const Icon = TYPE_ICONS[type] || TYPE_ICONS.info;
  return Icon;
}

export default function StudentNotificationsSection({ notifications = [], loading, onViewAll }) {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-2 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  // Generate placeholder notifications if none exist
  const hasNotifications = notifications.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-border-light">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-text-dark flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FiBell size={18} className="text-primary" />
          </span>
          Notifications
        </h3>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {!hasNotifications ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-bg-light rounded-full flex items-center justify-center">
            <FiBell size={22} className="text-border-light" />
          </div>
          <h4 className="font-semibold text-text-dark text-sm mb-1">No Notifications</h4>
          <p className="text-xs text-text-light">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayNotifications.map((notif, idx) => {
            const TypeIcon = getTypeIcon(notif.type);
            const colorClass = getTypeColor(notif.type);
            return (
              <div
                key={notif._id || notif.id || idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${
                  notif.read
                    ? 'border-border-light bg-white'
                    : 'border-primary/20 bg-primary/[0.03]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <TypeIcon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${notif.read ? 'text-text-body' : 'font-semibold text-text-dark'}`}>
                      {notif.title || notif.message}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  {notif.message && notif.title && (
                    <p className="text-xs text-text-light mt-0.5 line-clamp-1">{notif.message}</p>
                  )}
                  {notif.date && (
                    <p className="text-[11px] text-text-light mt-1">{notif.date}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notifications.length > 5 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full flex items-center justify-center gap-1 py-2.5 text-primary text-sm font-semibold hover:bg-primary/5 rounded-xl transition-colors"
        >
          View All ({notifications.length})
          <FiChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
