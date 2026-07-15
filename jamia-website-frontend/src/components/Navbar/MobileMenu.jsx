import { useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Courses', path: '/courses' },
  { label: 'Teachers', path: '/teachers' },
  { label: 'Admissions', path: '/admissions' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'News', path: '/news' },
  { label: 'Contact', path: '/contact' },
];

export default function MobileMenu({ isOpen, onClose }) {
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const currentPath = location.pathname;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => menuRef.current?.querySelector('a, button')?.focus(), 100);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleDashboard = () => {
    onClose();
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user?.role === 'teacher') navigate('/teacher/dashboard');
    else navigate('/student/dashboard');
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border-light flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-heading font-bold text-sm">
              JT
            </div>
            <div>
              <span className="font-heading text-base font-bold text-primary">Jamia Tul Uloom</span>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold leading-tight">Muhammadiya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-body hover:text-primary transition-colors rounded-lg hover:bg-primary-light -mr-2"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {navLinks.map((link, i) => {
              const isActive = link.path === currentPath || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    onClick={onClose}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium animate-fade-in ${
                      isActive
                        ? 'text-primary bg-primary-light border-l-[3px] border-primary'
                        : 'text-text-body hover:text-primary hover:bg-primary-light/60 border-l-[3px] border-transparent'
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Auth Actions */}
        <div className="flex-shrink-0 px-6 pt-4 pb-8 border-t border-border-light space-y-3">
          {isAuthenticated ? (
            <>
              {user?.name && (
                <p className="text-sm font-medium text-text-light mb-3">Signed in as {user.name}</p>
              )}
              <button
                onClick={handleDashboard}
                className="w-full text-center px-6 py-3.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary-light transition-all duration-200"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-center px-6 py-3.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-500/20"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full text-center px-6 py-3.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary-light transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="block w-full text-center px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-primary/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
