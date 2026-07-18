import { useState, useEffect } from 'react';
import PremiumIllustration from './PremiumIllustration';
import heroService from '../../services/heroService';

const fallbackFeatures = [
  'Certified Islamic Scholars',
  'Male & Female Teachers',
  'Online Worldwide Classes',
  'Flexible Timings',
];

export default function Hero() {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHero() {
      try {
        const res = await heroService.getPublicHero();
        setHero(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load hero');
      } finally {
        setLoading(false);
      }
    }
    loadHero();
  }, []);

  const h = hero || {};

  const features = h.features || h.content?.features || fallbackFeatures;
  const badge = h.badge || h.subtitle || 'Admissions Open for 2026';
  const heading = h.title || 'Learn Quran & Islamic Education From Qualified Scholars Worldwide';
  const description = h.description || 'Join a prestigious online academy dedicated to authentic Islamic learning. Study the Quran, Tajweed, Tafseer, and Islamic sciences with certified scholars from renowned institutions worldwide.';
  const buttons = h.buttons && h.buttons.length > 0 ? h.buttons : [
    { label: 'Apply Now', url: '#apply', variant: 'primary', isPrimary: true },
    { label: 'Explore Courses', url: '#courses', variant: 'outline', isPrimary: false },
  ];
  const imageUrl = h.images?.[0]?.url || null;
  const imageAlt = h.images?.[0]?.alt || 'Premium Illustration';

  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-accent-soft via-white to-accent-soft/60 min-h-screen pt-20 lg:pt-24 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_28%,rgba(201,168,76,0.07)_0%,rgba(11,79,48,0.04)_35%,transparent_70%)]" />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.1]"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-bg" x="0" y="0" width="320" height="240" patternUnits="userSpaceOnUse">
              <polygon points="80,15 100,60 145,80 100,100 80,145 60,100 15,80 60,60" fill="none" stroke="#0B4F30" strokeWidth="0.9" />
              <circle cx="80" cy="80" r="65" fill="none" stroke="#0B4F30" strokeWidth="0.35" />
              <polygon points="80,40 90,65 115,75 90,85 80,110 70,85 45,75 70,65" fill="none" stroke="#C9A84C" strokeWidth="0.4" />
              <polygon points="240,175 260,220 305,240 260,260 240,305 220,260 175,240 220,220" fill="none" stroke="#0B4F30" strokeWidth="0.9" />
              <circle cx="240" cy="240" r="65" fill="none" stroke="#0B4F30" strokeWidth="0.35" />
              <polygon points="240,200 250,225 275,235 250,245 240,270 230,245 205,235 230,225" fill="none" stroke="#C9A84C" strokeWidth="0.4" />
              <polygon points="160,80 240,160 160,240 80,160" fill="none" stroke="#0B4F30" strokeWidth="0.2" opacity="0.4" />
              <line x1="80" y1="80" x2="240" y2="80" stroke="#C9A84C" strokeWidth="0.15" opacity="0.5" />
              <line x1="80" y1="240" x2="240" y2="240" stroke="#C9A84C" strokeWidth="0.15" opacity="0.5" />
              <circle cx="80" cy="80" r="100" fill="none" stroke="#0B4F30" strokeWidth="0.15" opacity="0.3" />
              <circle cx="240" cy="240" r="100" fill="none" stroke="#0B4F30" strokeWidth="0.15" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-bg)" />
        </svg>
      </div>

      <div
        className="absolute bottom-0 inset-x-0 pointer-events-none opacity-[0.07] h-28 sm:h-36 lg:h-44"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mihrab-arches" x="0" y="0" width="220" height="180" patternUnits="userSpaceOnUse">
              <path d="M 20,180 L 20,90 Q 110,-20 200,90 L 200,180 Z" fill="none" stroke="#0B4F30" strokeWidth="1.2" />
              <path d="M 35,180 L 35,105 Q 110,0 185,105 L 185,180 Z" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
              <rect x="217" y="30" width="6" height="150" rx="3" fill="none" stroke="#0B4F30" strokeWidth="0.3" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mihrab-arches)" />
        </svg>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-20 sm:h-24 lg:h-28 bg-gradient-to-t from-accent-soft to-transparent pointer-events-none z-[1]" />

      <div className="absolute top-1/4 right-[8%] w-32 h-32 border border-gold/15 rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-[12%] w-20 h-20 border border-gold/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-[5%] w-40 h-40 border border-gold/10 rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full py-6 sm:py-8 lg:py-0">
        <div className="grid md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr] gap-5 sm:gap-8 lg:gap-10 xl:gap-14 md:items-center">
          <div className="order-1 md:order-2 flex items-center justify-center animate-fade-in-up stagger-3 w-full transform transition-transform duration-700 hover:scale-105">
            <PremiumIllustration src={imageUrl} alt={imageAlt} />
          </div>

          <div className="order-2 md:order-1 mx-auto lg:mx-0 w-full">
            <div className="animate-fade-in-up stagger-1">
              <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-light/80 backdrop-blur-sm border border-accent/50 rounded-full text-sm font-medium text-primary">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                {badge}
              </span>
            </div>

            <h1 className="mt-3 sm:mt-4 font-heading text-2xl sm:text-4xl lg:text-[clamp(1.75rem,2.2vw,2.5rem)] xl:text-[clamp(2rem,2.6vw,2.85rem)] 2xl:text-[clamp(2.25rem,3vw,3.25rem)] font-bold leading-[1.12] tracking-[-0.01em] text-text-dark animate-fade-in-up stagger-2">
              {heading}
            </h1>

            {description && (
              <p className="mt-3 sm:mt-4 max-w-lg text-sm sm:text-base text-text-body/90 leading-7 sm:leading-8 animate-fade-in-up stagger-3">
                {description}
              </p>
            )}

            {features.length > 0 && (
              <ul className="mt-4 sm:mt-5 space-y-1.5 animate-fade-in-up stagger-4" role="list">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-text-body">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7.5L5.5 10L11 4" stroke="#0B4F30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-sm sm:text-base font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 sm:mt-6 flex flex-wrap gap-3 animate-fade-in-up stagger-5">
              {buttons.map((btn, idx) => {
                const isPrimary = btn.isPrimary || btn.variant === 'primary' || idx === 0;
                if (isPrimary) {
                  return (
                    <a
                      key={idx}
                      href={btn.url || '#apply'}
                      className="group relative inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold text-sm sm:text-base rounded-2xl overflow-hidden transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 hover:scale-105"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/15 to-gold/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative">{btn.label}</span>
                      <svg className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  );
                }
                return (
                  <a
                    key={idx}
                    href={btn.url || '#courses'}
                    className="group relative inline-flex items-center gap-2 px-6 py-3 bg-transparent text-primary font-semibold text-sm sm:text-base rounded-2xl border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:bg-primary-light/50 hover:-translate-y-1"
                  >
                    <span>{btn.label}</span>
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                );
              })}
            </div>

            <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-border-light animate-fade-in-up stagger-6">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-text-light mb-3">
                Trusted by Students Worldwide
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-primary-light flex items-center justify-center text-xs font-bold text-primary shadow-sm"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    +2K
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 14 14" fill="#C9A84C" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.5l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-text-light">4.9/5 from 2,000+ students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
