import homeData from '../../data/homeData';
import SectionTitle from '../common/SectionTitle';
import CourseCard from '../common/CourseCard';
import ScrollReveal from '../common/ScrollReveal';

export default function Courses() {
  const { courses } = homeData;

  return (
    <section id="courses" className="relative py-16 lg:py-20 bg-accent-soft">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="courses-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,0 80,40 40,80 0,40" fill="none" stroke="#0B4F30" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#courses-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Our Courses"
          title="Featured Courses"
          description="Choose from our comprehensive range of Islamic courses taught by qualified scholars."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {courses.map((course, i) => (
            <ScrollReveal key={course.id} delay={i * 100}>
              <CourseCard course={course} />
            </ScrollReveal>
          ))}
        </div>

        {/* View All */}
        <div className="mt-10 text-center">
          <a
            href="#all-courses"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
          >
            View All Courses
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}