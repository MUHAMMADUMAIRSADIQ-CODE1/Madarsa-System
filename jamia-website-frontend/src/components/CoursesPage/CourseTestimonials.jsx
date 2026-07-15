import { useRef } from 'react';
import coursesData from '../../data/coursesData';
import SectionTitle from '../common/SectionTitle';
import TestimonialCard from '../common/TestimonialCard';

export default function CourseTestimonials() {
  const { testimonials } = coursesData;
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Student Reviews"
          title="What Our Students Say"
          description="Hear from students who have transformed their learning journey with us."
        />

        <div className="flex items-center justify-end gap-3 mb-6">
          <button
            onClick={() => scroll('left')}
            className="w-11 h-11 rounded-xl border border-border-light bg-white flex items-center justify-center text-text-body hover:text-primary hover:border-primary hover:bg-primary-light transition-all duration-300 shadow-sm"
            aria-label="Previous"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-11 h-11 rounded-xl border border-border-light bg-white flex items-center justify-center text-text-body hover:text-primary hover:border-primary hover:bg-primary-light transition-all duration-300 shadow-sm"
            aria-label="Next"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 lg:gap-6 overflow-x-auto pb-4 -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, i) => (
            <div key={testimonial.id} className="snap-start">
              <TestimonialCard testimonial={testimonial} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}