import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useAuth } from '../../context/AuthContext';
import MobileMenu from './MobileMenu';
import settingsService from '../../services/settingsService';
import logo from '../../assets/logo.png';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Courses', path: '/courses' },
  { label: 'Teachers', path: '/teachers' },
  { label: 'Admissions', path: '/admissions' },
  { label: 'News', path: '/news' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrolled = useScrollPosition(40);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

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
                {navLinks.map((link) => {
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
