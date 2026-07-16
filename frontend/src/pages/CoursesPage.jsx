import { useState } from 'react';
import CoursesHero, { CoursesFilters, CoursesGrid } from '../components/CoursesPage/CoursesHero';
import LearningBenefits from '../components/CoursesPage/LearningBenefits';
import CourseTestimonials from '../components/CoursesPage/CourseTestimonials';
import CourseFAQ from '../components/CoursesPage/CourseFAQ';
import CoursesCTA from '../components/CoursesPage/CoursesCTA';

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <>
      <CoursesHero />
      <section className="py-10 lg:py-12 bg-white">
        <CoursesFilters
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <CoursesGrid activeCategory={activeCategory} />
      </section>
      <LearningBenefits />
      <CourseTestimonials />
      <CourseFAQ />
      <CoursesCTA />
    </>
  );
}