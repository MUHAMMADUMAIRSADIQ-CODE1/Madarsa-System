import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardNavbar from '../components/Dashboard/DashboardNavbar';
import WelcomeSection from '../components/Dashboard/WelcomeSection';
import UpcomingClassesSection from '../components/Dashboard/UpcomingClassesSection';
import MyCoursesSection from '../components/Dashboard/MyCoursesSection';
import AssignmentsSection from '../components/Dashboard/AssignmentsSection';
import AttendanceSection from '../components/Dashboard/AttendanceSection';
import CertificatesSection from '../components/Dashboard/CertificatesSection';
import { studentDashboardData } from '../data/studentDashboardData';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile, changePassword, changeEmail, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || '',
    city: user?.city || '',
    gender: user?.gender || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
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
    try {
      setSaving(true);
      const result = await updateProfile(profileForm);
      if (result) {
        setProfileSuccess('Profile updated successfully');
        setTimeout(() => setProfileSuccess(null), 3000);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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
        setRedirectCountdown(3);
      }
    } catch (err) {
      setEmailError(err.message || 'Failed to change email');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const goToSection = (section) => {
    navigate(`/student/${section}`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <WelcomeSection />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <UpcomingClassesSection />
                <MyCoursesSection />
              </div>
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Your Progress</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                      <span className="text-sm text-text-light">Active Courses</span>
                      <span className="font-bold text-primary">{studentDashboardData.stats?.activeCourses || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                      <span className="text-sm text-text-light">Completed Courses</span>
                      <span className="font-bold text-green-600">{studentDashboardData.stats?.completedCourses || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                      <span className="text-sm text-text-light">Attendance</span>
                      <span className="font-bold text-primary">{studentDashboardData.attendance?.percentage || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                      <span className="text-sm text-text-light">Pending Assignments</span>
                      <span className="font-bold text-orange-600">{studentDashboardData.stats?.pendingAssignments || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                      <span className="text-sm text-text-light">Certificates Earned</span>
                      <span className="font-bold text-blue-600">{studentDashboardData.certificates?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                      <span className="text-sm text-text-light">Average Score</span>
                      <span className="font-bold text-purple-600">{studentDashboardData.stats?.averageScore || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    <button onClick={() => goToSection('courses')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left">
                      <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25m20-11c5.5 0 10 4.745 10 11" /></svg>
                      <span className="text-sm font-medium text-text-body">View My Courses</span>
                    </button>
                    <button onClick={() => goToSection('assignments')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left">
                      <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      <span className="text-sm font-medium text-text-body">Pending Assignments</span>
                    </button>
                    <button onClick={() => goToSection('attendance')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium text-text-body">View Attendance</span>
                    </button>
                    <button onClick={() => goToSection('certificates')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-medium text-text-body">My Certificates</span>
                    </button>
                    <button onClick={() => goToSection('notifications')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <span className="text-sm font-medium text-text-body">Notifications</span>
                    </button>
                  </div>
                </div>

                {/* Notifications Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg font-bold text-text-dark">Recent Notifications</h3>
                    <button onClick={() => goToSection('notifications')} className="text-primary text-sm font-semibold hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {(studentDashboardData.notifications || []).slice(0, 3).map((n) => (
                      <div key={n.id} className={`p-3 rounded-xl border ${n.read ? 'border-border-light' : 'border-primary/30 bg-primary/5'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${n.read ? 'bg-gray-300' : 'bg-primary'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-dark">{n.title}</p>
                            <p className="text-xs text-text-light mt-0.5">{n.message}</p>
                            <p className="text-xs text-text-light mt-1">{n.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!studentDashboardData.notifications || studentDashboardData.notifications.length === 0) && (
                      <p className="text-sm text-text-light text-center py-4">No notifications</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'courses':
        return <MyCoursesSection />;

      case 'assignments':
        return <AssignmentsSection />;

      case 'attendance':
        return <AttendanceSection />;

      case 'certificates':
        return <CertificatesSection />;

      case 'live-classes':
      case 'fees':
      case 'messages':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">
              {activeSection === 'live-classes' ? 'Live Classes' : activeSection === 'fees' ? 'Fee Status' : 'Messages'}
            </h1>
            <div className="text-center py-12">
              <p className="text-text-light">Coming soon...</p>
            </div>
          </div>
        );

      case 'notifications': {
        const notifications = studentDashboardData.notifications || [];
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-heading text-3xl font-bold text-text-dark">Notifications</h1>
                <p className="text-sm text-text-light mt-1">{notifications.filter((n) => !n.read).length} unread</p>
              </div>
            </div>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 rounded-xl border ${n.read ? 'border-border-light bg-white' : 'border-primary/30 bg-primary/5'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 mt-1.5 rounded-full flex-shrink-0 ${n.read ? 'bg-gray-300' : 'bg-primary'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-text-dark">{n.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          n.type === 'class' ? 'bg-blue-100 text-blue-700' :
                          n.type === 'assignment' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>{n.type}</span>
                      </div>
                      <p className="text-sm text-text-light mt-1">{n.message}</p>
                      <p className="text-xs text-text-light mt-2">{n.date}</p>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-text-light">No notifications</p>
                </div>
              )}
            </div>
          </div>
        );
      }

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
                  {(user?.fullName || user?.name || 'S').charAt(0)}
                </div>
                <div>
                  <h1 className="font-heading text-3xl font-bold">{user?.fullName || user?.name}</h1>
                  <p className="text-green-100 opacity-90 mt-1">{user?.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">Student</span>
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
                      <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                      <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Phone</label>
                      <input type="tel" name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Gender</label>
                      <select name="gender" value={profileForm.gender} onChange={handleProfileChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
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
                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setProfileForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', country: user?.country || '', city: user?.city || '', gender: user?.gender || '' })} className="px-6 py-2.5 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors">
                      Reset
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
                      <span className="text-sm font-semibold text-text-dark capitalize">{user?.role}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border-light">
                      <span className="text-sm text-text-light">Joined</span>
                      <span className="text-sm font-semibold text-text-dark">{user?.createdAt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-text-light">Courses</span>
                      <span className="text-sm font-semibold text-text-dark">{user?.enrolledCourses?.length || 0}</span>
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
            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-border-light">
                  <div>
                    <p className="font-semibold text-text-dark">Email Notifications</p>
                    <p className="text-sm text-text-light mt-1">Receive email updates about classes and assignments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border-light">
                  <div>
                    <p className="font-semibold text-text-dark">SMS Notifications</p>
                    <p className="text-sm text-text-light mt-1">Receive SMS reminders for upcoming classes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border-light">
                  <div>
                    <p className="font-semibold text-text-dark">Class Reminders</p>
                    <p className="text-sm text-text-light mt-1">Get reminded 30 minutes before each class</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-text-dark">Public Profile</p>
                    <p className="text-sm text-text-light mt-1">Make your profile visible to other students</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-red-100">
              <h2 className="font-heading text-2xl font-bold text-red-600 mb-4">Danger Zone</h2>
              <p className="text-sm text-text-light mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button onClick={() => { if (confirm('Are you sure you want to delete your account? This cannot be undone.')) { logout(); navigate('/'); } }} className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm">
                Delete Account
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
