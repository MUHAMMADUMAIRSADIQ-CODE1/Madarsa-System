import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.message || 'If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light pt-20 pb-12">
      <div className="max-w-md mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-dark mb-3">
            Forgot Password
          </h1>
          <p className="text-text-body text-lg">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 sm:p-10">
          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 animate-fade-in">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fade-in">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-text-dark mb-2.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
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
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="text-center border-t border-border-light pt-6">
            <p className="text-text-body">
              Remember your password?{' '}
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
