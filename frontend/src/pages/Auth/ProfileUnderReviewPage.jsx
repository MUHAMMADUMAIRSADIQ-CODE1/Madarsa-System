import { useAuth } from '../../context/AuthContext';
import { FiClock, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function ProfileUnderReviewPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiClock className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark mb-3">
          Profile Under Review
        </h1>
        <p className="text-text-body mb-2">
          Your profile has been submitted, <strong>{user?.fullName}</strong>.
        </p>
        <p className="text-text-light text-sm mb-6">
          An administrator is reviewing your profile, documents, and information. You will receive an email once your profile has been verified.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <FiClock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              This process typically takes 1-2 business days. You will be notified via email when the review is complete.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
          >
            Go to Home
          </button>
          <button
            onClick={() => { logout(); }}
            className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
