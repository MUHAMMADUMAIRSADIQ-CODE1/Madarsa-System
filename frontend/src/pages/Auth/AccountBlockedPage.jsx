import { FiLock, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function AccountBlockedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiLock className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark mb-3">
          Account Blocked
        </h1>
        <p className="text-text-body mb-2">
          Your account has been blocked.
        </p>
        <p className="text-text-light text-sm mb-6">
          You are unable to access your account at this time. If you believe this is a mistake, please contact our support team for assistance.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors inline-flex items-center gap-2"
        >
          <FiLogOut className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
