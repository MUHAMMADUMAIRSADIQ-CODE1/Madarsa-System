import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getRedirect(user) {
  if (!user) return '/login';
  const dashboard = user.role === 'admin' ? '/admin/dashboard'
    : user.role === 'teacher' ? '/teacher/dashboard'
    : '/student/dashboard';
  return dashboard;
}

export default function ProtectedRoute({ children, allowedRoles, requireProfileComplete = true }) {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getRedirect(user)} replace />;
  }

  // Admins bypass all profile checks
  if (user?.role === 'admin') {
    return children;
  }

  // ============= DASHBOARD PROTECTION =============
  // Check user status first
  if (user?.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (user?.status === 'rejected') {
    return <Navigate to="/registration-rejected" replace />;
  }

  if (user?.status === 'blocked' || user?.isActive === false) {
    return <Navigate to="/account-blocked" replace />;
  }

  // If requireProfileComplete is explicitly false (for profile completion page), bypass completion/verification checks
  if (!requireProfileComplete) {
    return children;
  }

  // Check profile completion
  if (!user?.profileComplete) {
    const profileCompletePath = user?.role === 'teacher'
      ? '/teacher/complete-profile'
      : '/student/complete-profile';
    return <Navigate to={profileCompletePath} replace />;
  }

  // Check profile verification status
  if (user?.profileVerificationStatus === 'pending') {
    return <Navigate to="/profile-under-review" replace />;
  }

  if (user?.profileVerificationStatus === 'rejected' || user?.profileVerificationStatus === 'changes_requested') {
    const profileCompletePath = user?.role === 'teacher'
      ? '/teacher/complete-profile'
      : '/student/complete-profile';
    return <Navigate to={profileCompletePath} replace />;
  }

  if (!user?.profileVerified && user?.profileVerificationStatus !== 'verified') {
    return <Navigate to="/profile-under-review" replace />;
  }

  return children;
}
