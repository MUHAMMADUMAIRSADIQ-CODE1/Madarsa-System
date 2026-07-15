import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', section: 'main', path: '/student/dashboard' },
  { id: 'courses', label: 'My Courses', icon: 'book', section: 'main', path: '/student/courses' },
  { id: 'live-classes', label: 'Live Classes', icon: 'video', section: 'main', path: '/student/live-classes' },
  { id: 'assignments', label: 'Assignments', icon: 'tasks', section: 'main', path: '/student/assignments' },
  { id: 'attendance', label: 'Attendance', icon: 'calendar', section: 'main', path: '/student/attendance' },
  { id: 'certificates', label: 'Certificates', icon: 'award', section: 'main', path: '/student/certificates' },
  { id: 'fees', label: 'Fee Status', icon: 'wallet', section: 'main', path: '/student/fees' },
  { id: 'messages', label: 'Messages', icon: 'mail', section: 'main', path: '/student/messages', badge: 3 },
  { id: 'notifications', label: 'Notifications', icon: 'bell', section: 'main', path: '/student/notifications', badge: 2 },
  { id: 'profile', label: 'Profile', icon: 'user', section: 'account', path: '/student/profile' },
  { id: 'settings', label: 'Settings', icon: 'settings', section: 'account', path: '/student/settings' },
];

const iconComponents = {
  home: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4" /></svg>,
  book: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25m20-11c5.5 0 10 4.745 10 11m-15-6.25c0-4.418-3.582-8-8-8" /></svg>,
  video: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  tasks: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  award: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  wallet: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V5a3 3 0 00-3-3H6a3 3 0 00-3 3v11a3 3 0 003 3z" /></svg>,
  mail: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  bell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  user: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  logout: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

export default function Sidebar({ isOpen, onClose }) {
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
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-xl overflow-y-auto transition-transform duration-300 z-40 lg:z-0 lg:relative lg:shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-border-light z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h2 className="font-heading font-bold text-text-dark">Menu</h2>
              <p className="text-xs text-text-light">Student Portal</p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-primary-light rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {mainItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeItem === item.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-text-body hover:bg-primary-light hover:text-primary'
              }`}
            >
              {iconComponents[item.icon]}
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Divider */}
          <div className="my-4 border-t border-border-light" />

          {/* Account Section */}
          <p className="px-4 py-2 text-xs font-semibold text-text-light uppercase tracking-wider">Account</p>
          {accountItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeItem === item.id
                  ? 'bg-primary text-white'
                  : 'text-text-body hover:bg-primary-light hover:text-primary'
              }`}
            >
              {iconComponents[item.icon]}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 mt-4 border-t border-border-light pt-4"
          >
            {iconComponents.logout}
            <span className="font-medium text-sm">Logout</span>
          </button>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-dark truncate">{user?.name}</p>
              <p className="text-xs text-text-light truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
