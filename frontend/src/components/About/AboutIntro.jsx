import { useState, useCallback } from 'react';
import aboutData from '../../data/aboutData';
import { getGalleryPlaceholderSVG } from '../Gallery/GalleryPlaceholderSVGs';
import ScrollReveal from '../common/ScrollReveal';

export default function AboutIntro({ data }) {
  const fallback = aboutData.intro;
  const title = data?.title || fallback.title;
  const subtitle = data?.subtitle || fallback.subtitle;
  const description = data?.description || fallback.paragraphs.join(' ');
  const image = data?.image;
  const imageLabel = fallback.imageLabel || 'Est. 1998';
  const [imgError, setImgError] = useState(false);
  const handleError = useCallback(() => setImgError(true), []);

  return (
    <section className="relative py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <ScrollReveal delay={100}>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 to-gold/10 border border-border-light flex items-center justify-center overflow-hidden">
                {image?.url && !imgError ? (
                  <img
                    src={(import.meta.env.VITE_API_URL || '') + image.url}
                    alt={image.alt || title}
                    className="w-full h-full object-cover"
                    onError={handleError}
                  />
                ) : (
                  <div className="w-full h-full">
                    {getGalleryPlaceholderSVG('about')}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary rounded-2xl flex flex-col items-center justify-center shadow-xl shadow-primary/20">
                <span className="font-heading text-2xl font-bold text-white">{imageLabel.split(' ')[1]}</span>
                <span className="text-[10px] font-medium text-gold-light">{imageLabel.split(' ')[0]}</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary-light text-primary mb-4">
              {subtitle}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-[clamp(1.75rem,2.8vw,3rem)] font-bold text-text-dark leading-tight">
              {title}
            </h2>
            <div className="mt-6 space-y-4">
              {description.split('\n').filter(Boolean).map((p, i) => (
                <p key={i} className="text-sm sm:text-base text-text-body/85 leading-relaxed">{p}</p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
