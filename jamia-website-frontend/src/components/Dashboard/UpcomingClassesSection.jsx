import { studentDashboardData } from '../../data/studentDashboardData';

export default function UpcomingClassesSection() {
  const classes = studentDashboardData.todayClasses || [];
  const upcomingClasses = classes.filter(cls => cls.status === 'upcoming');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">Upcoming Classes</h2>
        <a href="#" className="text-primary font-semibold text-sm hover:underline">View All</a>
      </div>

      <div className="space-y-4">
        {upcomingClasses.slice(0, 3).map((cls) => {
          return (
            <div
              key={cls.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border border-border-light hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-text-dark text-lg">{cls.title}</h3>
                <div className="flex flex-col sm:flex-row sm:gap-6 gap-2 mt-2 text-sm text-text-light">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {cls.time}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {cls.instructor}
                  </span>
                </div>
              </div>
              <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors whitespace-nowrap">
                Join Class
              </button>
            </div>
          );
        })}
      </div>

      {upcomingClasses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-light">No upcoming classes scheduled</p>
        </div>
      )}
    </div>
  );
}
