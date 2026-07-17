import { useAuth } from '../../context/AuthContext';
import { FiClock, FiMail, FiLogOut } from 'react-icons/fi';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiClock className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark mb-3">
          Registration Pending
        </h1>
        <p className="text-text-body mb-2">
          Thank you for registering, <strong>{user?.fullName}</strong>.
        </p>
        <p className="text-text-light text-sm mb-6">
          Your account is currently pending administrator approval. You will receive an email once your account has been reviewed.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <FiMail className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              We've sent a confirmation email to <strong>{user?.email}</strong>. Please check your inbox.
            </p>
          </div>
        </div>
        <button
          onClick={() => { logout(); }}
          className="px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors inline-flex items-center gap-2"
        >
          <FiLogOut className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
