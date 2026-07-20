import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import studentPortalService from '../services/studentPortalService';
import courseService from '../services/courseService';
import uploadService from '../services/uploadService';
import { FiUpload, FiTrash2, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardNavbar from '../components/Dashboard/DashboardNavbar';
import WelcomeSection from '../components/Dashboard/WelcomeSection';
import UpcomingClassesSection from '../components/Dashboard/UpcomingClassesSection';
import MyCoursesSection from '../components/Dashboard/MyCoursesSection';
import AssignmentsSection from '../components/Dashboard/AssignmentsSection';
import AttendanceSection from '../components/Dashboard/AttendanceSection';
import CertificatesSection from '../components/Dashboard/CertificatesSection';
import StudentDashboardHome from '../components/Dashboard/StudentDashboardHome';
import StudentTeacherSection from '../components/Dashboard/StudentTeacherSection';
import { studentDashboardData } from '../data/studentDashboardData';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, changePassword, changeEmail, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    studentName: '', fatherName: '', gender: 'male', dateOfBirth: '',
    nationality: '', phone: '', whatsapp: '', email: '', country: '', city: '',
    address: '', postalCode: '', emergencyContact: '', emergencyPhone: '',
    previousEducation: '', currentQualification: '', bio: '',
    languages: [], skills: [], studentPhoto: ''
  });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [uploading, setUploading] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
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

  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await courseService.getPublishedCourses({ limit: 200 });
        if (res?.data?.data) {
          setAvailableCourses(res.data.data);
        }
      } catch (_) { }
      setCoursesLoading(false);
    };
    loadCourses();

    const loadProfile = async () => {
      try {
        const res = await studentPortalService.getProfile();
        if (res?.data) {
          const existing = res.data;
          setStudentProfile(existing);
          if (existing.courses && Array.isArray(existing.courses)) {
            const courseIds = existing.courses
              .filter(c => c.course && c.course._id)
              .map(c => c.course._id);
            setSelectedCourses(courseIds);
          }
          setProfileForm({
            studentName: existing.studentName || user?.fullName || user?.name || '',
            fatherName: existing.fatherName || '',
            dateOfBirth: existing.dateOfBirth ? existing.dateOfBirth.split('T')[0] : '',
            gender: existing.gender || 'male',
            nationality: existing.nationality || '',
            phone: existing.phone || user?.phone || '',
            whatsapp: existing.whatsapp || '',
            email: existing.email || user?.email || '',
            address: existing.address || '',
            city: existing.city || user?.city || '',
            country: existing.country || user?.country || '',
            postalCode: existing.postalCode || '',
            emergencyContact: existing.emergencyContact || '',
            emergencyPhone: existing.emergencyPhone || '',
            previousEducation: existing.previousEducation || '',
            currentQualification: existing.currentQualification || '',
            bio: existing.bio || '',
            languages: existing.languages || [],
            skills: existing.skills || [],
            studentPhoto: existing.studentPhoto || '',
          });
        }
      } catch (_) {}
    };
    loadProfile();
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleArrayChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const res = await uploadService.uploadFile(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setProfileForm(prev => ({ ...prev, [fieldName]: url }));
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const removeSingleFile = (fieldName) => {
    setProfileForm(prev => ({ ...prev, [fieldName]: '' }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!studentProfile?._id) return;
    try {
      setSaving(true);
      const submitData = {
        ...profileForm,
        selectedCourses,
      };
      const res = await studentPortalService.updateProfile(studentProfile._id, submitData);
      if (res?.data) {
        setStudentProfile(res.data);
      }
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
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

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success(result?.message || 'Password changed successfully. Please log in again.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setRedirectCountdown(3);
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
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

    if (!emailForm.newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setEmailSubmitting(true);
    try {
      const result = await changeEmail(emailForm.newEmail, emailForm.password);
      if (result) {
        toast.success(`Email changed to ${emailForm.newEmail}. Please log in again.`);
        setEmailForm({ newEmail: '', password: '' });
        setRedirectCountdown(3);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change email');
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
        return <StudentDashboardHome />;

      case 'teacher':
        return <StudentTeacherSection />;

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
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-text-dark mb-4 capitalize">{activeSection.replace('-', ' ')}</h2>
            <p className="text-text-light max-w-md mx-auto">This section is currently under development. Please check back later.</p>
          </div>
        );

      case 'notifications': {
        const notifications = studentDashboardData.notifications;
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
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-6">
                    {/* ── STEP 1: PERSONAL INFORMATION ── */}
                    <div className="bg-bg-light/40 p-4 rounded-xl border border-border-light space-y-4">
                      <h3 className="font-heading font-semibold text-text-dark text-sm flex items-center gap-2 border-b border-border-light pb-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">1</span>
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Full Name *</label>
                          <input type="text" name="studentName" value={profileForm.studentName} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Father Name *</label>
                          <input type="text" name="fatherName" value={profileForm.fatherName} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Date of Birth *</label>
                          <input type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Gender *</label>
                          <select name="gender" value={profileForm.gender} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Nationality *</label>
                          <input type="text" name="nationality" value={profileForm.nationality} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 2: CONTACT & ADDRESS ── */}
                    <div className="bg-bg-light/40 p-4 rounded-xl border border-border-light space-y-4">
                      <h3 className="font-heading font-semibold text-text-dark text-sm flex items-center gap-2 border-b border-border-light pb-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">2</span>
                        Contact & Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Phone Number *</label>
                          <input type="tel" name="phone" value={profileForm.phone} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">WhatsApp Number *</label>
                          <input type="tel" name="whatsapp" value={profileForm.whatsapp} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Email (Read Only)</label>
                          <input type="email" name="email" value={profileForm.email} readOnly
                            className="w-full px-4 py-2 border border-border-light rounded-xl bg-gray-50 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Country *</label>
                          <input type="text" name="country" value={profileForm.country} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">City *</label>
                          <input type="text" name="city" value={profileForm.city} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Postal Code</label>
                          <input type="text" name="postalCode" value={profileForm.postalCode} onChange={handleProfileChange}
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-text-dark mb-1">Address *</label>
                          <textarea name="address" value={profileForm.address} onChange={handleProfileChange} rows={2} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Emergency Contact Name *</label>
                          <input type="text" name="emergencyContact" value={profileForm.emergencyContact} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Emergency Contact Phone *</label>
                          <input type="tel" name="emergencyPhone" value={profileForm.emergencyPhone} onChange={handleProfileChange} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 3: EDUCATION & COURSES ── */}
                    <div className="bg-bg-light/40 p-4 rounded-xl border border-border-light space-y-4">
                      <h3 className="font-heading font-semibold text-text-dark text-sm flex items-center gap-2 border-b border-border-light pb-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">3</span>
                        Education & Courses
                      </h3>
                      
                      {/* Preferred Courses Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-text-dark mb-2">
                          Preferred Courses *
                          <span className="text-xs text-text-light font-normal ml-2">(Choose courses you wish to study)</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-border-light rounded-xl bg-white">
                          {availableCourses.map(course => {
                            const isSelected = selectedCourses.includes(course._id);
                            return (
                              <button
                                key={course._id}
                                type="button"
                                onClick={() => toggleCourse(course._id)}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                                  isSelected ? 'border-primary bg-primary/5' : 'border-border-light hover:border-primary/50'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                                  isSelected ? 'bg-primary text-white' : 'border border-border-light'
                                }`}>
                                  {isSelected && <FiCheck className="w-3 h-3" />}
                                </div>
                                <span className="text-xs font-semibold text-text-dark truncate">{course.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Previous Institute / School (Optional)</label>
                          <textarea name="previousEducation" value={profileForm.previousEducation} onChange={handleProfileChange} rows={2}
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Current Qualification (Optional)</label>
                          <textarea name="currentQualification" value={profileForm.currentQualification} onChange={handleProfileChange} rows={2}
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 4: DOCUMENTS ── */}
                    <div className="bg-bg-light/40 p-4 rounded-xl border border-border-light space-y-4">
                      <h3 className="font-heading font-semibold text-text-dark text-sm flex items-center gap-2 border-b border-border-light pb-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">4</span>
                        Documents
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Student Photo</label>
                        {profileForm.studentPhoto && (
                          <div className="mb-2 relative inline-block">
                            <img src={profileForm.studentPhoto} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                            <button type="button" onClick={() => removeSingleFile('studentPhoto')}
                              className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow">
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border-light hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
                          {uploading.studentPhoto ? (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiUpload className="w-4 h-4 text-text-light" />
                          )}
                          <span className="text-xs text-text-light">{profileForm.studentPhoto ? 'Replace' : 'Upload'} Photo</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload('studentPhoto', e.target.files[0])} className="hidden" disabled={uploading.studentPhoto} />
                        </label>
                      </div>
                    </div>

                    {/* ── STEP 5: BIO & SKILLS ── */}
                    <div className="bg-bg-light/40 p-4 rounded-xl border border-border-light space-y-4">
                      <h3 className="font-heading font-semibold text-text-dark text-sm flex items-center gap-2 border-b border-border-light pb-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">5</span>
                        Bio & Skills
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-text-dark mb-1">Bio *</label>
                          <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} rows={3} required
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Languages *</label>
                          <input type="text" value={profileForm.languages.join(', ')} onChange={(e) => handleArrayChange('languages', e.target.value)} required placeholder="e.g. Urdu, English, Arabic"
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Skills *</label>
                          <input type="text" value={profileForm.skills.join(', ')} onChange={(e) => handleArrayChange('skills', e.target.value)} required placeholder="e.g. Quran recitation, Tajweed"
                            className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-border-light">
                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
                      {saving ? 'Saving...' : 'Save Changes'}
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
