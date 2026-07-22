import aboutData from '../../data/aboutData';
import ScrollReveal from '../common/ScrollReveal';

export default function FounderMessage({ message }) {
  const fallback = aboutData.founder;
  const msg = message || fallback.message;
  const name = fallback.name;
  const title = fallback.title;
  const qualification = fallback.qualification;
  const experience = fallback.experience;
  const signature = fallback.signature;
  const initial = name.charAt(0);

  return (
    <section className="relative py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-accent-soft via-white to-accent-soft/60 rounded-3xl border border-border-light p-8 lg:p-12 shadow-[0_4px_30px_rgba(11,79,48,0.06)]">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
              <div className="text-center lg:text-left">
                <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto lg:mx-0 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-xl shadow-primary/20">
                  <span className="font-heading text-5xl lg:text-6xl font-bold text-white">{initial}</span>
                </div>
                <div className="mt-4">
                  <h3 className="font-heading text-lg font-bold text-text-dark">{name}</h3>
                  <p className="text-sm text-gold font-medium">{title}</p>
                  <p className="text-xs text-text-light mt-1">{qualification}</p>
                  <p className="text-xs text-text-light mt-0.5">{experience} of experience</p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="relative">
                  <svg className="absolute -top-2 -left-2 w-8 h-8 text-primary/10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-base sm:text-lg text-text-body/90 leading-relaxed italic pl-6">
                    &ldquo;{msg}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pl-6">
                  <div className="w-20 h-0.5 bg-gold mb-3" />
                  <p className="font-heading text-base font-bold text-text-dark">{signature}</p>
                  <p className="text-xs text-text-light">Founder &amp; Principal</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
