import { useMemo } from 'react';
import coursesData from '../../data/coursesData';
import PageBanner from '../common/PageBanner';
import CourseDetailCard from '../common/CourseDetailCard';

export default function CoursesHero() {
  return (
    <PageBanner
      title={coursesData.hero.title}
      description={coursesData.hero.description}
      breadcrumbs={[
        { label: 'Home', href: '#home' },
        { label: 'Courses' },
      ]}
    />
  );
}

export function CoursesFilters({ activeCategory, onCategoryChange }) {
  const { categories } = coursesData;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="relative max-w-xl mx-auto mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="7" stroke="#8A9A92" strokeWidth="2" />
            <path d="M14 14l4 4" stroke="#8A9A92" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search courses..."
          className="w-full pl-12 pr-5 py-3.5 bg-white border border-border-light rounded-2xl text-sm text-text-dark placeholder:text-text-light/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300 shadow-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
              activeCategory === cat.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white text-text-body border border-border-light hover:border-primary hover:text-primary hover:bg-primary-light'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CoursesGrid({ activeCategory }) {
  const filtered = useMemo(() => {
    if (activeCategory === 'all') return coursesData.courses;
    return coursesData.courses.filter((c) => c.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {filtered.map((course, i) => (
          <CourseDetailCard key={course.id} course={course} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-light">No courses found in this category.</p>
        </div>
      )}
    </div>
  );
}