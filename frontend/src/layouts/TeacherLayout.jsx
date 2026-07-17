import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from '../components/Dashboard/TeacherSidebar';
import DashboardNavbar from '../components/Dashboard/DashboardNavbar';

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      <TeacherSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

