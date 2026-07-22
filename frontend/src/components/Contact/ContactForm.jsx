import { useState } from 'react';
import SectionTitle from '../common/SectionTitle';
import ScrollReveal from '../common/ScrollReveal';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    course: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        course: '',
        message: '',
      });
      
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-accent-soft via-white to-primary-light">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Get in Touch"
          title="Send us a Message"
          description="Fill out the form below and our team will get back to you as soon as possible."
        />

        <form onSubmit={handleSubmit} className="mt-10 bg-white rounded-3xl shadow-lg p-8 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Full Name */}
            <ScrollReveal>
              <div>
              <label className="block text-sm font-semibold text-text-dark mb-3">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-light focus:border-primary outline-none transition-all duration-300 placeholder-text-light"
              />
              </div>
            </ScrollReveal>

            {/* Email */}
            <ScrollReveal delay={100}>
              <div>
              <label className="block text-sm font-semibold text-text-dark mb-3">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-light focus:border-primary outline-none transition-all duration-300 placeholder-text-light"
              />
              </div>
            </ScrollReveal>

            {/* Phone */}
            <ScrollReveal delay={200}>
              <div>
              <label className="block text-sm font-semibold text-text-dark mb-3">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-light focus:border-primary outline-none transition-all duration-300 placeholder-text-light"
              />
              </div>
            </ScrollReveal>

            {/* Country */}
            <ScrollReveal delay={300}>
              <div>
              <label className="block text-sm font-semibold text-text-dark mb-3">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Your country"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-light focus:border-primary outline-none transition-all duration-300 placeholder-text-light"
              />
              </div>
            </ScrollReveal>

            {/* Course */}
            <ScrollReveal delay={400}>
              <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-text-dark mb-3">
                Interested Course
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-light focus:border-primary outline-none transition-all duration-300 text-text-body"
              >
                <option value="">Select a course</option>
                <option value="hifz">Quran Memorization (Hifz)</option>
                <option value="quranic">Quranic Studies</option>
                <option value="islamic">Islamic Studies</option>
                <option value="arabic">Arabic Language</option>
                <option value="teacher">Teacher Training</option>
                <option value="other">Other</option>
              </select>
              </div>
            </ScrollReveal>

            {/* Message */}
            <ScrollReveal delay={500}>
              <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-text-dark mb-3">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Tell us about your inquiry..."
                rows="5"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-light focus:border-primary outline-none transition-all duration-300 resize-none placeholder-text-light"
              />
              </div>
            </ScrollReveal>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-light">* Required fields</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                isSubmitting
                  ? 'bg-text-light text-white cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>

          {/* Success Message */}
          {isSubmitted && (
            <div className="mt-6 px-6 py-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl animate-fade-in">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-emerald-900">Message Sent Successfully!</p>
                  <p className="text-sm text-emerald-700">We'll get back to you shortly.</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
