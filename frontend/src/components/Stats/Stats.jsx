import { useState, useEffect, useRef } from 'react';
import homeData from '../../data/homeData';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/* ──────────────────────────────────────────────
   Scoped animations for this component only
   ────────────────────────────────────────────── */
const statsStylesId = 'stats-scoped-styles';

export function injectStatsStyles() {
  if (document.getElementById(statsStylesId)) return;
  const style = document.createElement('style');
  style.id = statsStylesId;
  style.textContent = `
    /* ── Entrance: fade-up + scale (one-shot) ── */
    @keyframes stats-entrance {
      0% { opacity: 0; transform: translateY(24px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-stats-entrance {
      animation: stats-entrance 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    /* ── Ocean wave background: horizontal scroll ── */
    @keyframes stats-wave-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .stats-wave-layer {
      animation: stats-wave-scroll linear infinite;
    }

    /* ── Content bobbing: gentle up/down like floating on water ── */
    @keyframes stats-bob {
      0%, 100% { transform: translateY(-2px); }
      50% { transform: translateY(3px); }
    }
    .stats-content-bob {
      animation: stats-bob ease-in-out infinite;
    }

    /* Pause bobbing on card hover — blends smoothly with hover-lift */
    .group:hover .stats-content-bob {
      animation-play-state: paused;
    }

    /* ── Hover spring transform on icon: scale 1.1 + rotate 4° ── */
    .stats-icon-hover {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                  background-color 0.3s ease,
                  color 0.3s ease,
                  box-shadow 0.3s ease;
    }
    .group:hover .stats-icon-hover {
      transform: scale(1.1) rotate(4deg);
    }

    /* ── Reduced motion: kill all animations ── */
    @media (prefers-reduced-motion: reduce) {
      .animate-stats-entrance {
        animation: none;
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .stats-wave-layer {
        animation: none;
      }
      .stats-content-bob {
        animation: none;
        transform: translateY(0);
      }
      .stats-icon-hover {
        transition: none;
      }
      .group:hover .stats-icon-hover {
        transform: none;
      }
    }
  `;
  document.head.appendChild(style);
}

/* ──────────────────────────────────────────────
   Count-up hook with ease-out
   ────────────────────────────────────────────── */
function useCountUp(target, duration = 1800, active = true) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!target || started.current || !active) return;
    if (target === 0) { setCount(0); return; }
    started.current = true;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = (timestamp - startTimestamp) / duration;
      const progress = Math.min(elapsed, 1);
      // ease-out cubic: 1 - (1 - t)³
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);

  return count;
}

/* ──────────────────────────────────────────────
   Individual stat card
   ────────────────────────────────────────────── */
function StatCard({ stat, index }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });
  const count = useCountUp(stat.value, 1800, isVisible);

  const iconMap = {
    users: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    teachers: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><path d="M12 6v4" /><path d="M10 8h4" />
      </svg>
    ),
    globe: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    book: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
    graduation: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  };

  return (
    <div
      ref={ref}
      className={`group relative bg-white rounded-2xl border border-border-light p-5 sm:p-6 overflow-hidden min-h-[130px] sm:min-h-[140px] transition-all duration-200 ease-out ${
        isVisible
          ? 'animate-stats-entrance'
          : 'opacity-0 translate-y-6 scale-95'
      } hover:shadow-[0_12px_40px_rgba(11,79,48,0.12)] hover:-translate-y-1.5`}
      style={{
        animationDelay: isVisible ? `${index * 120}ms` : '0ms',
      }}
    >
      {/* Ocean wave background — two layered scrolling waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Wave 1 — slower, slightly more opaque */}
        <svg
          className="absolute bottom-0 w-[200%] h-3/5 max-h-20 stats-wave-layer"
          viewBox="0 0 360 80"
          preserveAspectRatio="none"
          style={{ animationDuration: '10s' }}
        >
          <path
            d="M0,50 C30,30 60,30 90,50 C120,70 150,70 180,50 C210,30 240,30 270,50 C300,70 330,70 360,50 L360,80 L0,80 Z"
            fill="rgba(11,79,48,0.06)"
          />
        </svg>
        {/* Wave 2 — faster, slightly less opaque */}
        <svg
          className="absolute bottom-0 w-[200%] h-1/2 max-h-16 stats-wave-layer"
          viewBox="0 0 360 64"
          preserveAspectRatio="none"
          style={{ animationDuration: '7s' }}
        >
          <path
            d="M0,42 C25,28 50,28 75,42 C100,56 125,56 150,42 C175,28 200,28 225,42 C250,56 275,56 300,42 C325,28 350,28 360,42 L360,64 L0,64 Z"
            fill="rgba(11,79,48,0.04)"
          />
        </svg>
      </div>

      {/* Content — sits above wave layer, bobs gently like floating on water */}
      <div
        className="relative z-10 flex items-center gap-4 sm:gap-5 stats-content-bob"
        style={{
          animationDuration: `${3.5 + (index % 5) * 0.25}s`,
          animationDelay: `${index * 0.4}s`,
        }}
      >
        {/* Icon - left side */}
        <div className="flex-shrink-0 w-14 h-14 sm:w-15 sm:h-15 lg:w-16 lg:h-16">
          <div className="w-full h-full rounded-xl bg-primary-light text-primary flex items-center justify-center stats-icon-hover group-hover:bg-primary group-hover:text-white group-hover:shadow-lg">
            {iconMap[stat.icon]}
          </div>
        </div>

        {/* Number + label - right side */}
        <div className="min-w-0 flex-1">
          <div className="font-heading text-[clamp(1.25rem,3.5vw,1.875rem)] font-bold text-text-dark tracking-tight leading-none">
            <span>{count.toLocaleString()}</span>
            <span className="text-gold ml-px">{stat.suffix}</span>
          </div>
          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-text-light font-medium leading-tight [overflow-wrap:break-word] [word-break:normal]">
            {stat.label}
          </p>
        </div>
      </div>
    </div>
  );
}

// Inject scoped styles at module level so keyframes exist before first paint
if (typeof document !== 'undefined') {
  injectStatsStyles();
}

/* ──────────────────────────────────────────────
   Stats section wrapper
   ────────────────────────────────────────────── */
export default function Stats() {
  const { stats } = homeData;

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft">
      {/* Decorative background pattern */}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}