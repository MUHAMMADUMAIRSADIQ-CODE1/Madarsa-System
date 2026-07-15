import aboutData from '../../data/aboutData';

export default function AboutIntro({ data }) {
  const fallback = aboutData.intro;
  const title = data?.title || fallback.title;
  const subtitle = data?.subtitle || fallback.subtitle;
  const description = data?.description || fallback.paragraphs.join(' ');
  const image = data?.image;
  const imageLabel = fallback.imageLabel || 'Est. 1998';

  return (
    <section className="relative py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="animate-fade-in-up stagger-1">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 to-gold/10 border border-border-light flex items-center justify-center overflow-hidden">
                {image?.url ? (
                  <img
                    src={(import.meta.env.VITE_API_URL || '') + image.url}
                    alt={image.alt || title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjQwLDAgODAsNDAgNDAsODAgMCw0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEI0RjMwIiBzdHJva2Utd2lkdGg9IjAuMyIvPjwvc3ZnPg==')] opacity-20" />
                    <div className="relative text-center">
                      <svg className="w-16 h-16 mx-auto text-primary/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                      </svg>
                      <p className="mt-3 text-sm text-text-light">Jamia Tul Uloom Campus</p>
                    </div>
                  </>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary rounded-2xl flex flex-col items-center justify-center shadow-xl shadow-primary/20">
                <span className="font-heading text-2xl font-bold text-white">{imageLabel.split(' ')[1]}</span>
                <span className="text-[10px] font-medium text-gold-light">{imageLabel.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up stagger-2">
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
          </div>
        </div>
      </div>
    </section>
  );
}
