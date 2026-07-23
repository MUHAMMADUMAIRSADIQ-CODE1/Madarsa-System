import { Link } from 'react-router-dom';
import homeData from '../../data/homeData';
import SectionTitle from '../common/SectionTitle';
import ScrollReveal from '../common/ScrollReveal';

const typeColors = {
  Admission: 'bg-blue-100 text-blue-700',
  Course: 'bg-emerald-100 text-emerald-700',
  Event: 'bg-amber-100 text-amber-700',
};

export default function Announcements() {
  const { announcements } = homeData;

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Announcements"
          title="Latest News & Updates"
          description="Stay informed about admissions, new courses, events, and academy news."
        />

        <div className="max-w-4xl mx-auto space-y-4 lg:space-y-5">
          {announcements.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 120}>
            <Link
              to={item.href}
              className="group block bg-white rounded-2xl border border-border-light p-5 lg:p-7 transition-all duration-500 hover:shadow-[0_8px_35px_rgba(11,79,48,0.1)] hover:-translate-y-0.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Date Badge */}
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary-light flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-primary uppercase">{item.date.split(' ')[0]}</span>
                  <span className="text-lg font-bold text-primary leading-none">{item.date.split(' ')[1]}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                  <h3 className="mt-2 font-heading text-lg lg:text-xl font-bold text-text-dark group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-body/70 leading-relaxed">{item.excerpt}</p>
                </div>

                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>    </section>
  );
}
