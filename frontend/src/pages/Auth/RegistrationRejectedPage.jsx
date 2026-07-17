import { useAuth } from '../../context/AuthContext';
import { FiXCircle, FiLogOut } from 'react-icons/fi';

export default function RegistrationRejectedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiXCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark mb-3">
          Registration Rejected
        </h1>
        <p className="text-text-body mb-2">
          We're sorry, <strong>{user?.fullName}</strong>.
        </p>
        <p className="text-text-light text-sm mb-6">
          Your account registration has been reviewed and could not be approved at this time.
        </p>
        {user?.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-red-600 font-medium uppercase tracking-wider mb-1">Reason</p>
            <p className="text-sm text-red-800">{user.rejectionReason}</p>
          </div>
        )}
        <p className="text-xs text-text-light mb-6">
          If you believe this is a mistake, please contact our support team.
        </p>
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
