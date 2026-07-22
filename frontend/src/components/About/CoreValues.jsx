import aboutData from '../../data/aboutData';
import SectionTitle from '../common/SectionTitle';
import ScrollReveal from '../common/ScrollReveal';

const valueIcons = {
  integrity: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  knowledge: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><path d="M12 6v4" /><path d="M10 8h4" />
    </svg>
  ),
  compassion: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  discipline: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  excellence: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  faith: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
};

export default function CoreValues({ values }) {
  const fallback = aboutData.coreValues;
  const items = values?.length > 0 ? values : fallback;

  return (
    <section className="relative py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Our Core Values"
          title="The Principles That Guide Us"
          description="Our values shape every aspect of our academy — from curriculum design to student interaction."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {items.map((value, i) => {
            const iconKey = value.icon || Object.keys(valueIcons)[i % Object.keys(valueIcons).length];
            return (
              <ScrollReveal key={value.id || i} delay={i * 80}>
                <div className="group bg-white rounded-2xl border border-border-light p-6 lg:p-8 transition-all duration-500 hover:shadow-[0_8px_35px_rgba(11,79,48,0.1)] hover:-translate-y-0.5">
                  <div className="w-14 h-14 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg">
                    {valueIcons[iconKey]}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-text-dark group-hover:text-primary transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-body/80 leading-relaxed">{value.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
