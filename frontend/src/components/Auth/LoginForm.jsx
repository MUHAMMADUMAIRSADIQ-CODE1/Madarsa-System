import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff, FiRefreshCw } from 'react-icons/fi';

export default function LoginForm({ onSignupClick }) {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'student') {
          navigate('/student/dashboard');
        } else if (user.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        }
      }, 500);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white flex items-center justify-center p-6 sm:p-10 lg:p-0">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-dark mb-3">
            Welcome Back
          </h1>
          <p className="text-text-body text-base">
            Sign in to access your personalized learning dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="animate-fade-in-up">
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

          {/* Password Field */}
          <div className="animate-fade-in-up stagger-1">
            <label htmlFor="password" className="block text-sm font-semibold text-text-dark mb-2.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-5 py-3.5 rounded-xl border-2 border-border-light focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-300 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-primary transition-colors"
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded animate-fade-in">
              <p className="text-red-700 text-sm font-medium">
                {localError || error}
              </p>
            </div>
          )}

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between pt-2 animate-fade-in-up stagger-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-border-light accent-primary"
              />
              <span className="text-sm text-text-body font-medium">Remember me</span>
            </label>
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 animate-fade-in-up stagger-3 ${
              isSubmitting || isLoading
                ? 'bg-text-light text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 hover:shadow-xl'
            }`}
          >
{isSubmitting || isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FiRefreshCw className="w-5 h-5 animate-spin" />
                Logging in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="relative py-4 animate-fade-in-up stagger-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-text-light font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            className="w-full py-3.5 rounded-xl border-2 border-border-light hover:border-primary hover:bg-primary-light transition-all duration-300 font-semibold text-text-dark flex items-center justify-center gap-2 animate-fade-in-up stagger-5"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border-light text-center animate-fade-in-up stagger-6">
          <p className="text-text-body">
            Don't have an account?{' '}
            <button
              onClick={onSignupClick}
              className="font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>


      </div>
    </div>
  );
}
