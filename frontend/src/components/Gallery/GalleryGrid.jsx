import { useState, useCallback } from 'react';
import { getGalleryPlaceholderSVG } from './GalleryPlaceholderSVGs';
import ScrollReveal from '../common/ScrollReveal';

function GalleryCard({ item, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleError = useCallback(() => setImgError(true), []);

  return (
    <ScrollReveal delay={index * 50}>
      <div
        className="group relative overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      {/* Image Container */}
      <div className="aspect-[4/3] overflow-hidden bg-accent-soft relative">
        {imgError || !item.image ? (
          <div className="absolute inset-0">
            {getGalleryPlaceholderSVG(item.categoryId)}
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={handleError}
          />
        )}
      </div>

      {/* Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-400 flex items-end p-5 sm:p-6 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="w-full">
          <h3 className="text-white font-heading font-bold text-lg sm:text-xl line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gold font-semibold uppercase tracking-wider">
              {item.category}
            </span>
            <span className="text-xs text-white/70">
              {new Date(item.date).toLocaleDateString()}
            </span>
          </div>
          <p className="text-white/80 text-xs sm:text-sm mt-2 line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      </div>
      {/* View Button - Always visible on mobile, on hover on desktop */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="bg-gold hover:bg-gold-dark text-white rounded-full p-2.5 transition-all duration-300 shadow-lg hover:shadow-xl">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </ScrollReveal>
  );
}

export default function GalleryGrid({ images }) {
  return (
    <section className="py-8 lg:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {images.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-text-light text-lg">No images found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {images.map((item, i) => (
              <GalleryCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}