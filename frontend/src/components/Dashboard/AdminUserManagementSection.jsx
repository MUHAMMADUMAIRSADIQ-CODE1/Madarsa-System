import { adminDashboardData } from '../../data/adminDashboardData';
import { FiUsers, FiUser, FiSettings } from 'react-icons/fi';

export default function AdminUserManagementSection() {
  const users = [
    { id: 1, name: 'Students', count: adminDashboardData.dashboard.statistics.totalStudents, icon: FiUsers, color: 'bg-blue' },
    { id: 2, name: 'Teachers', count: adminDashboardData.dashboard.statistics.totalTeachers, icon: FiUser, color: 'bg-green' },
    { id: 3, name: 'Admins', count: 3, icon: FiSettings, color: 'bg-purple' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">User Management</h2>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors">
          + Add User
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {users.map((userGroup) => (
          <div
            key={userGroup.id}
            className="p-6 border-2 border-border-light rounded-xl hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="p-3 bg-primary/10 text-primary rounded-xl"><userGroup.icon size={28} /></span>
              <div>
                <p className="text-sm text-text-light">{userGroup.name}</p>
                <p className="text-2xl font-bold text-primary">{userGroup.count}</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors text-sm">
              Manage
            </button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-light rounded-xl p-6">
        <h3 className="font-semibold text-lg text-text-dark mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            'View All Users',
            'Assign Roles',
            'Update Permissions',
            'Manage Approvals',
          ].map((action, idx) => (
            <button
              key={idx}
              className="px-4 py-3 bg-white border-2 border-primary text-primary rounded-lg font-semibold text-sm hover:bg-primary hover:text-white transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
