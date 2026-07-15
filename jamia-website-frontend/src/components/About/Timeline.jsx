import aboutData from '../../data/aboutData';
import SectionTitle from '../common/SectionTitle';

export default function Timeline({ history }) {
  const fallback = aboutData.timeline;
  const items = history ? [{ year: 'Our History', title: 'Our Journey', description: history }] : fallback;

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Our Journey"
          title="The Story of Our Growth"
          description="From a small Madrasa to a globally recognized online Islamic academy."
        />

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-[1.375rem] sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-gold to-primary transform sm:-translate-x-px" />

          <div className="relative space-y-10 lg:space-y-12">
            {items.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={item.year || i}
                  className={`relative flex flex-col sm:flex-row items-start gap-6 sm:gap-10 animate-fade-in-up ${
                    isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="absolute left-0 sm:left-1/2 w-[2.75rem] h-[2.75rem] -translate-x-[1px] sm:-translate-x-1/2 bg-white border-2 border-primary rounded-xl flex items-center justify-center z-10 shadow-md">
                    <span className="font-heading text-xs font-bold text-primary">{item.year}</span>
                  </div>

                  <div className={`pl-14 sm:pl-0 sm:w-[calc(50%-2.5rem)] ${isLeft ? 'sm:pr-4 sm:text-right' : 'sm:pl-4'}`}>
                    <div className="bg-white rounded-2xl border border-border-light p-6 lg:p-7 transition-all duration-500 hover:shadow-[0_8px_35px_rgba(11,79,48,0.1)]">
                      <h3 className="font-heading text-lg font-bold text-primary">{item.title}</h3>
                      <p className="mt-2 text-sm text-text-body/80 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
