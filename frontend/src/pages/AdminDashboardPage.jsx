import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/Dashboard/AdminSidebar';
import DashboardNavbar from '../components/Dashboard/DashboardNavbar';
import AdminWelcomeSection from '../components/Dashboard/AdminWelcomeSection';
import AdminRecentActivitiesSection from '../components/Dashboard/AdminRecentActivitiesSection';
import AdminContentManagementSection from '../components/Dashboard/AdminContentManagementSection';
import AdminUserManagementSection from '../components/Dashboard/AdminUserManagementSection';
import AdminHeroManagementSection from '../components/Hero/HeroManagement';
import AdminAboutManagementSection from '../components/About/AboutManagement';
import AdminContactManagementSection from '../components/Contact/ContactManagement';
import AdminSettingsManagementSection from '../components/Settings/SettingsManagement';
import AdminFooterManagementSection from '../components/Footer/FooterManagement';
import AdminCourseManagementSection from '../components/Courses/CourseManagement';
import AdminTeacherManagementSection from '../components/Teachers/TeacherManagement';
import AdminAdmissionManagementSection from '../components/Admissions/AdmissionManagement';
import AdminStudentManagementSection from '../components/Students/StudentManagement';
import AdminAttendanceSection from '../components/Dashboard/AdminAttendanceSection';
import AdminProfileVerificationSection from '../components/Dashboard/AdminProfileVerificationSection';
import { useAuth } from '../context/AuthContext';

const adminSidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', section: 'main' },
  { id: 'hero', label: 'Hero Section', icon: 'file', section: 'main' },
  { id: 'about', label: 'About', icon: 'file', section: 'main' },
  { id: 'contact', label: 'Contact', icon: 'file', section: 'main' },
  { id: 'content-management', label: 'Website Content', icon: 'file', section: 'main' },
  { id: 'courses', label: 'Course Management', icon: 'book', section: 'main' },
  { id: 'teachers', label: 'Teachers', icon: 'users', section: 'main' },
  { id: 'students', label: 'Students', icon: 'users-alt', section: 'main' },
  { id: 'attendance', label: 'Attendance', icon: 'calendar', section: 'main' },
  { id: 'admissions', label: 'Admissions', icon: 'clipboard', section: 'main' },
  { id: 'gallery', label: 'Gallery', icon: 'image', section: 'main' },
  { id: 'news', label: 'News & Events', icon: 'newspaper', section: 'main' },
  { id: 'users-roles', label: 'Users & Roles', icon: 'shield', section: 'main' },
  { id: 'profile-verifications', label: 'Profile Verifications', icon: 'shield', section: 'main' },
  { id: 'website-settings', label: 'Website Settings', icon: 'settings', section: 'main' },
  { id: 'footer', label: 'Footer', icon: 'file', section: 'main' },
  { id: 'settings', label: 'Account Settings', icon: 'settings', section: 'account' },
  { id: 'profile', label: 'Profile', icon: 'user', section: 'account' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile, changePassword, changeEmail, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || '',
    city: user?.city || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  const activeSection = location.pathname.split('/').pop();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Force re-login countdown after password/email change
  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      logout();
      navigate('/login');
      return;
    }
    const timer = setTimeout(() => setRedirectCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, logout, navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileSaving(true);
    try {
      const result = await updateProfile(profileForm);
      if (result) {
        setProfileSuccess('Profile updated successfully');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess(result?.message || 'Password changed successfully. Please log in again.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Force re-login after password change
      setRedirectCountdown(3);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (!emailForm.newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailSubmitting(true);
    try {
      const result = await changeEmail(emailForm.newEmail, emailForm.password);
      if (result) {
        setEmailSuccess(`Email changed to ${emailForm.newEmail}. Please log in again.`);
        setEmailForm({ newEmail: '', password: '' });
        // Force re-login after email change
        setRedirectCountdown(3);
      }
    } catch (err) {
      setEmailError(err.message || 'Failed to change email');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">Dashboard Overview</h1>
              <AdminWelcomeSection />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AdminRecentActivitiesSection />
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-heading text-lg font-bold text-text-dark mb-4">System Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Server Status', status: 'Online', color: 'green' },
                    { label: 'Database', status: 'Healthy', color: 'green' },
                    { label: 'API Response', status: '45ms', color: 'green' },
                    { label: 'Storage', status: '65% Used', color: 'yellow' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-bg-light rounded-lg">
                      <span className="text-sm text-text-light">{item.label}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <AdminContentManagementSection />
          </div>
        );
      
      case 'content-management':
        return <AdminContentManagementSection />;
      
      case 'courses':
        return <AdminCourseManagementSection />;
      
      case 'teachers':
        return <AdminTeacherManagementSection />;
      
      case 'students':
        return <AdminStudentManagementSection />;
      
      case 'attendance':
        return <AdminAttendanceSection />;

      case 'admissions':
        return <AdminAdmissionManagementSection />;
      
      case 'hero':
        return <AdminHeroManagementSection />;

      case 'about':
        return <AdminAboutManagementSection />;

      case 'contact':
        return <AdminContactManagementSection />;

      case 'website-settings':
        return <AdminSettingsManagementSection />;

      case 'footer':
        return <AdminFooterManagementSection />;

      case 'users-roles':
        return <AdminUserManagementSection />;

      case 'profile-verifications':
        return <AdminProfileVerificationSection />;
      
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-dark rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <svg className="w-64 h-64" viewBox="0 0 400 400" fill="none">
                  <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" />
                  <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-3xl font-bold">
                  {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h1 className="font-heading text-3xl font-bold">{user?.fullName || user?.name}</h1>
                  <p className="text-green-100 opacity-90 mt-1">{user?.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">Admin</span>
                    {user?.country && <span className="text-xs text-green-100">{user?.country}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Edit Profile Form */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="font-heading text-2xl font-bold text-text-dark mb-6">Edit Profile</h2>
                {profileSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{profileSuccess}</div>}
                {profileError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{profileError}</div>}
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Full Name</label>
                      <input type="text" name="fullName" value={profileForm.fullName} onChange={handleProfileChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                      <input type="email" value={profileForm.email} className="w-full px-4 py-2.5 border border-border-light rounded-xl bg-gray-50 text-gray-500 outline-none" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Phone</label>
                      <input type="tel" name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Country</label>
                      <input type="text" name="country" value={profileForm.country} onChange={handleProfileChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">City</label>
                      <input type="text" name="city" value={profileForm.city} onChange={handleProfileChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-border-light">
                    <button type="submit" disabled={profileSaving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Account Info Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Account Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border-light">
                      <span className="text-sm text-text-light">Role</span>
                      <span className="text-sm font-semibold text-text-dark capitalize">Admin</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border-light">
                      <span className="text-sm text-text-light">Email</span>
                      <span className="text-sm font-semibold text-text-dark">{user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Change Password</h3>
                  {passwordSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{passwordSuccess}</div>}
                  {passwordError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{passwordError}</div>}
                  <form onSubmit={handlePasswordSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Current Password</label>
                      <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">New Password</label>
                      <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required minLength={8} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Confirm New Password</label>
                      <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required minLength={8} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <button type="submit" disabled={passwordSubmitting} className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm">
                      {passwordSubmitting ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Change Email */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Change Email</h3>
                  <p className="text-sm text-text-light mb-4">Current email: <strong>{user?.email}</strong></p>
                  {emailSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{emailSuccess}</div>}
                  {emailError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{emailError}</div>}
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">New Email Address</label>
                      <input type="email" name="newEmail" value={emailForm.newEmail} onChange={handleEmailChange} required placeholder="new@email.com" className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Current Password</label>
                      <input type="password" name="password" value={emailForm.password} onChange={handleEmailChange} required placeholder="Enter password to confirm" className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <button type="submit" disabled={emailSubmitting} className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm">
                      {emailSubmitting ? 'Updating...' : 'Change Email'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-border-light">
                  <div>
                    <p className="font-semibold text-text-dark">Email Notifications</p>
                    <p className="text-sm text-text-light mt-1">Receive email updates about platform activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'gallery':
      case 'news':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')}
            </h1>
            <div className="text-center py-12">
              <p className="text-text-light">Coming soon...</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={adminSidebarItems}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <DashboardNavbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
