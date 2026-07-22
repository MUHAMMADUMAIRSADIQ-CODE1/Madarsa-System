import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useAuth } from '../../context/AuthContext';
import MobileMenu from './MobileMenu';
import settingsService from '../../services/settingsService';
import logo from '../../assets/logo.png';

const visibleLinks = [
  { label: 'Home', path: '/' },
  { label: 'Courses', path: '/courses' },
  { label: 'Admissions', path: '/admissions' },
  { label: 'Contact', path: '/contact' },
];

const dropdownLinks = [
  { label: 'About', path: '/about' },
  { label: 'Teachers', path: '/teachers' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'News', path: '/news' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrolled = useScrollPosition(40);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const moreRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await settingsService.getPublicSettings();
        if (!cancelled) {
          setSettings(res?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Settings unavailable, using defaults');
        }
      } finally {
        if (!cancelled) {
          setSettingsLoaded(true);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const s = settings?.content || {};
  const academyName = s.academyName || 'Jamia Tul Uloom';
  const shortName = s.shortName || 'Muhammadiya';
  const currentPath = location.pathname;

  const handleDashboard = () => {
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user?.role === 'teacher') navigate('/teacher/dashboard');
    else navigate('/student/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = currentPath === '/';

  // Check if any dropdown item matches the current page
  const moreActive = dropdownLinks.some(
    (link) => link.path === currentPath || (link.path !== '/' && currentPath.startsWith(link.path))
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        moreRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [moreOpen]);

  // Close dropdown when navigating
  const handleMoreNav = useCallback(() => {
    setMoreOpen(false);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${
          scrolled || !isHome
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_20px_rgba(11,79,48,0.08)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
{/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 group min-w-0"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0 overflow-hidden rounded-xl">
                <img src={logo} alt={`${academyName} Logo`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading text-sm sm:text-lg lg:text-xl font-bold leading-tight text-primary transition-colors duration-500 truncate">
                  {academyName}
                </span>
                <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium tracking-[0.2em] uppercase text-gold transition-colors duration-500 truncate">
                  {shortName}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center" aria-label="Main navigation">
              <ul className="flex items-center gap-1">
                {visibleLinks.map((link) => {
                  const isActive = link.path === currentPath || (link.path !== '/' && currentPath.startsWith(link.path));
                  return (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'text-primary bg-primary-light'
                            : scrolled || !isHome
                              ? 'text-text-body hover:text-primary hover:bg-primary-light'
                              : 'text-text-dark/85 hover:text-primary hover:bg-primary-light/60'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}

                {/* More Dropdown */}
                <li ref={moreRef} className="relative">
                  <button
                    onClick={() => setMoreOpen((prev) => !prev)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setMoreOpen(true);
                      }
                    }}
                    aria-expanded={moreOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      moreActive || moreOpen
                        ? 'text-primary bg-primary-light'
                        : scrolled || !isHome
                          ? 'text-text-body hover:text-primary hover:bg-primary-light'
                          : 'text-text-dark/85 hover:text-primary hover:bg-primary-light/60'
                    }`}
                  >
                    <span>More</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Panel */}
                  <div
                    className={`absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl border border-border-light shadow-[0_8px_40px_rgba(11,79,48,0.12)] overflow-hidden transition-all duration-200 origin-top-right ${
                      moreOpen
                        ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
                    role="menu"
                    aria-label="More navigation"
                  >
                    <div className="py-2">                      {dropdownLinks.map((link) => {
                        const isActive = link.path === currentPath || (link.path !== '/' && currentPath.startsWith(link.path));
                        return (
                          <Link
                            key={link.label}
                            to={link.path}
                            onClick={handleMoreNav}
                            role="menuitem"
                            className={`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? 'text-primary bg-primary-light border-l-[3px] border-primary'
                                : 'text-text-body hover:text-primary hover:bg-primary-light/60 border-l-[3px] border-transparent hover:border-l-primary/50'
                            }`}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </li>
              </ul>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleDashboard}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      scrolled || !isHome
                        ? 'text-text-body hover:text-primary hover:bg-primary-light'
                        : 'text-text-dark/85 hover:text-primary hover:bg-primary-light/60'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                      scrolled || !isHome
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/25'
                        : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/25'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      scrolled || !isHome
                        ? 'text-text-body hover:text-primary hover:bg-primary-light'
                        : 'text-text-dark/85 hover:text-primary hover:bg-primary-light/60'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                      scrolled || !isHome
                        ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/25 hover:shadow-primary/35'
                        : 'bg-gold text-white hover:bg-gold-dark shadow-gold/25 hover:shadow-gold/35'
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -mr-2 rounded-lg transition-colors duration-300 flex-shrink-0"
              aria-label="Open menu"
            >
              <div className="w-5 h-4 sm:w-6 sm:h-5 flex flex-col justify-between">
                <span className="block h-0.5 w-5 sm:w-6 rounded-full bg-text-dark transition-colors duration-500" />
                <span className="block h-0.5 w-4 sm:w-5 rounded-full bg-text-dark transition-colors duration-500" />
                <span className="block h-0.5 w-5 sm:w-6 rounded-full bg-text-dark transition-colors duration-500" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
