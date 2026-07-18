import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiUsers, FiUser, FiBook, FiFileText, FiBookOpen } from 'react-icons/fi';

export default function AdminWelcomeSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/admin/dashboard')
      .then((res) => {
        if (mounted && res?.data) {
          const d = res.data;
          setStats({
            totalStudents: d.users?.students || 0,
            totalTeachers: d.users?.teachers || 0,
            totalCourses: d.courses?.total || 0,
            publishedCourses: d.courses?.active || 0,
            teachersWithCourses: d.courses?.teachersWithCourses || 0,
            teachersWithoutCourses: d.courses?.teachersWithoutCourses || 0,
            studentsAssigned: d.courses?.studentsAssigned || 0,
            studentsWaiting: d.courses?.studentsWaiting || 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-gray-100 rounded-2xl p-5 sm:p-6 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: FiUsers, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: FiUser, color: 'from-green-500 to-green-600' },
    { label: 'Total Courses', value: stats?.totalCourses ?? 0, icon: FiBook, color: 'from-purple-500 to-purple-600' },
    { label: 'Assigned Students', value: stats?.studentsAssigned ?? 0, icon: FiUsers, color: 'from-orange-500 to-orange-600' },
    { label: 'Active Courses', value: stats?.publishedCourses ?? 0, icon: FiBookOpen, color: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {cards.map((stat, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-white/80 text-xs sm:text-sm font-medium truncate">{stat.label}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">{stat.value}</p>
            </div>
            <div className="flex-shrink-0 opacity-20">
              <stat.icon size={40} className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
