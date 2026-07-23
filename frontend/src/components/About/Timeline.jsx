import aboutData from '../../data/aboutData';
import SectionTitle from '../common/SectionTitle';
import ScrollReveal from '../common/ScrollReveal';

export default function Timeline({ history }) {
  const fallback = aboutData.timeline;
  // Handle all data shapes properly:
  // 1. Array with items -> use directly
  // 2. Non-empty string -> wrap as single item (CMS textarea input)
  // 3. Empty array [], empty string '', null, undefined -> use fallback
  const items = Array.isArray(history) && history.length > 0
    ? history
    : (typeof history === 'string' && history.trim()
        ? [{ year: 'Our History', title: 'Our Journey', description: history }]
        : fallback);

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft overflow-visible">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Our Journey"
          title="The Story of Our Growth"
          description="From a small Madrasa to a globally recognized online Islamic academy."
        />

        <div className="relative max-w-4xl mx-auto overflow-visible">
          <div className="absolute left-[1.375rem] sm:left-1/2 top-2 bottom-0 w-0.5 bg-gradient-to-b from-primary via-gold to-primary transform sm:-translate-x-px" />

          <div className="relative space-y-10 lg:space-y-12 overflow-visible">
            {items.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <ScrollReveal key={item.year || i} delay={i * 120}>
                  <div className={`relative flex flex-col sm:flex-row items-start gap-6 sm:gap-10 overflow-visible ${
                    isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}>
                    <div className="absolute left-0 sm:left-1/2 w-11 h-11 sm:-translate-x-1/2 bg-white border-2 border-primary rounded-xl flex items-center justify-center z-10 shadow-md">
                      <span className="font-heading text-xs font-bold text-primary">{item.year}</span>
                    </div>
                    <div className={`pl-14 sm:pl-0 sm:w-[calc(50%-2.5rem)] ${isLeft ? 'sm:pr-5 sm:text-right' : 'sm:pl-5'}`}>
                      <div className="bg-white rounded-2xl border border-border-light p-6 lg:p-7 transition-all duration-500 hover:shadow-[0_8px_35px_rgba(11,79,48,0.1)]">
                        <h3 className="font-heading text-lg font-bold text-primary">{item.title}</h3>
                        <p className="mt-2 text-sm text-text-body/80 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
