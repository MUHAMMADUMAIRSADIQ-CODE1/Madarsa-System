import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiFileText, FiBookOpen, FiUsers, FiClipboard,
  FiImage, FiFile, FiShield, FiSettings, FiCalendar,
  FiUser, FiLogOut
} from 'react-icons/fi';

export default function AdminSidebar({ isOpen, onClose, items }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mainItems = items.filter(item => item.section === 'main');
  const accountItems = items.filter(item => item.section === 'account');

  const handleClick = (sectionId) => {
    if (sectionId === 'home') {
      navigate('/');
    } else {
      navigate(`/admin/${sectionId}`);
    }
    onClose();
  };

  const activeItem = currentPath.split('/').pop();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 sm:w-72 bg-gradient-to-b from-white to-bg-light shadow-xl overflow-y-auto transition-transform duration-300 z-40 lg:z-0 lg:relative lg:shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark p-5 sm:p-6 border-b border-border-light z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-heading font-bold text-white truncate">Admin Panel</h2>
              <p className="text-xs text-green-100">Full Access</p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-primary-dark rounded-lg transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {mainItems.map(item => {
            const iconMap = {
              home: FiHome,
              file: FiFileText,
              book: FiBookOpen,
              users: FiUsers,
              'users-alt': FiUsers,
              clipboard: FiClipboard,
              image: FiImage,
              newspaper: FiFile,
              shield: FiShield,
              settings: FiSettings,
              calendar: FiCalendar,
            };
            const Icon = iconMap[item.icon] || FiHome;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
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

          <div className="my-4 border-t border-border-light" />

          <p className="px-4 py-2 text-xs font-semibold text-text-light uppercase tracking-wider">Account</p>
          {accountItems.map(item => {
            const iconMap = {
              user: FiUser,
              settings: FiSettings,
              logout: FiLogOut,
            };
            const Icon = iconMap[item.icon] || FiUser;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
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

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 mt-4 border-t border-border-light pt-4"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </nav>

        <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-border-light bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
              {(user?.fullName || user?.name || 'A').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-dark truncate">{user?.fullName || user?.name}</p>
              <p className="text-xs text-text-light truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
