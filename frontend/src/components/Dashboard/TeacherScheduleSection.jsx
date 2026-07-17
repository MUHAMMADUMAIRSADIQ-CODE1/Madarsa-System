import { useState, useEffect, useCallback } from 'react';
import teacherAcademicService from '../../services/teacherAcademicService';
import { useAuth } from '../../context/AuthContext';
import {
  FiCalendar, FiClock, FiMapPin, FiUsers, FiVideo,
  FiChevronLeft, FiChevronRight, FiRefreshCw
} from 'react-icons/fi';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
  live: 'bg-green-100 text-green-800 border-green-300 animate-pulse',
  completed: 'bg-gray-100 text-gray-600 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

export default function TeacherScheduleSection() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
  });

  const fetchSchedule = useCallback(async () => {
    if (!user?.id && !user?._id) return;
    const teacherId = user._id || user.id;
    setLoading(true);
    setError(null);
    try {
      const res = await teacherAcademicService.getSchedule(teacherId);
      const responseData = res?.data || res;
      setSchedule(responseData);
    } catch (err) {
      setError(err.message || 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const getStatusBadge = (status) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.scheduled;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const renderStatCard = (label, value, icon, color) => (
    <div className="bg-white rounded-xl border border-border-light p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-text-light">{label}</p>
        <p className="text-xl font-bold text-text-dark mt-0.5">{value}</p>
      </div>
    </div>
  );

  // Loading state
  if (loading && !schedule) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded-lg w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-dark">My Schedule</h1>
        <p className="text-text-light mt-1">Manage your teaching timetable and class timings</p>
      </div>

      {/* Stats Cards */}
      {schedule && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {renderStatCard(
            "Today's Classes",
            schedule.todaysClasses?.length || 0,
            <FiCalendar className="w-5 h-5 text-blue-600" />,
            'bg-blue-100'
          )}
          {renderStatCard(
            'Weekly Classes',
            schedule.weeklyClasses?.length || 0,
            <FiClock className="w-5 h-5 text-green-600" />,
            'bg-green-100'
          )}
          {renderStatCard(
            'Upcoming',
            schedule.upcomingClasses?.length || 0,
            <FiRefreshCw className="w-5 h-5 text-purple-600" />,
            'bg-purple-100'
          )}
          {renderStatCard(
            'Attendance Today',
            schedule.todaysAttendanceCount || 0,
            <FiUsers className="w-5 h-5 text-orange-600" />,
            'bg-orange-100'
          )}
        </div>
      )}

      {/* Today's Classes */}
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
        <h2 className="font-heading text-xl font-bold text-text-dark mb-6">
          Today's Classes
          <span className="text-sm font-normal text-text-light ml-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </h2>

        {!schedule || schedule.todaysClasses?.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="w-12 h-12 text-border-light mx-auto mb-3" />
            <p className="text-text-light font-medium">No classes scheduled for today</p>
            <p className="text-sm text-text-light mt-1">Enjoy your day off!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.todaysClasses.map((cls, idx) => (
              <div
                key={cls._id || idx}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all ${
                  cls.status === 'live'
                    ? 'border-green-300 bg-green-50'
                    : 'border-border-light hover:border-primary hover:bg-bg-light'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-text-dark">
                      {cls.course?.title || cls.title}
                    </h3>
                    {getStatusBadge(cls.status)}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-text-light">
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {formatTime(cls.scheduledAt)}
                      {cls.duration && ` (${cls.duration} min)`}
                    </span>
                    {cls.meetingLink && (
                      <span className="flex items-center gap-1">
                        <FiVideo className="w-4 h-4" />
                        <a
                          href={cls.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Join Meeting
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Timetable */}
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-text-dark">Weekly Timetable</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeWeek(-1)}
              className="p-2 hover:bg-bg-light rounded-lg transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-text-body px-3">
              {formatDate(currentWeekStart)} - {formatDate(getWeekDates()[6])}
            </span>
            <button
              onClick={() => changeWeek(1)}
              className="p-2 hover:bg-bg-light rounded-lg transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-px bg-border-light rounded-t-xl overflow-hidden">
            <div className="bg-bg-light p-3 text-center">
              <span className="text-xs font-semibold text-text-light">Time</span>
            </div>
            {getWeekDates().map((date, idx) => (
              <div
                key={idx}
                className={`p-3 text-center ${
                  isToday(date) ? 'bg-primary text-white' : 'bg-bg-light'
                }`}
              >
                <p className="text-xs font-semibold">{DAYS[date.getDay()]}</p>
                <p className={`text-lg font-bold ${isToday(date) ? 'text-white' : 'text-text-dark'}`}>
                  {date.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="border-x border-border-light">
            {HOURS.map((hour, idx) => {
              const hourNum = parseInt(hour.split(':')[0]);
              const classesAtHour = schedule?.weeklyClasses?.filter(cls => {
                const clsHour = new Date(cls.scheduledAt).getHours();
                return clsHour === hourNum;
              }) || [];

              return (
                <div
                  key={idx}
                  className="grid grid-cols-8 gap-px bg-border-light border-b border-border-light last:border-b-0"
                >
                  <div className="bg-bg-light p-2 flex items-center justify-center">
                    <span className="text-xs text-text-light font-medium">{hour}</span>
                  </div>
                  {getWeekDates().map((date, dayIdx) => {
                    const dayOfWeek = date.getDay();
                    const classForSlot = classesAtHour.find(cls => {
                      const clsDay = new Date(cls.scheduledAt).getDay();
                      return clsDay === dayOfWeek;
                    });

                    return (
                      <div
                        key={dayIdx}
                        className={`bg-white p-1.5 min-h-[60px] ${
                          isToday(date) ? 'bg-primary/5' : ''
                        }`}
                      >
                        {classForSlot && (
                          <div className={`h-full p-1.5 rounded-md text-xs border ${
                            classForSlot.status === 'live'
                              ? 'bg-green-50 border-green-300'
                              : 'bg-primary/5 border-primary/20'
                          }`}>
                            <p className="font-semibold text-text-dark truncate">
                              {classForSlot.course?.title || classForSlot.title}
                            </p>
                            {classForSlot.duration && (
                              <p className="text-text-light truncate">{classForSlot.duration}min</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Classes */}
      {schedule?.upcomingClasses?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
          <h2 className="font-heading text-xl font-bold text-text-dark mb-6">Upcoming Classes</h2>
          <div className="space-y-3">
            {schedule.upcomingClasses.slice(0, 10).map((cls, idx) => (
              <div
                key={cls._id || idx}
                className="flex items-center justify-between p-4 rounded-xl border border-border-light hover:border-primary transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text-dark">
                      {cls.course?.title || cls.title}
                    </h3>
                    {getStatusBadge(cls.status)}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-text-light">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5" />
                      {formatDate(cls.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5" />
                      {formatTime(cls.scheduledAt)}
                      {cls.duration && ` (${cls.duration} min)`}
                    </span>
                  </div>
                </div>
                {cls.meetingLink && (
                  <a
                    href={cls.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
                  >
                    <FiVideo className="w-4 h-4" />
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
    </div>
  );
}
