import { teacherDashboardData } from '../../data/teacherDashboardData';
import { FiUsers, FiBook, FiCalendar } from 'react-icons/fi';

export default function TeacherCoursesSection() {
  const courses = teacherDashboardData.courses || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">My Courses</h2>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors">
          + New Course
        </button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border-light hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-dark text-lg">{course.name}</h3>
              <div className="flex flex-col sm:flex-row sm:gap-6 gap-2 mt-2 text-sm text-text-light">
                <span className="flex items-center gap-1"><FiUsers className="w-4 h-4" /> {course.students} Students</span>
                <span className="flex items-center gap-1"><FiBook className="w-4 h-4" /> {course.level}</span>
                <span className="flex items-center gap-1"><FiCalendar className="w-4 h-4" /> Started: {new Date(course.lastUpdated).toLocaleDateString()}</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 max-w-md">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-text-light">Course Progress</p>
                  <p className="text-xs font-semibold text-primary">{course.progress}%</p>
                </div>
                <div className="h-2 bg-bg-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:flex-col lg:flex-row">
              <button className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary-light transition-colors text-sm whitespace-nowrap">
                View
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm whitespace-nowrap">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
