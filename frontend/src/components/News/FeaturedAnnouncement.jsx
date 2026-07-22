import { useState, useCallback } from 'react';
import { getGalleryPlaceholderSVG } from '../Gallery/GalleryPlaceholderSVGs';
import ScrollReveal from '../common/ScrollReveal';

export default function FeaturedAnnouncement({ featured }) {
  const [imgError, setImgError] = useState(false);
  const handleError = useCallback(() => setImgError(true), []);

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-gold-light via-white to-accent-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center bg-white rounded-3xl shadow-lg border border-gold/20 p-6 sm:p-8 lg:p-12">
          {/* Image */}
          <ScrollReveal>
            <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              {imgError || !featured.image ? (
                <div className="w-full h-[280px] sm:h-[340px] lg:h-[400px]">
                  {getGalleryPlaceholderSVG('news')}
                </div>
              ) : (
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-[280px] sm:h-[340px] lg:h-[400px] object-cover"
                  onError={handleError}
                />
              )}
            </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={200}>
            <div className="relative">
            <div className="inline-block px-4 py-2 bg-gold/15 border border-gold/40 rounded-full mb-5">
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Featured Announcement</span>
            </div>

            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-text-dark leading-tight mb-4">
              {featured.title}
            </h2>

            <p className="text-text-body text-base leading-relaxed mb-5">
              {featured.description}
            </p>

            <div className="space-y-4 pb-7 border-b border-border-light">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h12a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-text-dark font-medium text-sm sm:text-base">
                  {new Date(featured.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-text-body text-sm leading-relaxed">
                {featured.content}
              </p>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl"
            >
              Read Full Story
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
