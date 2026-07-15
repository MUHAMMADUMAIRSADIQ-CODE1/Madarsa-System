import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import DashboardNavbar from '../components/Dashboard/DashboardNavbar';
import TeacherWelcomeSection from '../components/Dashboard/TeacherWelcomeSection';
import TeacherTodaysClassesSection from '../components/Dashboard/TeacherTodaysClassesSection';
import TeacherCoursesSection from '../components/Dashboard/TeacherCoursesSection';
import TeacherStudentsSection from '../components/Dashboard/TeacherStudentsSection';
import TeacherAssignmentsSection from '../components/Dashboard/TeacherAssignmentsSection';
import { useAuth } from '../context/AuthContext';
import { teacherDashboardData } from '../data/teacherDashboardData';
import teacherPortalService from '../services/teacherPortalService';
import attendanceService from '../services/attendanceService';

const teacherSidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', section: 'main' },
  { id: 'courses', label: 'My Courses', icon: 'book', section: 'main' },
  { id: 'students', label: 'My Students', icon: 'users', section: 'main' },
  { id: 'live-classes', label: 'Live Classes', icon: 'video', section: 'main' },
  { id: 'assignments', label: 'Assignments', icon: 'tasks', section: 'main' },
  { id: 'attendance', label: 'Attendance', icon: 'calendar', section: 'main' },
  { id: 'results', label: 'Student Results', icon: 'chart', section: 'main' },
  { id: 'messages', label: 'Messages', icon: 'mail', section: 'main', badge: 3 },
  { id: 'schedule', label: 'Schedule', icon: 'calendar-alt', section: 'main' },
  { id: 'announcements', label: 'Announcements', icon: 'bell', section: 'main' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', section: 'main' },
  { id: 'profile', label: 'Profile', icon: 'user', section: 'account' },
  { id: 'settings', label: 'Settings', icon: 'settings', section: 'account' },
];

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileForm, setProfileForm] = useState({});
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
  const { user } = useAuth();

  const activeSection = location.pathname.split('/').pop();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await teacherPortalService.getProfile();
      if (res?.data) {
        setProfile(res.data);
        setProfileForm({
          phone: res.data.phone || '',
          whatsapp: res.data.whatsapp || '',
          biography: res.data.biography || '',
          shortBio: res.data.shortBio || '',
          country: res.data.country || '',
          city: res.data.city || '',
          subjects: res.data.subjects || [],
          teachingLanguages: res.data.teachingLanguages || [],
          skills: res.data.skills || [],
        });
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await teacherPortalService.getProfile();
      if (res?.data) {
        setProfile(res.data);
        setDashboardData(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (profile?._id) {
      if (activeSection === 'courses') fetchCourses(profile._id);
      if (activeSection === 'students') fetchStudents(profile._id, studentPage);
      if (activeSection === 'attendance') fetchTeacherAttendance(profile._id, attendanceDate);
    }
  }, [activeSection, profile?._id, studentPage, attendanceDate, fetchCourses, fetchStudents, fetchTeacherAttendance]);

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
    } catch (err) {
      alert(err.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profile?._id) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await teacherPortalService.updateProfile(profile._id, profileForm);
      if (res?.data) setProfile(res.data);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <TeacherWelcomeSection />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TeacherTodaysClassesSection />
              </div>
              <div>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-heading text-lg font-bold text-text-dark mb-6">Quick Stats</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Active Students', value: dashboardData?.totalStudents || '127', icon: '👥' },
                      { label: 'My Courses', value: dashboardData?.totalCourses || '4', icon: '📚' },
                      { label: 'Pending Assignments', value: '15', icon: '📋' },
                      { label: 'Avg Attendance', value: '91%', icon: '✓' },
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-bg-light rounded-lg">
                        <span className="text-sm text-text-light">{stat.label}</span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <TeacherCoursesSection />
          </div>
        );

      case 'courses':
        return <TeacherCoursesSection />;

      case 'students':
        return <TeacherStudentsSection />;

      case 'assignments':
        return <TeacherAssignmentsSection />;

      case 'attendance':
        return (
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

      case 'results':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">Student Results</h1>
            <div className="space-y-6">
              {teacherDashboardData.results.map((result) => (
                <div key={result.id} className="border-2 border-border-light rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg text-text-dark">{result.student}</p>
                      <p className="text-sm text-text-light">{result.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{result.average.toFixed(1)}</p>
                      <p className="text-xs text-text-light">Average Score</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {result.assessments.map((assessment, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-text-body">{assessment.name}</span>
                        <span className="text-sm font-semibold text-primary">
                          {assessment.score}/{assessment.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'live-classes':
      case 'messages':
      case 'schedule':
      case 'announcements':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <div className="text-center py-12">
              <p className="text-text-light">Coming soon...</p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">Notifications</h1>
            <div className="space-y-4">
              {teacherDashboardData.dashboard.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl border border-border-light hover:border-primary transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-body">{activity.text}</p>
                    <p className="text-xs text-text-light mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">My Profile</h1>

            {saveMessage && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-semibold ${
                saveMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {saveMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.fullName?.charAt(0) || 'T'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-dark">{profile?.fullName || 'Teacher'}</h2>
                  <p className="text-sm text-text-light">{profile?.email}</p>
                  <p className="text-sm text-text-light mt-1">{profile?.qualification}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">WhatsApp</label>
                  <input
                    type="text"
                    value={profileForm.whatsapp || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">Country</label>
                  <input
                    type="text"
                    value={profileForm.country || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">City</label>
                  <input
                    type="text"
                    value={profileForm.city || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-text-dark mb-2">Short Bio</label>
                  <textarea
                    rows={3}
                    value={profileForm.shortBio || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, shortBio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-text-dark mb-2">Biography</label>
                  <textarea
                    rows={5}
                    value={profileForm.biography || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, biography: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  />
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
                {saveMessage && (
                  <span className={`text-sm font-semibold ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {saveMessage.text}
                  </span>
                )}
              </div>
            </form>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="font-heading text-3xl font-bold text-text-dark mb-6">Settings</h1>
            <div className="max-w-2xl space-y-8">
              <div>
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

              <div>
                <h2 className="text-lg font-bold text-text-dark mb-4">Account</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border-light">
                    <div>
                      <p className="font-semibold text-text-dark">Change Password</p>
                      <p className="text-sm text-text-light">Update your account password</p>
                    </div>
                    <button className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary-light transition-colors text-sm">
                      Update
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border-light">
                    <div>
                      <p className="font-semibold text-text-dark">Language</p>
                      <p className="text-sm text-text-light">Interface language preference</p>
                    </div>
                    <select className="px-4 py-2 rounded-lg border border-border-light text-sm">
                      <option>English</option>
                      <option>Arabic</option>
                      <option>Urdu</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      <TeacherSidebar
        activeItem={activeSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={teacherSidebarItems}
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

function TeacherSidebar({ activeItem, isOpen, onClose, items }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const iconComponents = {
    home: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4" /></svg>,
    book: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25m20-11c5.5 0 10 4.745 10 11m-15-6.25c0-4.418-3.582-8-8-8" /></svg>,
    users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.048M12 4.354L8.646 7.708m6.708 0L15.354 7.708m-11.708 6l.002.002M21 20a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    video: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    tasks: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    mail: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    bell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    'calendar-alt': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    user: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    logout: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    notifications: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  };

  const mainItems = items.filter(item => item.section === 'main');
  const accountItems = items.filter(item => item.section === 'account');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-xl overflow-y-auto transition-transform duration-300 z-40 lg:z-0 lg:relative lg:shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="sticky top-0 bg-white p-6 border-b border-border-light z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-heading font-bold text-text-dark">Menu</h2>
              <p className="text-xs text-text-light">Teacher Portal</p>
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

        <nav className="p-4 space-y-2">
          {mainItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/teacher/${item.id}`);
                onClose();
              }}
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

          <div className="my-4 border-t border-border-light" />

          <p className="px-4 py-2 text-xs font-semibold text-text-light uppercase tracking-wider">Account</p>
          {accountItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/teacher/${item.id}`);
                onClose();
              }}
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

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 mt-4 border-t border-border-light pt-4"
          >
            {iconComponents.logout}
            <span className="font-medium text-sm">Logout</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-dark truncate">{user?.name}</p>
              <p className="text-xs text-text-light truncate">Teacher</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
