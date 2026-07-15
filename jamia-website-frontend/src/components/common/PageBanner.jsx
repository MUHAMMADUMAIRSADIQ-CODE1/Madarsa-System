export default function PageBanner({ title, description, breadcrumbs }) {
  return (
    <section className="relative pt-28 lg:pt-32 pb-14 lg:pb-16 bg-gradient-to-br from-accent-soft via-white to-accent-soft/60 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="banner-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <polygon points="60,0 120,60 60,120 0,60" fill="none" stroke="#0B4F30" strokeWidth="0.5" />
              <polygon points="60,15 105,60 60,105 15,60" fill="none" stroke="#C9A84C" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#banner-pattern)" />
        </svg>
      </div>
      <div className="absolute top-1/4 right-[10%] w-24 h-24 border border-gold/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-[5%] w-16 h-16 border border-gold/10 rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        {breadcrumbs && (
          <nav className="flex items-center justify-center gap-2 text-sm text-text-light mb-5" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gold">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</a>
                ) : (
                  <span className="text-text-body font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-[clamp(2rem,3.5vw,4rem)] font-bold text-text-dark leading-tight max-w-4xl mx-auto">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base sm:text-lg text-text-body/80 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}