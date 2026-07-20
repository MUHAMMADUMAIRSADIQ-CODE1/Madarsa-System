import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        email,
        newPassword: formData.newPassword,
      });
      toast.success(response.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light pt-20 pb-12">
        <div className="max-w-md mx-auto px-5 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center">
            <h1 className="font-heading text-3xl font-bold text-text-dark mb-4">Invalid Link</h1>
            <p className="text-text-body mb-6">This password reset link is invalid or has expired.</p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light pt-20 pb-12">
      <div className="max-w-md mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-dark mb-3">
            Reset Password
          </h1>
          <p className="text-text-body text-lg">
            Enter your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 sm:p-10">
          <div className="mb-6">
            <label htmlFor="newPassword" className="block text-sm font-semibold text-text-dark mb-2.5">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Min 8 characters"
              className="w-full px-5 py-3.5 rounded-xl border-2 border-border-light focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-300"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-dark mb-2.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full px-5 py-3.5 rounded-xl border-2 border-border-light focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 mb-6 ${
              isSubmitting
                ? 'bg-text-light text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 hover:shadow-xl'
            }`}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="text-center border-t border-border-light pt-6">
            <p className="text-text-body">
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                Back to Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
