import aboutData from '../../data/aboutData';

export default function MissionVision({ mission, vision }) {
  const fallback = aboutData;
  const m = mission || fallback.mission?.description || '';
  const v = vision || fallback.vision?.description || '';

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-border-light p-8 lg:p-10 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(11,79,48,0.1)] animate-fade-in-up stagger-1 h-full">
            <div className="w-14 h-14 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v12" /><path d="M6 12h12" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold text-text-dark">Our Mission</h3>
            <p className="mt-4 text-sm sm:text-base text-text-body/85 leading-relaxed">{m}</p>
          </div>

          <div className="bg-white rounded-2xl border border-border-light p-8 lg:p-10 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(11,79,48,0.1)] animate-fade-in-up stagger-2 h-full">
            <div className="w-14 h-14 rounded-xl bg-gold-light text-gold-dark flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold text-text-dark">Our Vision</h3>
            <p className="mt-4 text-sm sm:text-base text-text-body/85 leading-relaxed">{v}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
