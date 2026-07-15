import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-primary via-primary-dark to-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="newsletter-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <polygon points="60,0 120,60 60,120 0,60" fill="none" stroke="#ffffff" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#newsletter-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <svg className="w-12 h-12 sm:w-14 sm:h-14 mx-auto text-gold/70 mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.105 2.289a.75.75 0 00-.105.75l.75 12a.75.75 0 00.709.55h.756a.75.75 0 00.709-.55l.75-12a.75.75 0 00-.105-.75A.75.75 0 0013.696 2h-2.66a.75.75 0 00-.742.797l.007.108a.75.75 0 00.735.692h1.543l-.035-.067a13.561 13.561 0 00-.271-.482.75.75 0 10-1.424.849c.007.01.015.021.022.031L10.94 4.9c.5 1.237 1.02 2.5 1.315 3.708H6.744a.75.75 0 010-1.5h.25a.75.75 0 00.75-.75V5.418a.75.75 0 00-.75-.75H5.625a.75.75 0 000 1.5h.125v1.25h-.375a.75.75 0 010-1.5H4.75A.75.75 0 004 5.168V2.82c0-.414.336-.75.75-.75h1.55a.75.75 0 00.695-.481l.092-.184a.75.75 0 00-.068-.74A.75.75 0 006.97 2H3.105z" />
          </svg>
        </div>

        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4 leading-tight">
          Stay Updated
        </h2>

        <p className="text-white/90 text-lg mb-8">
          Subscribe to our newsletter and never miss important announcements, course updates, and inspiring stories from our academy community.
        </p>

        {/* Newsletter Form */}
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-gold transition-all duration-300"
            required
          />
          <button
            type="submit"
            className="px-8 py-4 bg-gold hover:bg-gold-dark text-primary font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>

        {/* Success Message */}
        {isSubscribed && (
          <div className="mt-4 px-6 py-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-200 text-sm font-medium animate-fade-in">
            ✓ Thank you for subscribing! Check your email for confirmation.
          </div>
        )}

        {/* Privacy Note */}
        <p className="text-white/60 text-xs sm:text-sm mt-6">
          We respect your privacy. Unsubscribe at any time. No spam, ever.
        </p>
      </div>
    </section>
  );
}
