import { useState } from 'react';
import homeData from '../../data/homeData';
import SectionTitle from '../common/SectionTitle';

const galleryFallbackImages = [
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80',
  'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&q=80',
  'https://images.unsplash.com/photo-1564769610775-a2ccf685f3fd?w=600&q=80',
  'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80',
  'https://images.unsplash.com/photo-1609786502781-ebfb17ba3b1e?w=600&q=80',
  'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=600&q=80',
];

const galleryColors = [
  'from-emerald-500 to-primary',
  'from-gold to-amber-600',
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-emerald-600',
  'from-amber-500 to-orange-600',
  'from-primary to-emerald-700',
];

export default function Gallery() {
  const { gallery } = homeData;
  const [erroredImages, setErroredImages] = useState(new Set());

  const handleImageError = (id) => {
    setErroredImages((prev) => new Set(prev).add(id));
  };

  return (
    <section id="gallery" className="relative py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Gallery"
          title="A Glimpse Into Our Academy"
          description="Explore moments from our online classes, events, and academic activities."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {gallery.map((item, i) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden cursor-pointer animate-fade-in-up transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(11,79,48,0.15)]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`aspect-[4/3] relative overflow-hidden ${item.image ? '' : `bg-gradient-to-br ${galleryColors[i]} flex items-center justify-center`}`}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <>
                    {erroredImages.has(item.id) ? (
                      <div className={`w-full h-full bg-gradient-to-br ${galleryColors[i]} flex items-center justify-center`}>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjMwLDAgNjAsMzAgMzAsNjAgMCwzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] opacity-20" />
                        <svg className="relative w-12 h-12 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    ) : (
                      <>
                        <img
                          src={galleryFallbackImages[i % galleryFallbackImages.length]}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          decoding="async"
                          onError={() => handleImageError(item.id)}
                        />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjMwLDAgNjAsMzAgMzAsNjAsMCwzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] opacity-10" />
                      </>
                    )}
                  </>
                )}

                {/* Consistent overlay gradient at bottom for ALL cards */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Title + Category always visible at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                  <h3 className="text-white font-heading font-bold text-sm sm:text-lg leading-tight truncate">{item.title}</h3>
                  <span className="text-xs text-gold-light font-medium uppercase tracking-wider">{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#gallery"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
          >
            View Full Gallery
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}