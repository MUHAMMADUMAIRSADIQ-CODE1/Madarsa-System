import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardNavbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const pathname = location.pathname;
  const role = pathname.startsWith('/student') ? 'student'
    : pathname.startsWith('/teacher') ? 'teacher'
    : pathname.startsWith('/admin') ? 'admin'
    : 'student';

  const getPageTitle = () => {
    const segment = pathname.split('/').pop();
    const titles = {
      dashboard: 'Dashboard',
      courses: role === 'admin' ? 'Course Management' : 'My Courses',
      'live-classes': 'Live Classes',
      assignments: 'Assignments',
      attendance: 'Attendance',
      certificates: 'Certificates',
      fees: 'Fee Status',
      messages: 'Messages',
      notifications: 'Notifications',
      profile: 'My Profile',
      settings: role === 'admin' ? 'Account Settings' : 'Settings',
      students: role === 'teacher' ? 'My Students' : 'Students',
      schedule: 'Schedule',
      announcements: 'Announcements',
      'content-management': 'Website Content',
      'users-roles': 'Users & Roles',
      admissions: 'Admissions',
      teachers: 'Teachers',
      'website-settings': 'Website Settings',
      hero: 'Hero Section',
      about: 'About',
      contact: 'Contact',
      footer: 'Footer',
      gallery: 'Gallery',
      news: 'News & Events',
    };
    return titles[segment] || 'Dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-20 bg-white shadow-sm border-b border-border-light">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-primary-light rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page Title */}
          <div>
            <h1 className="font-heading text-xl font-bold text-text-dark">{getPageTitle()}</h1>
            <p className="text-xs text-text-light hidden sm:block">Welcome back, {(user?.fullName || user?.name || 'User').split(' ')[0]}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden sm:flex items-center bg-bg-light rounded-xl px-4 py-2 border border-border-light">
            <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent ml-2 outline-none text-sm text-text-body placeholder-text-light w-32"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-primary-light rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Notifications Dropdown */}
            <div
              className={`absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border-light overflow-hidden transition-all duration-200 ${
                showNotifications ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
            >
              <div className="p-4 border-b border-border-light">
                <h3 className="font-semibold text-text-dark">Notifications</h3>
              </div>
              <div className="divide-y divide-border-light max-h-96 overflow-y-auto">
                {[
                  { id: 1, title: 'New Assignment', message: 'Islamic Studies - Chapter 5', time: '10 mins ago' },
                  { id: 2, title: 'Class Starting Soon', message: 'Arabic Grammar starts in 30 minutes', time: '20 mins ago' },
                  { id: 3, title: 'Fee Due', message: 'Your monthly fee is due on 15th', time: '2 hours ago' },
                ].map(notif => (
                  <div key={notif.id} className="p-4 hover:bg-bg-light transition-colors cursor-pointer">
                    <p className="font-semibold text-sm text-text-dark">{notif.title}</p>
                    <p className="text-xs text-text-light mt-1">{notif.message}</p>
                    <p className="text-xs text-text-light mt-2">{notif.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <button className="relative p-2 hover:bg-primary-light rounded-lg transition-colors">
            <svg className="w-6 h-6 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative ml-2 sm:ml-4">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-primary-light rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-sm">
                {(user?.fullName || user?.name || 'S').charAt(0)}
              </div>
              <svg className="w-4 h-4 text-text-light hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* User Dropdown */}
            <div
              className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border-light overflow-hidden transition-all duration-200 ${
                showUserMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
            >
              <div className="p-4 border-b border-border-light bg-bg-light">
                <p className="font-semibold text-text-dark">{user?.fullName || user?.name}</p>
                <p className="text-xs text-text-light capitalize">{user?.role}</p>
              </div>
              <div className="divide-y divide-border-light">
                <button
                  onClick={() => { setShowUserMenu(false); navigate(`/${role}/profile`); }}
                  className="block w-full text-left px-4 py-3 text-sm text-text-body hover:bg-bg-light transition-colors"
                >
                  My Profile
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); navigate(`/${role}/settings`); }}
                  className="block w-full text-left px-4 py-3 text-sm text-text-body hover:bg-bg-light transition-colors"
                >
                  Settings
                </button>
                <button className="block w-full text-left px-4 py-3 text-sm text-text-body hover:bg-bg-light transition-colors">
                  Help & Support
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
