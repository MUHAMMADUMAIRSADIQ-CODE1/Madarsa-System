import coursesData from '../../data/coursesData';
import SectionTitle from '../common/SectionTitle';

const benefitIcons = {
  teacher: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  clock: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  online: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><path d="M8 21h8" /><path d="M12 17v4" />
    </svg>
  ),
  record: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  ),
  certificate: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  support: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-2a4 4 0 00-4-4H6" /><path d="M18 12h-2a4 4 0 00-4-4" />
    </svg>
  ),
};

export default function LearningBenefits() {
  const { benefits } = coursesData;

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Why Learn With Us"
          title="Benefits of Learning at Jamia Tul Uloom"
          description="Experience a unique blend of traditional scholarship and modern technology."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {benefits.map((benefit, i) => (
            <div
              key={benefit.id}
              className="group bg-white rounded-2xl border border-border-light p-6 lg:p-8 transition-all duration-500 hover:shadow-[0_8px_35px_rgba(11,79,48,0.1)] hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg">
                {benefitIcons[benefit.icon]}
              </div>
              <h3 className="font-heading text-lg font-bold text-text-dark group-hover:text-primary transition-colors duration-300">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm text-text-body/80 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}