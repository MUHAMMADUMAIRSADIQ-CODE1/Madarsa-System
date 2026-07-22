import homeData from '../../data/homeData';
import SectionTitle from '../common/SectionTitle';
import ScrollReveal from '../common/ScrollReveal';

const iconMap = {
  scholar: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  worldwide: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  clock: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  certificate: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><path d="M12 6v4" /><path d="M10 8h4" />
    </svg>
  ),
  gender: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" /><path d="M12 13v9" /><path d="M9 18h6" />
    </svg>
  ),
  support: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-2a4 4 0 00-4-4H6" /><path d="M18 12h-2a4 4 0 00-4-4" />
    </svg>
  ),
};

export default function WhyChooseUs() {
  const { whyChooseUs } = homeData;

  return (
    <section id="about" className="relative py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Why Choose Us"
          title="Why Jamia Tul Uloom Muhammadiya?"
          description="We combine traditional Islamic scholarship with modern teaching methods to provide an exceptional learning experience."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {whyChooseUs.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 100}>
              <div className="group relative bg-white rounded-2xl border border-border-light p-6 lg:p-8 transition-all duration-500 hover:shadow-[0_8px_35px_rgba(11,79,48,0.1)] hover:-translate-y-0.5">
              <div className="w-14 h-14 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg">
                {iconMap[item.icon]}
              </div>
              <h3 className="font-heading text-lg font-bold text-text-dark group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-text-body/80 leading-relaxed">
                {item.description}
              </p>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}