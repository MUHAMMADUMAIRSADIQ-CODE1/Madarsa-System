import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import TeacherWelcomeSection from '../components/Dashboard/TeacherWelcomeSection';
import TeacherTodaysClassesSection from '../components/Dashboard/TeacherTodaysClassesSection';
import TeacherCoursesSection from '../components/Dashboard/TeacherCoursesSection';
import TeacherAssignedStudentsSection from '../components/Dashboard/TeacherAssignedStudentsSection';
import TeacherAssignmentsSection from '../components/Dashboard/TeacherAssignmentsSection';
import TeacherScheduleSection from '../components/Dashboard/TeacherScheduleSection';
import TeacherCourseMaterialsSection from '../components/Dashboard/TeacherCourseMaterialsSection';
import TeacherResultsSection from '../components/Dashboard/TeacherResultsSection';
import TeacherAnnouncementsSection from '../components/Dashboard/TeacherAnnouncementsSection';
import TeacherMessagesSection from '../components/Dashboard/TeacherMessagesSection';
import TeacherNotificationsSection from '../components/Dashboard/TeacherNotificationsSection';
import { useAuth } from '../context/AuthContext';
import { teacherDashboardData } from '../data/teacherDashboardData';
import teacherPortalService from '../services/teacherPortalService';
import teacherAcademicService from '../services/teacherAcademicService';
import attendanceService from '../services/attendanceService';
import courseService from '../services/courseService';
import uploadService from '../services/uploadService';
import {
  FiUsers, FiBook, FiBookOpen, FiFileText, FiCheckCircle, FiCalendar, FiAward,
  FiMessageCircle, FiBarChart2, FiMail, FiBell, FiClock, FiArrowLeft, FiRefreshCw,
  FiUpload, FiTrash2, FiCheck, FiPlus
} from 'react-icons/fi';

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '', gender: '', dateOfBirth: '', nationality: '',
    phone: '', whatsapp: '', country: '', city: '', address: '',
    qualification: '', degree: '', experience: '', specialization: '',
    subjects: [], shortBio: '', teachingLanguages: [], skills: [],
    certificates: [], teachingMode: '', availability: '',
    profilePhoto: '', resume: '', additionalDocuments: []
  });
  const [certInput, setCertInput] = useState({ title: '', issuer: '', year: '' });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotal, setStudentTotal] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [attendanceFormData, setAttendanceFormData] = useState({ student: '', course: '', status: 'present', classDate: '', remarks: '' });
  const { user, changePassword, changeEmail, logout } = useAuth();

  // Force re-login countdown
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Email change state
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);

  // Active section from route path
  const section = location.pathname.split('/').pop();
  const activeSection = section || 'dashboard';

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
  }, []);

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

  const handleMultiFileUpload = async (fieldName, files) => {
    if (!files || files.length === 0) return;
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const res = await uploadService.uploadMultiple(Array.from(files));
      const urls = res?.data?.files?.map(f => f.url) || [];
      if (urls.length > 0) {
        setProfileForm(prev => ({
          ...prev,
          [fieldName]: [...(prev[fieldName] || []), ...urls],
        }));
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

  const removeArrayFile = (fieldName, index) => {
    setProfileForm(prev => {
      const current = prev[fieldName] || [];
      return {
        ...prev,
        [fieldName]: current.filter((_, i) => i !== index),
      };
    });
  };

  const addCertificate = () => {
    if (!certInput.title.trim()) return;
    setProfileForm(prev => ({
      ...prev,
      certificates: [...(prev.certificates || []), { ...certInput, year: parseInt(certInput.year) || new Date().getFullYear() }],
    }));
    setCertInput({ title: '', issuer: '', year: '' });
  };

  const removeCertificate = (index) => {
    setProfileForm(prev => ({
      ...prev,
      certificates: (prev.certificates || []).filter((_, i) => i !== index),
    }));
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await teacherPortalService.getProfile();
      if (res?.data) {
        const existing = res.data;
        setProfile(existing);
        if (existing.canTeachCourses && Array.isArray(existing.canTeachCourses)) {
          const courseIds = existing.canTeachCourses.map(c => c._id || c);
          setSelectedCourses(courseIds);
        }
        setProfileForm({
          fullName: existing.fullName || user?.fullName || '',
          gender: existing.gender || '',
          dateOfBirth: existing.dateOfBirth ? existing.dateOfBirth.split('T')[0] : '',
          nationality: existing.nationality || '',
          phone: existing.phone || user?.phone || '',
          whatsapp: existing.whatsapp || '',
          country: existing.country || user?.country || '',
          city: existing.city || user?.city || '',
          address: existing.address || '',
          qualification: existing.qualification || '',
          degree: existing.degree || '',
          experience: existing.experience || '',
          specialization: existing.specialization || '',
          subjects: existing.subjects || [],
          shortBio: existing.shortBio || '',
          teachingLanguages: existing.teachingLanguages || [],
          skills: existing.skills || [],
          certificates: existing.certificates || [],
          teachingMode: existing.teachingMode || '',
          availability: existing.availability || '',
          profilePhoto: existing.profilePhoto || '',
          resume: existing.resume || '',
          additionalDocuments: existing.additionalDocuments || [],
        });
      }
    } catch (err) {
      setError(err.message);
    }
  }, [user]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const teacherId = user?._id || user?.id;
      if (!teacherId) {
        const res = await teacherPortalService.getProfile();
        if (res?.data) {
          setProfile(res.data);
          setDashboardData(res.data);
        }
        return;
      }
      const res = await teacherPortalService.getDashboard(teacherId);
      if (res?.data) {
        const d = res.data;
        setProfile(d.profile || d);
        setDashboardData(d);
      }
    } catch (err) {
      try {
        const fallback = await teacherPortalService.getProfile();
        if (fallback?.data) {
          setProfile(fallback.data);
          setDashboardData(fallback.data);
          return;
        }
      } catch (_) {}
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchCourses = useCallback(async (id) => {
    try {
      const res = await teacherPortalService.getCourses(id);
      if (res?.data?.courses) setCourses(res.data.courses);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  }, []);

  const fetchStudents = useCallback(async (id, page = 1) => {
    try {
      const res = await teacherPortalService.getStudents(id, { page, limit: 20, search: studentSearch });
      if (res?.data) {
        setStudents(res.data.students || []);
        setStudentTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  }, [studentSearch]);

  const fetchTeacherAttendance = useCallback(async (id, date) => {
    try {
      const params = { today: 'true' };
      if (date) params.date = date;
      const res = await attendanceService.getTeacherAttendance(id, params);
      if (res?.data) {
        setAttendanceRecords(res.data.data || []);
        setAttendanceStats(res.data.stats || { total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  }, []);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);

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
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (activeSection === 'profile') {
      fetchProfile();
    }
  }, [activeSection, fetchProfile]);

  useEffect(() => {
    if (profile?._id) {
      if (activeSection === 'courses') fetchCourses(profile._id);
      if (activeSection === 'students') fetchStudents(profile._id, studentPage);
      if (activeSection === 'attendance') fetchTeacherAttendance(profile._id, attendanceDate);
      if (activeSection === 'dashboard') {
        teacherAcademicService.getDashboardAnalytics(profile._id)
          .then(res => setAnalytics(res?.data || res))
          .catch(() => {});
      }
    }
  }, [activeSection, profile?._id, studentPage, attendanceDate, fetchCourses, fetchStudents, fetchTeacherAttendance]);

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

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!profile?._id) return;
    setMarkingAttendance(true);
    try {
      await attendanceService.markTeacherAttendance({
        student: attendanceFormData.student,
        course: attendanceFormData.course,
        status: attendanceFormData.status,
        classDate: attendanceFormData.classDate || new Date().toISOString().split('T')[0],
        remarks: attendanceFormData.remarks,
      });
      setAttendanceFormData({ student: '', course: '', status: 'present', classDate: '', remarks: '' });
      fetchTeacherAttendance(profile._id, attendanceDate);
      toast.success('Attendance marked successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profile?._id) return;
    setSaving(true);
    try {
      const submitData = {
        ...profileForm,
        subjects: (profileForm.subjects || []).map(s => typeof s === 'string' ? s.trim() : s).filter(Boolean),
        teachingLanguages: (profileForm.teachingLanguages || []).map(s => typeof s === 'string' ? s.trim() : s).filter(Boolean),
        skills: (profileForm.skills || []).map(s => typeof s === 'string' ? s.trim() : s).filter(Boolean),
        canTeachCourses: selectedCourses,
      };
      const res = await teacherPortalService.updateProfile(profile._id, submitData);
      if (res?.data) setProfile(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // Course Detail View state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [courseDetailLoading, setCourseDetailLoading] = useState(false);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);

  // ==================== SECTION RENDERERS ====================

  const renderPlaceholder = (title, description, Icon) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark">{title}</h1>
          <p className="text-text-light mt-1">This section is coming soon</p>
        </div>
      </div>
      <div className="border-2 border-dashed border-border-light rounded-2xl p-12 text-center">
        <Icon className="w-16 h-16 text-border-light mx-auto mb-4" />
        <p className="text-text-light font-medium">{description}</p>
        <p className="text-text-light text-sm mt-2">Stay tuned for updates</p>
      </div>
    </div>
  );

  const handleViewCourse = async (course) => {
    setSelectedCourse(course);
    setCourseDetailLoading(true);
    setShowCourseDetail(true);
    setShowMaterials(false);
    try {
      const teacherId = profile?._id || user?._id || user?.id;
      if (!teacherId || !course._id) return;
      const res = await teacherAcademicService.getCourseDetails(teacherId, course._id);
      const responseData = res?.data || res;
      setCourseDetail(responseData);
    } catch (err) {
      setError(err.message || 'Failed to fetch course details');
    } finally {
      setCourseDetailLoading(false);
    }
  };

  const renderCourseDetail = () => {
    const course = selectedCourse;
    const detail = courseDetail;

    return (
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => { setShowCourseDetail(false); setSelectedCourse(null); setCourseDetail(null); }}
          className="flex items-center gap-2 text-text-light hover:text-text-dark transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Courses</span>
        </button>

        {/* Course Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-heading text-3xl font-bold text-text-dark">
                  {detail?.course?.title || course?.title}
                </h1>
                {detail?.course?.code && (
                  <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-mono font-bold">
                    {detail.course.code}
                  </span>
                )}
              </div>
              {detail?.course?.shortDescription && (
                <p className="text-text-body mb-4">{detail.course.shortDescription}</p>
              )}
              {detail?.course?.fullDescription && (
                <p className="text-sm text-text-light whitespace-pre-line mb-4">{detail.course.fullDescription}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                {detail?.course?.level && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium capitalize">{detail.course.level}</span>
                )}
                {detail?.course?.batch && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">Batch: {detail.course.batch}</span>
                )}
                {detail?.course?.section && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">Section: {detail.course.section}</span>
                )}
                {detail?.course?.academicYear && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">{detail.course.academicYear}</span>
                )}
                {detail?.course?.language && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">{detail.course.language}</span>
                )}
              </div>

              {/* Schedule */}
              {detail?.course?.schedule && (
                <div className="mt-4 flex items-center gap-4 text-sm text-text-light">
                  {detail.course.schedule.day && <span>Day: {detail.course.schedule.day}</span>}
                  {detail.course.schedule.startTime && <span>Time: {detail.course.schedule.startTime}{detail.course.schedule.endTime ? ` - ${detail.course.schedule.endTime}` : ''}</span>}
                  {detail.course.schedule.room && <span>Room: {detail.course.schedule.room}</span>}
                </div>
              )}

              <div className="mt-4 text-sm text-text-light">
                <span>{detail?.totalStudents || 0} Students enrolled</span>
                <span className="mx-3">|</span>
                <span>Capacity: {detail?.course?.maxStudents || 'Unlimited'}</span>
              </div>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowMaterials(true)}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm whitespace-nowrap"
              >
                <FiBookOpen className="w-4 h-4 inline mr-1.5" />
                Materials
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Attendance Records', value: detail?.attendanceSummary?.total || 0, color: 'text-primary bg-primary/10' },
            { label: 'Present', value: detail?.attendanceSummary?.present || 0, color: 'text-green-700 bg-green-100' },
            { label: 'Absent', value: detail?.attendanceSummary?.absent || 0, color: 'text-red-700 bg-red-100' },
            { label: 'Attendance Rate', value: detail?.attendanceSummary?.total > 0 ? `${Math.round(((detail.attendanceSummary.present + detail.attendanceSummary.late) / detail.attendanceSummary.total) * 100)}%` : '0%', color: 'text-blue-700 bg-blue-100' },
          ].map((stat, idx) => (
            <div key={idx} className={`rounded-xl p-4 ${stat.color}`}>
              <p className="text-xs font-medium opacity-75">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold text-text-dark mb-4">
            Enrolled Students ({detail?.students?.length || 0})
          </h2>
          {detail?.students?.length > 0 ? (
            <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
              <table className="w-full min-w-[500px]">
                <thead className="border-b-2 border-border-light">
                  <tr>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Name</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Student ID</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm hidden sm:table-cell">Email</th>
                    <th className="text-center p-3 font-semibold text-text-dark text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {detail.students.map((student) => (
                    <tr key={student._id} className="hover:bg-bg-light transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {student.studentName?.charAt(0) || '?'}
                          </div>
                          <p className="font-semibold text-text-dark text-sm">{student.studentName}</p>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-text-body font-mono">{student.studentId || '-'}</td>
                      <td className="p-3 text-sm text-text-body hidden sm:table-cell">{student.email || '-'}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          student.status === 'active' ? 'bg-green-100 text-green-800' :
                          student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-light text-center py-8">No students enrolled yet</p>
          )}
        </div>

        {/* Assignments Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold text-text-dark mb-4">
            Assignments ({detail?.assignments?.length || 0})
          </h2>
          {detail?.assignments?.length > 0 ? (
            <div className="space-y-3">
              {detail.assignments.map((assignment) => (
                <div key={assignment._id} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                  <div>
                    <p className="font-semibold text-text-dark text-sm">{assignment.title}</p>
                    <p className="text-xs text-text-light mt-0.5">
                      Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No date'}
                      <span className="mx-2">|</span>
                      {assignment.totalSubmissions || 0} submissions
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${assignment.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {assignment.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-light text-center py-8">No assignments for this course</p>
          )}
        </div>

        {/* Live Classes */}
        {detail?.liveClasses?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-text-dark mb-4">Live Classes</h2>
            <div className="space-y-3">
              {detail.liveClasses.map((cls) => (
                <div key={cls._id} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                  <div>
                    <p className="font-semibold text-text-dark text-sm">{cls.title}</p>
                    <p className="text-xs text-text-light mt-0.5">
                      {cls.scheduledAt ? new Date(cls.scheduledAt).toLocaleString() : ''}
                      {cls.duration && ` (${cls.duration} min)`}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    cls.status === 'live' ? 'bg-green-100 text-green-800' :
                    cls.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    cls.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {cls.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDashboard = () => {
    const a = analytics || {};
    const courseCount = a.totalCourses || dashboardData?.courses?.length || dashboardData?.assignedCourses?.length || '-';
    const studentCount = a.totalStudents || dashboardData?.totalStudents || dashboardData?.assignedStudents?.length || '-';
    const welcomeStats = {
      totalCourses: courseCount,
      totalStudents: studentCount,
      todaysClasses: a.todaysClasses || '-',
      pendingReviews: a.pendingReviews || '-',
    };

    const statItems = [
      { label: 'My Courses', value: courseCount, icon: FiBook, color: 'text-blue-600 bg-blue-100' },
      { label: 'Students', value: studentCount, icon: FiUsers, color: 'text-green-600 bg-green-100' },
      { label: 'Attendance', value: a.attendancePercentage ? `${a.attendancePercentage}%` : '-', icon: FiCheckCircle, color: 'text-purple-600 bg-purple-100' },
      { label: 'Assignments', value: a.totalAssignments || '-', icon: FiFileText, color: 'text-orange-600 bg-orange-100' },
      { label: 'Announcements', value: a.totalAnnouncements || '-', icon: FiBell, color: 'text-red-600 bg-red-100' },
      { label: 'Upcoming', value: a.upcomingClasses || '0', icon: FiCalendar, color: 'text-indigo-600 bg-indigo-100' },
    ];

    return (
    <div className="space-y-8">
      <TeacherWelcomeSection stats={welcomeStats} />

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`rounded-xl p-4 ${stat.color}`}>
              <Icon className="w-5 h-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-medium opacity-75 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <TeacherTodaysClassesSection />
          <TeacherCoursesSection />
        </div>
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-heading text-lg font-bold text-text-dark mb-6">Quick Stats</h3>
            <div className="space-y-4">
              {[
                { label: 'Active Students', value: studentCount, icon: FiUsers },
                { label: 'My Courses', value: courseCount, icon: FiBook },
                { label: 'Assignments', value: a.totalAssignments || '-', icon: FiFileText },
                { label: 'Avg Attendance', value: a.attendancePercentage ? `${a.attendancePercentage}%` : '-', icon: FiCheckCircle },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-bg-light rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-primary/10 text-primary rounded-lg"><Icon className="w-5 h-5" /></span>
                      <span className="text-sm text-text-light">{stat.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigateTo('/teacher/courses')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left"
              >
                <FiBook className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-text-body">View My Courses</span>
              </button>
              <button
                onClick={() => navigateTo('/teacher/students')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left"
              >
                <FiUsers className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-text-body">My Assigned Students</span>
              </button>
              <button
                onClick={() => navigateTo('/teacher/attendance')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left"
              >
                <FiCheckCircle className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-text-body">Take Attendance</span>
              </button>
              <button
                onClick={() => navigateTo('/teacher/schedule')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left"
              >
                <FiCalendar className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-text-body">View Schedule</span>
              </button>
              <button
                onClick={() => navigateTo('/teacher/assignments')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-light transition-colors text-left"
              >
                <FiFileText className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-text-body">Manage Assignments</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {teacherDashboardData.dashboard.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border-light hover:border-primary transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FiClock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-body">{activity.text}</p>
                    <p className="text-xs text-text-light mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-text-dark">Recent Notifications</h3>
              <button
                onClick={() => navigateTo('/teacher/announcements')}
                className="text-primary text-sm font-semibold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {teacherDashboardData.dashboard.recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl border border-border-light">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-body">{activity.text}</p>
                    <p className="text-xs text-text-light mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  const renderAttendance = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-text-dark">Attendance</h1>
            <p className="text-text-light mt-1">
              {attendanceStats.total} records | {attendanceStats.percentage}% attendance rate
            </p>
          </div>
          <input
            type="date"
            value={attendanceDate}
            onChange={e => setAttendanceDate(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border-light outline-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: attendanceStats.total, color: 'text-primary bg-primary/10' },
            { label: 'Present', value: attendanceStats.present, color: 'text-green-700 bg-green-100' },
            { label: 'Absent', value: attendanceStats.absent, color: 'text-red-700 bg-red-100' },
            { label: 'Late', value: attendanceStats.late, color: 'text-yellow-700 bg-yellow-100' },
            { label: 'Excused', value: attendanceStats.excused, color: 'text-blue-700 bg-blue-100' },
          ].map((card, idx) => (
            <div key={idx} className={`rounded-xl p-4 border ${card.color}`}>
              <p className="text-xs font-medium opacity-75">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        {attendanceRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-border-light">
                <tr>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Attendance ID</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Student</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Course</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Time</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Status</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {attendanceRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-bg-light">
                    <td className="p-3 font-mono text-xs text-primary font-semibold">{record.attendanceId || '-'}</td>
                    <td className="p-3">
                      <p className="font-semibold text-text-dark text-sm">{record.student?.studentName || 'N/A'}</p>
                      <p className="text-xs text-text-light">{record.student?.studentId}</p>
                    </td>
                    <td className="p-3 text-sm text-text-body">{record.course?.title || 'N/A'}</td>
                    <td className="p-3 text-sm text-text-body">{record.classTime || '-'}</td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>{record.status}</span>
                    </td>
                    <td className="p-3 text-sm text-text-light">{record.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-light">No attendance records found for this date</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-primary/20">
        <h2 className="font-heading text-xl font-bold text-text-dark mb-6">Mark Attendance</h2>
        <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">Student ID</label>
            <input type="text" value={attendanceFormData.student} onChange={e => setAttendanceFormData({ ...attendanceFormData, student: e.target.value })} required placeholder="MongoDB Student ID" className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">Course ID</label>
            <input type="text" value={attendanceFormData.course} onChange={e => setAttendanceFormData({ ...attendanceFormData, course: e.target.value })} required placeholder="MongoDB Course ID" className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">Status</label>
            <select value={attendanceFormData.status} onChange={e => setAttendanceFormData({ ...attendanceFormData, status: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">Date</label>
            <input type="date" value={attendanceFormData.classDate} onChange={e => setAttendanceFormData({ ...attendanceFormData, classDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-text-dark mb-2">Remarks</label>
            <input type="text" value={attendanceFormData.remarks} onChange={e => setAttendanceFormData({ ...attendanceFormData, remarks: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div className="md:col-span-3">
            <button type="submit" disabled={markingAttendance} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors">
              {markingAttendance ? 'Marking...' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">My Profile</h1>


      <form onSubmit={handleProfileUpdate} className="space-y-6">
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
                <input type="text" name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Gender *</label>
                <select name="gender" value={profileForm.gender} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Date of Birth *</label>
                <input type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Nationality *</label>
                <input type="text" name="nationality" value={profileForm.nationality} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
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
                <label className="block text-sm font-medium text-text-dark mb-1">Country *</label>
                <input type="text" name="country" value={profileForm.country} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">City *</label>
                <input type="text" name="city" value={profileForm.city} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-1">Address *</label>
                <textarea name="address" value={profileForm.address} onChange={handleProfileChange} rows={2} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm" />
              </div>
            </div>
          </div>

          {/* ── STEP 2: QUALIFICATION & EXPERIENCE ── */}
          <div className="bg-bg-light/40 p-4 rounded-xl border border-border-light space-y-4">
            <h3 className="font-heading font-semibold text-text-dark text-sm flex items-center gap-2 border-b border-border-light pb-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">2</span>
              Qualifications & Experiences
            </h3>
            
            {/* Preferred Courses selection */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Preferred Courses You Can Teach *
                <span className="text-xs text-text-light font-normal ml-2">(Choose courses)</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Highest Qualification *</label>
                <input type="text" name="qualification" value={profileForm.qualification} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Degree/Certificate Title *</label>
                <input type="text" name="degree" value={profileForm.degree} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Years of Teaching Experience *</label>
                <input type="number" name="experience" value={profileForm.experience} onChange={handleProfileChange} required min="0"
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Area of Specialization *</label>
                <input type="text" name="specialization" value={profileForm.specialization} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Subjects Can Teach *</label>
                <input type="text" value={profileForm.subjects.join(', ')} onChange={(e) => handleArrayChange('subjects', e.target.value)} required placeholder="Comma-separated (e.g. Tajweed, Arabic, Hifz)"
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Teaching Languages *</label>
                <input type="text" value={profileForm.teachingLanguages.join(', ')} onChange={(e) => handleArrayChange('teachingLanguages', e.target.value)} required placeholder="Comma-separated (e.g. Arabic, Urdu, English)"
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-1">Short Bio *</label>
                <textarea name="shortBio" value={profileForm.shortBio} onChange={handleProfileChange} rows={3} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm" />
              </div>
            </div>
          </div>

          {/* ── STEP 3: SKILLS & AVAILABILITY ── */}
          <div className="bg-bg-light/40 p-4 rounded-xl border border-border-light space-y-4">
            <h3 className="font-heading font-semibold text-text-dark text-sm flex items-center gap-2 border-b border-border-light pb-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">3</span>
              Skills & Availability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Skills *</label>
                <input type="text" value={profileForm.skills.join(', ')} onChange={(e) => handleArrayChange('skills', e.target.value)} required placeholder="Comma-separated (e.g. Online teaching, Quran recitation)"
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Teaching Mode *</label>
                <select name="teachingMode" value={profileForm.teachingMode} onChange={handleProfileChange} required
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
                  <option value="">Select Mode</option>
                  <option value="online">Online</option>
                  <option value="physical">Physical</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-1">Availability (Time & Days) *</label>
                <input type="text" name="availability" value={profileForm.availability} onChange={handleProfileChange} required placeholder="e.g. 5:00 PM - 9:00 PM EST, Mon-Fri"
                  className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              </div>
            </div>
          </div>



          {/* ── STEP 4: DOCUMENTS ── */}
          <div className="bg-bg-light/40 p-4 rounded-xl border border-border-light space-y-4">
            <h3 className="font-heading font-semibold text-text-dark text-sm flex items-center gap-2 border-b border-border-light pb-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">4</span>
              Documents & Uploads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Profile Photo *</label>
                {profileForm.profilePhoto && (
                  <div className="mb-2 relative inline-block">
                    <img src={profileForm.profilePhoto} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                    <button type="button" onClick={() => removeSingleFile('profilePhoto')}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border-light hover:border-primary hover:bg-primary/5 cursor-pointer transition-all rounded-xl">
                  {uploading.profilePhoto ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiUpload className="w-4 h-4 text-text-light" />
                  )}
                  <span className="text-xs text-text-light">{profileForm.profilePhoto ? 'Replace' : 'Upload'} Photo</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])} className="hidden" disabled={uploading.profilePhoto} />
                </label>
              </div>

              {/* Resume */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Resume / CV *</label>
                {profileForm.resume && (
                  <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-border-light text-xs max-w-full truncate">
                    <span className="truncate">{profileForm.resume.split('/').pop()}</span>
                    <button type="button" onClick={() => removeSingleFile('resume')}
                      className="text-red-500 hover:text-red-700 ml-auto">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border-light hover:border-primary hover:bg-primary/5 cursor-pointer transition-all rounded-xl">
                  {uploading.resume ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiUpload className="w-4 h-4 text-text-light" />
                  )}
                  <span className="text-xs text-text-light">{profileForm.resume ? 'Replace' : 'Upload'} Resume</span>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload('resume', e.target.files[0])} className="hidden" disabled={uploading.resume} />
                </label>
              </div>

              {/* Certificates */}
              <div className="md:col-span-2 p-3 sm:p-4 bg-bg-light/30 rounded-xl border border-border-light space-y-4">
                <label className="block text-sm font-semibold text-text-dark">Educational Certificates / Degrees</label>
                {profileForm.certificates && profileForm.certificates.length > 0 && (
                  <div className="space-y-2">
                    {profileForm.certificates.map((cert, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-border-light">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-dark truncate">{cert.title}</p>
                          <p className="text-xs text-text-light">{cert.issuer}{cert.year ? ` (${cert.year})` : ''}</p>
                        </div>
                        <button type="button" onClick={() => removeCertificate(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2">
                          <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input type="text" value={certInput.title} onChange={e => setCertInput(p => ({ ...p, title: e.target.value }))} placeholder="Certificate title" className="w-full sm:flex-1 px-3 sm:px-4 py-2 rounded-xl border border-border-light focus:border-primary outline-none text-sm bg-white" />
                  <input type="text" value={certInput.issuer} onChange={e => setCertInput(p => ({ ...p, issuer: e.target.value }))} placeholder="Issuer" className="w-full sm:flex-1 px-3 sm:px-4 py-2 rounded-xl border border-border-light focus:border-primary outline-none text-sm bg-white" />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input type="number" value={certInput.year} onChange={e => setCertInput(p => ({ ...p, year: e.target.value }))} placeholder="Year" className="flex-1 sm:w-24 px-3 py-2 rounded-xl border border-border-light focus:border-primary outline-none text-sm min-w-0 bg-white" />
                    <button type="button" onClick={addCertificate} className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                      <FiPlus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Documents */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-2">Additional Documents (Optional)</label>
                <div className="space-y-2 mb-2">
                  {profileForm.additionalDocuments?.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-border-light text-xs">
                      <span className="truncate">{doc.split('/').pop()}</span>
                      <button type="button" onClick={() => removeArrayFile('additionalDocuments', index)}
                        className="text-red-500 hover:text-red-700 ml-auto">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border-light hover:border-primary hover:bg-primary/5 cursor-pointer transition-all rounded-xl">
                  {uploading.additionalDocuments ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiUpload className="w-4 h-4 text-text-light" />
                  )}
                  <span className="text-xs text-text-light">Upload Additional Document(s)</span>
                  <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleMultiFileUpload('additionalDocuments', e.target.files)} className="hidden" disabled={uploading.additionalDocuments} />
                </label>
              </div>

            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border-light">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">Settings</h1>
        <div className="max-w-2xl">
          {/* Change Password */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-text-dark mb-4">Change Password</h2>
            {passwordSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{passwordSuccess}</div>}
            {passwordError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{passwordError}</div>}
            <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md">
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
              <button type="submit" disabled={passwordSubmitting} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm">
                {passwordSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Change Email */}
          <div className="mb-8 border-t border-border-light pt-8">
            <h2 className="text-lg font-bold text-text-dark mb-4">Change Email</h2>
            <p className="text-sm text-text-light mb-4">Current email: <strong>{user?.email}</strong></p>
            {emailSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{emailSuccess}</div>}
            {emailError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{emailError}</div>}
            <form onSubmit={handleEmailSubmit} className="space-y-3 max-w-md">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">New Email Address</label>
                <input type="email" name="newEmail" value={emailForm.newEmail} onChange={handleEmailChange} required placeholder="new@email.com" className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Current Password</label>
                <input type="password" name="password" value={emailForm.password} onChange={handleEmailChange} required placeholder="Enter password to confirm" className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <button type="submit" disabled={emailSubmitting} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm">
                {emailSubmitting ? 'Updating...' : 'Change Email'}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="border-t border-border-light pt-8">
            <h2 className="text-lg font-bold text-text-dark mb-4">Notifications</h2>
            <div className="space-y-4">
              {[
                { label: 'Email notifications for new assignments', enabled: true },
                { label: 'Email notifications for student submissions', enabled: true },
                { label: 'SMS notifications for urgent messages', enabled: false },
                { label: 'Weekly summary report', enabled: true },
              ].map((setting, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border-light">
                  <span className="text-sm text-text-body">{setting.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================

  // Handle course detail and materials sub-views
  if (showMaterials && selectedCourse) {
    return (
      <TeacherCourseMaterialsSection
        courseId={selectedCourse._id}
        courseName={selectedCourse.title}
        onBack={() => setShowMaterials(false)}
      />
    );
  }

  if (showCourseDetail && selectedCourse) {
    return renderCourseDetail();
  }

  switch (activeSection) {
    case 'dashboard':
      return renderDashboard();

    case 'courses':
      return <TeacherCoursesSection onViewCourse={handleViewCourse} />;

    case 'students':
      return <TeacherAssignedStudentsSection />;

    case 'assignments':
      return <TeacherAssignmentsSection />;

    case 'attendance':
      return renderAttendance();

    case 'schedule':
      return <TeacherScheduleSection />;

    case 'messages':
      return <TeacherMessagesSection />;

    case 'announcements':
      return <TeacherAnnouncementsSection />;

    case 'results':
      return <TeacherResultsSection />;

    case 'profile':
      return renderProfile();

    case 'settings':
      return renderSettings();

    default:
      return renderDashboard();
  }
}
