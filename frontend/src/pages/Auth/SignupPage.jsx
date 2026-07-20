import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'Pakistan',
    city: '',
    gender: 'male',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.match(/^[\d\s\-\+\(\)]{10,}$/)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    }

    if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, agreeTerms, ...userData } = formData;

      await signup({ ...userData, role });

      toast.success('Account created successfully! Your account is pending admin approval. You will be notified via email once approved.');

      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      toast.error(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-text-dark mb-3">
            Create Your Account
          </h1>
          <p className="text-text-body text-lg">
            Join thousands of students learning Quran and Islamic studies
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {[
            { value: 'student', label: 'Student', description: 'Learn and grow' },
            { value: 'teacher', label: 'Teacher', description: 'Teach & inspire' },
          ].map(r => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center ${role === r.value
                  ? 'border-primary bg-primary-light'
                  : 'border-border-light hover:border-primary'
                }`}
            >
              <p className="font-heading font-bold text-lg text-text-dark">{r.label}</p>
              <p className="text-sm text-text-light">{r.description}</p>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Full Name */}
            <div className="sm:col-span-2 animate-fade-in-up">
              <label className="block text-sm font-semibold text-text-dark mb-2.5">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all outline-none ${errors.fullName
                    ? 'border-red-400 focus:ring-red-100'
                    : 'border-border-light focus:border-primary focus:ring-primary/10'
                  } focus:ring-2`}
              />
              {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="animate-fade-in-up stagger-1">
              <label className="block text-sm font-semibold text-text-dark mb-2.5">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all outline-none ${errors.email
                    ? 'border-red-400'
                    : 'border-border-light focus:border-primary focus:ring-primary/10'
                  } focus:ring-2`}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="animate-fade-in-up stagger-2">
              <label className="block text-sm font-semibold text-text-dark mb-2.5">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1-555-123-4567"
                className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all outline-none ${errors.phone
                    ? 'border-red-400'
                    : 'border-border-light focus:border-primary focus:ring-primary/10'
                  } focus:ring-2`}
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Country */}
            <div className="animate-fade-in-up stagger-3">
              <label className="block text-sm font-semibold text-text-dark mb-2.5">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* City */}
            <div className="animate-fade-in-up stagger-4">
              <label className="block text-sm font-semibold text-text-dark mb-2.5">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Your city"
                className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all outline-none ${errors.city
                    ? 'border-red-400'
                    : 'border-border-light focus:border-primary focus:ring-primary/10'
                  } focus:ring-2`}
              />
              {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
            </div>

            {/* Gender */}
            <div className="animate-fade-in-up stagger-5">
              <label className="block text-sm font-semibold text-text-dark mb-2.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Password */}
            <div className="animate-fade-in-up stagger-6">
              <label className="block text-sm font-semibold text-text-dark mb-2.5">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, uppercase & number"
                className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all outline-none ${errors.password
                    ? 'border-red-400'
                    : 'border-border-light focus:border-primary focus:ring-primary/10'
                  } focus:ring-2`}
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="animate-fade-in-up stagger-7">
              <label className="block text-sm font-semibold text-text-dark mb-2.5">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all outline-none ${errors.confirmPassword
                    ? 'border-red-400'
                    : 'border-border-light focus:border-primary focus:ring-primary/10'
                  } focus:ring-2`}
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Terms */}
          <div className="mb-8 p-4 bg-accent-soft rounded-xl animate-fade-in-up stagger-8">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-5 h-5 mt-1 rounded border-2 border-border-light accent-primary"
              />
              <span className="text-sm text-text-body">
                I agree to the <a href="#" className="font-semibold text-primary hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-primary hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeTerms && <p className="text-red-600 text-sm mt-2">{errors.agreeTerms}</p>}
          </div>

          {/* Create Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 mb-6 ${isSubmitting || isLoading
                ? 'bg-text-light text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
              }`}
          >
            {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Google Signup */}
          <button
            type="button"
            className="w-full py-3.5 rounded-xl border-2 border-border-light hover:border-primary hover:bg-primary-light transition-all font-semibold text-text-dark flex items-center justify-center gap-2 mb-6"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>

          {/* Login Link */}
          <div className="text-center border-t border-border-light pt-6">
            <p className="text-text-body">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
