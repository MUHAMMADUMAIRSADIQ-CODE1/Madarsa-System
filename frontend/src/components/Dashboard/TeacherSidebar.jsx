import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiBookOpen, FiUsers, FiCalendar,
  FiUser, FiSettings, FiLogOut, FiX,
  FiMessageCircle
} from 'react-icons/fi';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome, section: 'main', path: '/teacher/dashboard' },
  { id: 'courses', label: 'My Courses', icon: FiBookOpen, section: 'main', path: '/teacher/courses' },
  { id: 'students', label: 'My Students', icon: FiUsers, section: 'main', path: '/teacher/students' },
  { id: 'schedule', label: 'Schedule', icon: FiCalendar, section: 'main', path: '/teacher/schedule' },
  { id: 'messages', label: 'Messages', icon: FiMessageCircle, section: 'main', path: '/teacher/messages' },
  { id: 'profile', label: 'Profile', icon: FiUser, section: 'account', path: '/teacher/profile' },
  { id: 'settings', label: 'Settings', icon: FiSettings, section: 'account', path: '/teacher/settings' },
];

export default function TeacherSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  const getActiveItem = () => {
    const match = sidebarItems.find(item => item.path === currentPath);
    return match?.id || 'dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeItem = getActiveItem();
  const mainItems = sidebarItems.filter(item => item.section === 'main');
  const accountItems = sidebarItems.filter(item => item.section === 'account');

  const handleClick = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 sm:w-72 bg-white shadow-xl overflow-y-auto transition-transform duration-300 z-40 lg:z-0 lg:relative lg:shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-border-light z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h2 className="font-heading font-bold text-text-dark truncate">Menu</h2>
              <p className="text-xs text-text-light">Teacher Portal</p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-primary-light rounded-lg transition-colors flex-shrink-0"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {mainItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeItem === item.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-text-body hover:bg-primary-light hover:text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-4 border-t border-border-light" />

          {/* Account Section */}
          <p className="px-4 py-2 text-xs font-semibold text-text-light uppercase tracking-wider">Account</p>
          {accountItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeItem === item.id
                    ? 'bg-primary text-white'
                    : 'text-text-body hover:bg-primary-light hover:text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 mt-4 border-t border-border-light pt-4"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </nav>

        {/* User Info */}
        <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-border-light bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
              {(user?.fullName || user?.name || 'T').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-dark truncate">{user?.fullName || user?.name}</p>
              <p className="text-xs text-text-light truncate">Teacher</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
