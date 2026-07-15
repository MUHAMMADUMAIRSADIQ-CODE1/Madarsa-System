import { teacherDashboardData } from '../../data/teacherDashboardData';

export default function TeacherWelcomeSection() {
  return (
    <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-dark rounded-2xl p-8 sm:p-12 text-white shadow-xl overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 opacity-10">
        <svg className="w-96 h-96" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" />
          <path d="M200 100 L300 150 L250 250 L150 250 L100 150 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="relative z-10">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-2">
          Welcome back, Dr. Abdullah
        </h1>
        <p className="text-lg text-green-100 mb-8 opacity-90">
          Manage your courses and students effectively
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-green-100 text-sm font-medium">Active Courses</p>
            <p className="text-3xl font-bold mt-2">4</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-green-100 text-sm font-medium">Total Students</p>
            <p className="text-3xl font-bold mt-2">127</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-green-100 text-sm font-medium">Today's Classes</p>
            <p className="text-3xl font-bold mt-2">3</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-green-100 text-sm font-medium">Pending Reviews</p>
            <p className="text-3xl font-bold mt-2">5</p>
          </div>
        </div>
      </div>
    </div>
  );
}
