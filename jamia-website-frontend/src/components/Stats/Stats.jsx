import { useState, useEffect, useRef } from 'react';
import homeData from '../../data/homeData';

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!target || started.current) return;
    started.current = true;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

function StatCard({ stat, index }) {
  const count = useCountUp(stat.value);

  const iconMap = {
    users: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    teachers: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><path d="M12 6v4" /><path d="M10 8h4" />
      </svg>
    ),
    globe: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    book: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
    graduation: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  };

  return (
    <div
      className="group relative bg-white rounded-2xl border border-border-light p-6 sm:p-7 lg:p-8 text-center transition-all duration-500 hover:shadow-[0_8px_35px_rgba(11,79,48,0.1)] hover:-translate-y-0.5 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-12 h-12 lg:w-14 lg:h-14 mx-auto rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
        {iconMap[stat.icon]}
      </div>
      <div className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text-dark tracking-tight">
        <span>{count.toLocaleString()}</span>
        <span className="text-gold">{stat.suffix}</span>
      </div>
      <p className="mt-1.5 text-sm sm:text-base text-text-light font-medium">{stat.label}</p>
    </div>
  );
}

export default function Stats() {
  const { stats } = homeData;

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stats-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <polygon points="50,0 100,50 50,100 0,50" fill="none" stroke="#0B4F30" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stats-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}