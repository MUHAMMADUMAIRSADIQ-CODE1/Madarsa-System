import { useState, useCallback } from 'react';
import { getGalleryPlaceholderSVG } from './GalleryPlaceholderSVGs';
import ScrollReveal from '../common/ScrollReveal';

export default function FeaturedEvent({ featured }) {
  const [imgError, setImgError] = useState(false);

  const handleError = useCallback(() => setImgError(true), []);

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-primary-light via-white to-accent-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image */}
          <ScrollReveal>
            <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-2 bg-gradient-to-br from-gold/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {imgError || !featured.image ? (
                <div className="w-full h-[400px]">
                  {getGalleryPlaceholderSVG('convocation')}
                </div>
              ) : (
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-[400px] object-cover"
                  onError={handleError}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={200}>
            <div className="order-1 lg:order-2">
            <div className="inline-block px-4 py-2 bg-gold/10 border border-gold/30 rounded-full mb-6">
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Featured Event</span>
            </div>

            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text-dark leading-tight mb-4">
              {featured.title}
            </h2>

            <p className="text-text-body text-lg leading-relaxed mb-6">
              {featured.description}
            </p>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pb-8 border-b border-border-light">
              <div>
                <p className="text-text-light text-sm font-medium mb-1">Event Date</p>
                <p className="text-text-dark font-semibold text-lg">
                  {new Date(featured.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-text-light text-sm font-medium mb-1">Location</p>
                <p className="text-text-dark font-semibold text-lg">{featured.location}</p>
              </div>
            </div>

            {/* Highlights */}
            <div className="mb-8">
              <h3 className="font-heading font-semibold text-text-dark mb-4">Event Highlights</h3>
              <ul className="space-y-3">
                {featured.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-text-body">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl">
                Register Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a href="#news" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary font-semibold rounded-2xl border-2 border-primary hover:bg-primary-light transition-all duration-300">
                Learn More
              </a>
            </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}