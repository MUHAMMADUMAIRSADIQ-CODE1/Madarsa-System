import image from '../../../public/ChatGPT Image Jul 14, 2026, 11_19_04 AM.png'

function getImageUrl(src) {
  if (!src) return image;
  if (src.startsWith('http')) return src;
  const API_BASE = import.meta.env.VITE_API_URL || '';
  return `${API_BASE}${src}`;
}

export default function PremiumIllustration({ src, alt }) {
  return (
    <img
      src={getImageUrl(src)}
      alt={alt || 'Premium Illustration'}
      className="w-full h-auto max-h-[40vh] sm:max-h-[48vh] lg:max-h-[52vh] xl:max-h-[55vh] object-cover rounded-2xl"
      loading="lazy"
      decoding="async"
    />
  );
}
