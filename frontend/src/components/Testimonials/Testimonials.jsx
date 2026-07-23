import { useState, useRef, useEffect, useCallback } from 'react';
import homeData from '../../data/homeData';
import SectionTitle from '../common/SectionTitle';
import TestimonialCard from '../common/TestimonialCard';
import ScrollReveal from '../common/ScrollReveal';

export default function Testimonials() {
  const { testimonials } = homeData;
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);

  const scroll = useCallback((direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  const scrollToCard = useCallback((index) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[index];
    if (!card) return;
    const cardWidth = el.children[0]?.offsetWidth || 1;
    const gap = 20;
    const targetScroll = index * (cardWidth + gap);
    el.scrollTo({ left: targetScroll, behavior: 'smooth' });
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    const nextIndex = (activeIndex + 1) % testimonials.length;
    scrollToCard(nextIndex);
  }, [activeIndex, testimonials.length, scrollToCard]);

  // Track scroll position to update active dot
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.children[0]?.offsetWidth || 1;
      const gap = 20;
      const totalWidth = cardWidth + gap;
      const idx = Math.round(scrollLeft / totalWidth);
      setActiveIndex(Math.min(idx, testimonials.length - 1));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [testimonials.length]);

  // Infinite auto-play
  useEffect(() => {
    if (isPaused) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    autoPlayRef.current = setInterval(() => {
      goNext();
    }, 4000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused, goNext]);

  // Reset auto-play timer when user manually interacts
  const handleManualInteraction = useCallback((action) => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    action();
    // Restart auto-play if not paused via hover
    if (!isPaused) {
      autoPlayRef.current = setInterval(() => goNext(), 4000);
    }
  }, [isPaused, goNext]);

  return (
    <section className="relative py-16 lg:py-20 bg-accent-soft">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="testimonials-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#0B4F30" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#testimonials-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Testimonials"
          title="What Our Students Say"
          description="Hear from our students around the world about their learning journey with us."
        />

        {/* Controls */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <button
            onClick={() => handleManualInteraction(() => scroll('left'))}
            className="w-11 h-11 rounded-xl border border-border-light bg-white flex items-center justify-center text-text-body hover:text-primary hover:border-primary hover:bg-primary-light transition-all duration-300 shadow-sm hover:shadow-md"
            aria-label="Previous testimonials"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => handleManualInteraction(() => scroll('right'))}
            className="w-11 h-11 rounded-xl border border-border-light bg-white flex items-center justify-center text-text-body hover:text-primary hover:border-primary hover:bg-primary-light transition-all duration-300 shadow-sm hover:shadow-md"
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
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-5 lg:gap-6 overflow-x-auto pb-6 -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, i) => (
            <div key={testimonial.id} className="snap-start flex-shrink-0">
              <ScrollReveal delay={i * 100}>
                <TestimonialCard testimonial={testimonial} />
              </ScrollReveal>
            </div>
          ))}
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-2.5 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => handleManualInteraction(() => scrollToCard(i))}
              className={`transition-all duration-300 rounded-full ${
                i === activeIndex
                  ? `w-8 h-2.5 bg-primary ${!isPaused ? 'animate-pulse' : ''}`
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