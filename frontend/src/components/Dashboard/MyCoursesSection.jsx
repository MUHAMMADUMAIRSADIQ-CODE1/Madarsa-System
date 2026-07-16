import { studentDashboardData } from '../../data/studentDashboardData';

export default function MyCoursesSection() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">My Courses</h2>
        <a href="#" className="text-primary font-semibold text-sm hover:underline">View All</a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(studentDashboardData.courses || []).map((course) => (
          <div
            key={course.id}
            className="group rounded-xl overflow-hidden shadow-md border border-border-light hover:shadow-xl hover:border-primary transition-all duration-300"
          >
            {/* Course Image */}
            <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary-dark/20 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-16 h-16 text-primary opacity-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25m20-11c5.5 0 10 4.745 10 11m-15-6.25c0-4.418-3.582-8-8-8" />
                </svg>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full">
                <p className="text-xs font-bold text-primary">{course.progress}%</p>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4">
              <h3 className="font-semibold text-text-dark text-lg group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-text-light mt-1">{course.instructor}</p>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-text-light">Progress</p>
                  <p className="text-xs font-semibold text-primary">{course.progress}%</p>
                </div>
                <div className="h-2 bg-bg-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-4 py-2 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm">
                Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
