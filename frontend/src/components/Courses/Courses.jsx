import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import homeData from '../../data/homeData';
import SectionTitle from '../common/SectionTitle';
import CourseCard from '../common/CourseCard';
import ScrollReveal from '../common/ScrollReveal';
import courseService from '../../services/courseService';

export default function Courses() {
  const [courses, setCourses] = useState(homeData.courses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await courseService.getPublishedCourses({ limit: 6 });
        if (res?.data?.length > 0) {
          const normalized = res.data.map(c => ({
            ...c,
            image: c.image || c.thumbnail || c.coverImage || null,
            id: c.id || c._id,
          }));
          setCourses(normalized);
        }
      } catch {
        // API not available — keep using dummy data from homeData
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const displayCourses = courses.slice(0, 6);

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

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-border-light overflow-hidden animate-pulse">
                <div className="h-36 bg-gray-200" />
                <div className="p-4 lg:p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {displayCourses.map((course, i) => (
              <ScrollReveal key={course.id || course._id || i} delay={i * 100}>
                <CourseCard course={course} />
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* View All */}
        <div className="mt-10 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
          >
            View All Courses
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}