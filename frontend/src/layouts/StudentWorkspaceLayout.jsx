import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardNavbar from '../components/Dashboard/DashboardNavbar';
import CourseWorkspace from '../components/LMS/CourseWorkspace';

export default function StudentWorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { courseId } = useParams();

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
            <CourseWorkspace role="student" courseId={courseId} />
          </div>
        </div>
      </div>
    </div>
  );
}
