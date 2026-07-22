import homeData from '../../data/homeData';
import SectionTitle from '../common/SectionTitle';
import TeacherCard from '../common/TeacherCard';
import ScrollReveal from '../common/ScrollReveal';

export default function Teachers() {
  const { teachers } = homeData;

  return (
    <section id="teachers" className="relative py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Our Scholars"
          title="Meet Our Qualified Scholars"
          description="Learn from certified Islamic scholars with Ijazah from prestigious universities worldwide."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {teachers.map((teacher, i) => (
            <ScrollReveal key={teacher.id} delay={i * 120}>
              <TeacherCard teacher={teacher} />
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#all-teachers"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary text-primary font-semibold rounded-2xl hover:bg-primary-light transition-all duration-300"
          >
            View All Scholars
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}