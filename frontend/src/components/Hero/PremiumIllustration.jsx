import { useState, useCallback, useEffect } from 'react';
import { getGalleryPlaceholderSVG } from '../Gallery/GalleryPlaceholderSVGs';

function getImageUrl(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  const API_BASE = import.meta.env.VITE_API_URL || '';
  return `${API_BASE}${src}`;
}

export default function PremiumIllustration({ src, alt }) {
  const [imgError, setImgError] = useState(false);
  const handleError = useCallback(() => setImgError(true), []);

  // Reset error state when src changes so new uploads are attempted
  useEffect(() => {
    setImgError(false);
  }, [src]);

  console.log(imgError);


  // Show SVG fallback if no image src is provided, or if the image failed to load
  if (imgError || !src) {
    return (
      <div className="w-full max-h-[50vh] sm:max-h-[58vh] lg:max-h-[64vh] xl:max-h-[70vh] rounded-2xl overflow-hidden bg-accent-soft">
        {getGalleryPlaceholderSVG('hero')}
      </div>
    );
  }

  return (
    <div className="w-fit max-h-[50vh] sm:max-h-[58vh] lg:max-h-[64vh] xl:max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl shadow-primary/15 ring-1 ring-accent/10">
      <img
        src={getImageUrl(src)}
        alt={alt || 'Premium Illustration'}
        className="max-h-[inherit] w-auto h-auto rounded-2xl"
        loading="lazy"
        decoding="async"
        onError={handleError}
      />
    </div>
  );
}
