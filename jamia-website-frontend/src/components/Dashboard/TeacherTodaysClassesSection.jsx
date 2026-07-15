import { teacherDashboardData } from '../../data/teacherDashboardData';

export default function TeacherTodaysClassesSection() {
  const classes = teacherDashboardData.dashboard?.todaysClasses || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="font-heading text-2xl font-bold text-text-dark mb-6">Today's Classes</h2>

      <div className="space-y-4">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 ${
              cls.status === 'ongoing'
                ? 'border-green-300 bg-green-50'
                : 'border-border-light hover:border-primary hover:bg-bg-light'
            } transition-all`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg text-text-dark">{cls.course}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    cls.status === 'ongoing'
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {cls.status}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-6 gap-2 text-sm text-text-light">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {cls.time}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M11 10h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {cls.students} Students
                </span>
              </div>
            </div>

            <div className="flex gap-2 sm:flex-col">
              {cls.status === 'ongoing' ? (
                <button className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors whitespace-nowrap">
                  Join Now
                </button>
              ) : (
                <>
                  <button className="flex-1 px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary-light transition-colors text-sm">
                    Join
                  </button>
                  <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm">
                    Details
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
