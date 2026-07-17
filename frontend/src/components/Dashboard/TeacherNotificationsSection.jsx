import { useState, useEffect, useCallback } from 'react';
import teacherAcademicService from '../../services/teacherAcademicService';
import {
  FiBell, FiCheckSquare, FiChevronLeft, FiChevronRight,
  FiInfo, FiAlertTriangle, FiCheckCircle, FiXCircle,
  FiClock, FiBook, FiClipboard, FiCalendar
} from 'react-icons/fi';

const TYPE_ICONS = {
  info: FiInfo,
  warning: FiAlertTriangle,
  success: FiCheckCircle,
  error: FiXCircle,
  assignment: FiClipboard,
  attendance: FiCalendar,
  course: FiBook,
  system: FiBell,
};

const TYPE_COLORS = {
  info: 'bg-blue-100 text-blue-600',
  warning: 'bg-yellow-100 text-yellow-600',
  success: 'bg-green-100 text-green-600',
  error: 'bg-red-100 text-red-600',
  assignment: 'bg-purple-100 text-purple-600',
  attendance: 'bg-orange-100 text-orange-600',
  course: 'bg-indigo-100 text-indigo-600',
  system: 'bg-gray-100 text-gray-600',
};

export default function TeacherNotificationsSection() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotifications = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (unreadOnly) params.unreadOnly = 'true';
      const res = await teacherAcademicService.getNotifications(params);
      const data = res?.data || res;
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
      setTotalPages(data?.totalPages || Math.ceil((data?.total || 0) / 20) || 1);
      setTotal(data?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => { fetchNotifications(page); }, [page, fetchNotifications]);
  useEffect(() => { setPage(1); }, [unreadOnly]);

  const handleMarkRead = async (id) => {
    try {
      await teacherAcademicService.markNotificationRead(id);
      fetchNotifications(page);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await teacherAcademicService.markAllNotificationsRead();
      setSuccess('All notifications marked as read');
      fetchNotifications(1);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-border-light">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-2xl font-bold text-text-dark">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-primary text-white text-xs rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-sm text-text-light mt-1">
              {total > 0 ? `${total} notification${total !== 1 ? 's' : ''}` : 'Stay updated with your activities'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                unreadOnly ? 'bg-primary text-white border-primary' : 'border-border-light text-text-body hover:bg-bg-light'
              }`}
            >
              {unreadOnly ? 'All' : 'Unread'}
            </button>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light rounded-xl border border-primary transition-colors">
                <FiCheckSquare className="w-4 h-4" /> Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="m-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="m-5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      {/* Notifications List */}
      {loading ? (
        <div className="p-5 space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <FiBell className="w-16 h-16 text-border-light mx-auto mb-4" />
          <p className="text-text-light font-medium">
            {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-sm text-text-light mt-2">
            You'll see notifications for assignments, announcements, and more here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border-light">
          {notifications.map(notif => {
            const TypeIcon = TYPE_ICONS[notif.type] || FiInfo;
            const colorClass = TYPE_COLORS[notif.type] || 'bg-gray-100 text-gray-600';
            return (
              <div
                key={notif._id}
                className={`flex items-start gap-4 p-4 sm:p-5 transition-colors ${
                  !notif.isRead ? 'bg-primary/5' : 'hover:bg-bg-light'
                }`}
              >
                <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm ${notif.isRead ? 'text-text-body' : 'font-semibold text-text-dark'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-text-light mt-0.5">{notif.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-text-light whitespace-nowrap">{formatTime(notif.createdAt)}</span>
                      {!notif.isRead && (
                        <button onClick={() => handleMarkRead(notif._id)}
                          className="p-1 text-primary hover:bg-primary-light rounded transition-colors" title="Mark as read">
                          <FiCheckSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-5 border-t border-border-light">
          <p className="text-sm text-text-light">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50"><FiChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50"><FiChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
