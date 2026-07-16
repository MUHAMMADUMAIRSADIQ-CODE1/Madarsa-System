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
import { adminDashboardData } from '../data/adminDashboardData';

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
  { id: 'website-settings', label: 'Website Settings', icon: 'settings', section: 'main' },
  { id: 'footer', label: 'Footer', icon: 'file', section: 'main' },
  { id: 'settings', label: 'Account Settings', icon: 'settings', section: 'account' },
  { id: 'profile', label: 'Profile', icon: 'user', section: 'account' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = location.pathname.split('/').pop();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
      
      case 'gallery':
      case 'news':
      case 'settings':
      case 'profile':
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
