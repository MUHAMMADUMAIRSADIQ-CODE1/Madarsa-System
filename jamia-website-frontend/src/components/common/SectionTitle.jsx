export default function SectionTitle({ subtitle, title, description, light = false }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
      {subtitle && (
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${
          light
            ? 'bg-white/10 text-gold-light'
            : 'bg-primary-light text-primary'
        }`}>
          {subtitle}
        </span>
      )}
      <h2 className={`font-heading text-3xl sm:text-4xl lg:text-[clamp(1.75rem,2.8vw,3rem)] font-bold leading-tight ${
        light ? 'text-white' : 'text-text-dark'
      }`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-base sm:text-lg leading-relaxed max-w-xl mx-auto ${
          light ? 'text-gold-light/80' : 'text-text-body/80'
        }`}>
          {description}
        </p>
      )}
    </div>
  );
}