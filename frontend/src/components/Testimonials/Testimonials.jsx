import { useRef, useState, useEffect, useCallback } from 'react';
import homeData from '../../data/homeData';
import SectionTitle from '../common/SectionTitle';
import TestimonialCard from '../common/TestimonialCard';

export default function Testimonials() {
  const { testimonials } = homeData;
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = useCallback((direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  // Get the actual gap from computed style (already in pixels)
  const getCardGap = (el) => {
    const computedStyle = window.getComputedStyle(el);
    return parseFloat(computedStyle.getPropertyValue('gap')) || 20;
  };

  // Track scroll position to update active dot
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const card = el.querySelector('.snap-start');
      if (!card) return;
      const gap = getCardGap(el);
      const cardWidth = card.offsetWidth + gap;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(idx, testimonials.length - 1));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [testimonials.length]);

  const scrollToIndex = (idx) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('.snap-start');
    if (!card) return;
    const gap = getCardGap(el);
    const cardWidth = card.offsetWidth + gap;
    el.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
    setActiveIndex(idx);
  };

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Testimonials"
          title="What Our Students Say"
          description="Hear from our students around the world about their learning journey with us."
        />

        {/* Controls */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <button
            onClick={() => scroll('left')}
            className="w-11 h-11 rounded-xl border border-border-light bg-white flex items-center justify-center text-text-body hover:text-primary hover:border-primary hover:bg-primary-light transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
            aria-label="Previous testimonials"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-11 h-11 rounded-xl border border-border-light bg-white flex items-center justify-center text-text-body hover:text-primary hover:border-primary hover:bg-primary-light transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
            aria-label="Next testimonials"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Slider */}
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

        {/* Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all duration-400 ${
                i === activeIndex
                  ? 'w-8 h-2.5 bg-primary'
                  : 'w-2.5 h-2.5 bg-border-light hover:bg-primary/40'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}