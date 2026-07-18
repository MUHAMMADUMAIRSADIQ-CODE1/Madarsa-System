import {
  FiBookOpen, FiUser, FiCalendar, FiClock,
  FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi';

export default function StudentCourseInfo({ course, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-bg-light rounded-xl flex items-center justify-center">
            <FiBookOpen size={24} className="text-border-light" />
          </div>
          <h3 className="font-heading font-bold text-text-dark mb-1">No Course Assigned</h3>
          <p className="text-xs text-text-light">You are not enrolled in any course yet.</p>
        </div>
      </div>
    );
  }

  const statusColor = {
    active: 'bg-green-100 text-green-800 border-green-200',
    upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const status = course.status || 'active';
  const statusVariant = statusColor[status] || statusColor.active;
  const courseName = course.title || course.name || course.selectedCourse?.title || 'Current Course';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-border-light hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-text-dark flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FiBookOpen size={18} className="text-primary" />
          </span>
          Current Course
        </h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusVariant}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-text-dark">{courseName}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {course.instructor && (
            <div className="flex items-center gap-2 text-xs text-text-light">
              <FiUser size={12} className="text-primary" />
              <span>{course.instructor}</span>
            </div>
          )}
          {course.teacherName && (
            <div className="flex items-center gap-2 text-xs text-text-light">
              <FiUser size={12} className="text-primary" />
              <span>{course.teacherName}</span>
            </div>
          )}
          {course.class && (
            <div className="flex items-center gap-2 text-xs text-text-light">
              <FiCalendar size={12} className="text-primary" />
              <span>Class: {course.class}</span>
            </div>
          )}
          {course.duration && (
            <div className="flex items-center gap-2 text-xs text-text-light">
              <FiClock size={12} className="text-primary" />
              <span>Duration: {course.duration}</span>
            </div>
          )}
          {course.nextClass && (
            <div className="flex items-center gap-2 text-xs text-text-light">
              <FiCalendar size={12} className="text-primary" />
              <span>Next: {course.nextClass}</span>
            </div>
          )}
        </div>

        {/* Progress bar if available */}
        {course.progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-xs text-text-light">Progress</p>
              <span className="text-xs font-bold text-primary">{course.progress}%</span>
            </div>
            <div className="h-2 bg-bg-light rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
