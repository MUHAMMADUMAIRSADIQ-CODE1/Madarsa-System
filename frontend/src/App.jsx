import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const TeachersPage = lazy(() => import('./pages/TeachersPage'));
const TeacherDetailPage = lazy(() => import('./pages/TeacherDetailPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdmissionsPage = lazy(() => import('./pages/AdmissionsPage'));
const AdmissionForm = lazy(() => import('./components/Admissions/AdmissionForm'));
const AdmissionStatus = lazy(() => import('./components/Admissions/AdmissionStatus'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/Auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'));
const StudentProfileComplete = lazy(() => import('./pages/Auth/StudentProfileComplete'));
const TeacherProfileComplete = lazy(() => import('./pages/Auth/TeacherProfileComplete'));
const PendingApprovalPage = lazy(() => import('./pages/Auth/PendingApprovalPage'));
const RegistrationRejectedPage = lazy(() => import('./pages/Auth/RegistrationRejectedPage'));
const ProfileUnderReviewPage = lazy(() => import('./pages/Auth/ProfileUnderReviewPage'));
const AccountBlockedPage = lazy(() => import('./pages/Auth/AccountBlockedPage'));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage'));
const TeacherDashboardPage = lazy(() => import('./pages/TeacherDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ToastProvider>
      <ScrollToTop />
      <Routes>
        {/* Teacher Dashboard Routes - must come BEFORE PublicLayout to prevent /teacher/:slug conflict */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="courses" element={<TeacherDashboardPage />} />
          <Route path="students" element={<TeacherDashboardPage />} />
          <Route path="assignments" element={<TeacherDashboardPage />} />
          <Route path="attendance" element={<TeacherDashboardPage />} />
          <Route path="schedule" element={<TeacherDashboardPage />} />
          <Route path="results" element={<TeacherDashboardPage />} />
          <Route path="messages" element={<TeacherDashboardPage />} />
          <Route path="announcements" element={<TeacherDashboardPage />} />
          <Route path="profile" element={<TeacherDashboardPage />} />
          <Route path="settings" element={<TeacherDashboardPage />} />
        </Route>

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:slug" element={<CourseDetailPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/teacher/:slug" element={<TeacherDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/admission-form" element={<AdmissionForm />} />
          <Route path="/admission-status" element={<AdmissionStatus />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Status Pages */}
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/registration-rejected" element={<RegistrationRejectedPage />} />
        <Route path="/profile-under-review" element={<ProfileUnderReviewPage />} />
        <Route path="/account-blocked" element={<AccountBlockedPage />} />

        {/* Profile Completion Routes (authenticated but no profile completion required) */}
        <Route
          path="/student/complete-profile"
          element={
            <ProtectedRoute allowedRoles={['student']} requireProfileComplete={false}>
              <StudentProfileComplete />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/complete-profile"
          element={
            <ProtectedRoute allowedRoles={['teacher']} requireProfileComplete={false}>
              <TeacherProfileComplete />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path=":section" element={<StudentDashboardPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path=":section" element={<AdminDashboardPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </ToastProvider>
    </Suspense>
  );
}
