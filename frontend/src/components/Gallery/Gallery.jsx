import { Link } from 'react-router-dom';
import homeData from '../../data/homeData';
import SectionTitle from '../common/SectionTitle';
import ScrollReveal from '../common/ScrollReveal';
import { useNavigate } from 'react-router-dom';

// Contextual SVG scene illustrations for gallery placeholder images
const galleryIllustrations = {
  'Online Quran Class': (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0B4F30" />
      <rect width="400" height="300" fill="url(#g-green)" />
      <defs>
        <radialGradient id="g-green" cx="0.5" cy="0.5" r="0.7"><stop offset="0%" stopColor="#0B4F30" stopOpacity="0.5"/><stop offset="100%" stopColor="#073A22" stopOpacity="0.8"/></radialGradient>
        <linearGradient id="g-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
      </defs>
      {/* Islamic arch */}
      <path d="M100 50 Q200 10 300 50 L280 280 L120 280 Z" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/>
      <path d="M120 70 Q200 35 280 70 L265 270 L135 270 Z" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.1"/>
      {/* Laptop */}
      <rect x="140" y="90" width="120" height="85" rx="4" fill="#1a1a1a" opacity="0.8"/>
      <rect x="145" y="95" width="110" height="75" rx="2" fill="#C9A84C" opacity="0.3"/>
      <rect x="148" y="98" width="104" height="69" rx="1" fill="#F5EDD6" opacity="0.15"/>
      {/* Screen content - lines */}
      <line x1="160" y1="110" x2="240" y2="110" stroke="#0B4F30" strokeWidth="1.5" opacity="0.3"/>
      <line x1="160" y1="120" x2="235" y2="120" stroke="#0B4F30" strokeWidth="1.5" opacity="0.2"/>
      <line x1="160" y1="130" x2="230" y2="130" stroke="#0B4F30" strokeWidth="1.5" opacity="0.2"/>
      {/* Camera */}
      <circle cx="200" cy="87" r="2" fill="#C9A84C" opacity="0.5"/>
      {/* Book next to laptop */}
      <rect x="90" y="110" width="30" height="40" rx="2" fill="#C9A84C" opacity="0.4"/>
      {/* Lamp */}
      <line x1="310" y1="100" x2="310" y2="180" stroke="#C9A84C" strokeWidth="1" opacity="0.3"/>
      <path d="M300 100 Q310 90 320 100" fill="#C9A84C" opacity="0.3"/>
      {/* Geometric pattern */}
      <g opacity="0.04">
        <polygon points="40,40 60,20 80,40 60,60" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
        <polygon points="320,40 340,20 360,40 340,60" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
      </g>
      <rect width="400" height="300" fill="url(#g-overlay)"/>
    </svg>
  ),
  'Graduation Ceremony': (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0B4F30" />
      <defs>
        <radialGradient id="g-grad" cx="0.5" cy="0.3" r="0.6"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.9"/></radialGradient>
        <linearGradient id="g-overlay2" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#g-grad)"/>
      {/* Stage */}
      <rect x="50" y="180" width="300" height="60" rx="3" fill="#C9A84C" opacity="0.15"/>
      <rect x="60" y="185" width="280" height="50" rx="2" fill="#C9A84C" opacity="0.1"/>
      {/* Graduation caps */}
      <g opacity="0.7">
        <rect x="150" y="70" width="24" height="5" rx="1" fill="#1a1a1a"/>
        <rect x="154" y="62" width="16" height="10" rx="2" fill="#C9A84C"/>
        <path d="M156 62 L162 52 L168 62" fill="#C9A84C"/>
        <line x1="170" y1="70" x2="170" y2="80" stroke="#C9A84C" strokeWidth="1"/>
        <circle cx="170" cy="82" r="2" fill="#C9A84C"/>
      </g>
      <g opacity="0.6">
        <rect x="200" y="80" width="24" height="5" rx="1" fill="#1a1a1a"/>
        <rect x="204" y="72" width="16" height="10" rx="2" fill="#C9A84C"/>
        <path d="M206 72 L212 62 L218 72" fill="#C9A84C"/>
        <line x1="220" y1="80" x2="220" y2="90" stroke="#C9A84C" strokeWidth="1"/>
        <circle cx="220" cy="92" r="2" fill="#C9A84C"/>
      </g>
      <g opacity="0.5">
        <rect x="240" y="65" width="24" height="5" rx="1" fill="#1a1a1a"/>
        <rect x="244" y="57" width="16" height="10" rx="2" fill="#C9A84C"/>
        <path d="M246 57 L252 47 L258 57" fill="#C9A84C"/>
        <line x1="260" y1="65" x2="260" y2="75" stroke="#C9A84C" strokeWidth="1"/>
        <circle cx="260" cy="77" r="2" fill="#C9A84C"/>
      </g>
      {/* People silhouettes on stage */}
      <circle cx="160" cy="170" r="10" fill="#1a1a1a" opacity="0.5"/>
      <rect x="152" y="178" width="16" height="15" rx="3" fill="#1a1a1a" opacity="0.5"/>
      <circle cx="200" cy="165" r="12" fill="#1a1a1a" opacity="0.5"/>
      <rect x="190" y="175" width="20" height="18" rx="3" fill="#1a1a1a" opacity="0.5"/>
      <circle cx="240" cy="170" r="10" fill="#1a1a1a" opacity="0.5"/>
      <rect x="232" y="178" width="16" height="15" rx="3" fill="#1a1a1a" opacity="0.5"/>
      {/* Arch */}
      <path d="M80 180 Q200 40 320 180" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.1"/>
      <rect width="400" height="300" fill="url(#g-overlay2)"/>
    </svg>
  ),
  'Student Workshop': (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0B4F30" />
      <defs>
        <radialGradient id="g-workshop" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15"/><stop offset="100%" stopColor="#073A22" stopOpacity="0.9"/></radialGradient>
        <linearGradient id="g-overlay3" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#g-workshop)"/>
      {/* Table */}
      <rect x="60" y="170" width="280" height="8" rx="2" fill="#C9A84C" opacity="0.2"/>
      {/* People around table */}
      <circle cx="100" cy="150" r="12" fill="#1a1a1a" opacity="0.4"/>
      <rect x="92" y="160" width="16" height="20" rx="2" fill="#1a1a1a" opacity="0.4"/>
      <circle cx="200" cy="140" r="14" fill="#1a1a1a" opacity="0.5"/>
      <rect x="190" y="152" width="20" height="25" rx="2" fill="#1a1a1a" opacity="0.5"/>
      <circle cx="300" cy="150" r="12" fill="#1a1a1a" opacity="0.4"/>
      <rect x="292" y="160" width="16" height="20" rx="2" fill="#1a1a1a" opacity="0.4"/>
      {/* Screen/projector */}
      <rect x="130" y="80" width="140" height="80" rx="3" fill="#F5EDD6" opacity="0.1"/>
      <rect x="135" y="85" width="130" height="70" rx="2" fill="#F5EDD6" opacity="0.05"/>
      {/* Content on screen */}
      <circle cx="200" cy="105" r="8" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
      <line x1="160" y1="130" x2="240" y2="130" stroke="#C9A84C" strokeWidth="0.5" opacity="0.2"/>
      <line x1="160" y1="138" x2="230" y2="138" stroke="#C9A84C" strokeWidth="0.5" opacity="0.2"/>
      {/* Books on table */}
      <rect x="180" y="160" width="40" height="12" rx="1" fill="#C9A84C" opacity="0.15"/>
      <rect x="260" y="162" width="30" height="10" rx="1" fill="#C9A84C" opacity="0.12"/>
      {/* Geometric circles */}
      <circle cx="60" cy="60" r="25" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.06"/>
      <circle cx="340" cy="70" r="20" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.06"/>
      <rect width="400" height="300" fill="url(#g-overlay3)"/>
    </svg>
  ),
  'Teacher Training': (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0B4F30" />
      <defs>
        <radialGradient id="g-training" cx="0.5" cy="0.35" r="0.7"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.12"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
        <linearGradient id="g-overlay4" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#g-training)"/>
      {/* Whiteboard */}
      <rect x="80" y="60" width="240" height="160" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="85" y="65" width="230" height="150" rx="3" fill="rgba(255,255,255,0.04)"/>
      {/* Whiteboard content - Islamic star */}
      <g opacity="0.15">
        <polygon points="200,90 215,115 240,120 220,140 225,165 200,152 175,165 180,140 160,120 185,115" fill="none" stroke="#C9A84C" strokeWidth="0.8"/>
        <circle cx="200" cy="128" r="20" fill="none" stroke="#C9A84C" strokeWidth="0.3"/>
      </g>
      {/* Writing lines */}
      <line x1="120" y1="150" x2="250" y2="150" stroke="#C9A84C" strokeWidth="0.5" opacity="0.1"/>
      <line x1="120" y1="162" x2="230" y2="162" stroke="#C9A84C" strokeWidth="0.5" opacity="0.1"/>
      {/* Marker pen */}
      <line x1="260" y1="85" x2="275" y2="78" stroke="#C9A84C" strokeWidth="1.5" opacity="0.3"/>
      <circle cx="277" cy="77" r="2" fill="#C9A84C" opacity="0.3"/>
      {/* Podium */}
      <rect x="170" y="225" width="60" height="8" rx="2" fill="#C9A84C" opacity="0.1"/>
      <rect x="185" y="230" width="30" height="20" rx="1" fill="#C9A84C" opacity="0.08"/>
      {/* Pattern */}
      <g opacity="0.04">
        <path d="M50 250 L50 200 Q100 160 150 200 L150 250" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
        <path d="M250 250 L250 200 Q300 160 350 200 L350 250" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
      </g>
      <rect width="400" height="300" fill="url(#g-overlay4)"/>
    </svg>
  ),
  'Islamic Library': (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0B4F30" />
      <defs>
        <radialGradient id="g-library" cx="0.5" cy="0.5" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.1"/><stop offset="100%" stopColor="#073A22" stopOpacity="0.9"/></radialGradient>
        <linearGradient id="g-overlay5" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#g-library)"/>
      {/* Bookshelves */}
      <rect x="40" y="50" width="120" height="180" rx="3" fill="#C9A84C" opacity="0.08"/>
      <rect x="60" y="60" width="8" height="160" rx="1" fill="#C9A84C" opacity="0.05"/>
      <rect x="130" y="60" width="8" height="160" rx="1" fill="#C9A84C" opacity="0.05"/>
      {/* Shelf lines */}
      <line x1="50" y1="90" x2="150" y2="90" stroke="#C9A84C" strokeWidth="1" opacity="0.06"/>
      <line x1="50" y1="140" x2="150" y2="140" stroke="#C9A84C" strokeWidth="1" opacity="0.06"/>
      <line x1="50" y1="190" x2="150" y2="190" stroke="#C9A84C" strokeWidth="1" opacity="0.06"/>
      {/* Books */}
      <rect x="72" y="70" width="10" height="20" rx="1" fill="#C9A84C" opacity="0.15"/>
      <rect x="85" y="65" width="8" height="25" rx="1" fill="#C9A84C" opacity="0.12"/>
      <rect x="96" y="72" width="12" height="18" rx="1" fill="#C9A84C" opacity="0.18"/>
      <rect x="110" y="68" width="10" height="22" rx="1" fill="#C9A84C" opacity="0.1"/>
      <rect x="72" y="105" width="12" height="30" rx="1" fill="#C9A84C" opacity="0.2"/>
      <rect x="88" y="110" width="10" height="25" rx="1" fill="#C9A84C" opacity="0.15"/>
      <rect x="100" y="108" width="14" height="27" rx="1" fill="#C9A84C" opacity="0.18"/>
      <rect x="72" y="150" width="10" height="35" rx="1" fill="#C9A84C" opacity="0.15"/>
      <rect x="86" y="155" width="12" height="30" rx="1" fill="#C9A84C" opacity="0.2"/>
      <rect x="102" y="152" width="8" height="33" rx="1" fill="#C9A84C" opacity="0.1"/>
      {/* Right bookshelf */}
      <rect x="240" y="50" width="120" height="180" rx="3" fill="#C9A84C" opacity="0.08"/>
      <rect x="260" y="60" width="8" height="160" rx="1" fill="#C9A84C" opacity="0.05"/>
      <rect x="330" y="60" width="8" height="160" rx="1" fill="#C9A84C" opacity="0.05"/>
      <line x1="250" y1="90" x2="350" y2="90" stroke="#C9A84C" strokeWidth="1" opacity="0.06"/>
      <line x1="250" y1="140" x2="350" y2="140" stroke="#C9A84C" strokeWidth="1" opacity="0.06"/>
      <line x1="250" y1="190" x2="350" y2="190" stroke="#C9A84C" strokeWidth="1" opacity="0.06"/>
      {/* Right books */}
      <rect x="272" y="70" width="12" height="20" rx="1" fill="#C9A84C" opacity="0.15"/>
      <rect x="288" y="65" width="10" height="25" rx="1" fill="#C9A84C" opacity="0.12"/>
      <rect x="302" y="72" width="8" height="18" rx="1" fill="#C9A84C" opacity="0.18"/>
      <rect x="272" y="105" width="14" height="30" rx="1" fill="#C9A84C" opacity="0.2"/>
      <rect x="290" y="110" width="10" height="25" rx="1" fill="#C9A84C" opacity="0.15"/>
      <rect x="272" y="150" width="12" height="35" rx="1" fill="#C9A84C" opacity="0.15"/>
      <rect x="288" y="155" width="10" height="30" rx="1" fill="#C9A84C" opacity="0.2"/>
      {/* Arch */}
      <path d="M160 220 Q200 180 240 220" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
      {/* Lamp */}
      <line x1="200" y1="40" x2="200" y2="50" stroke="#C9A84C" strokeWidth="1" opacity="0.15"/>
      <path d="M192 40 Q200 30 208 40" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.15"/>
      <rect width="400" height="300" fill="url(#g-overlay5)"/>
    </svg>
  ),
  'International Students': (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0B4F30" />
      <defs>
        <radialGradient id="g-international" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.13"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.9"/></radialGradient>
        <linearGradient id="g-overlay6" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#g-international)"/>
      {/* Globe */}
      <circle cx="200" cy="120" r="60" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/>
      <circle cx="200" cy="120" r="60" fill="none" stroke="#C9A84C" strokeWidth="0.2" opacity="0.08"/>
      {/* Continents */}
      <ellipse cx="180" cy="105" rx="15" ry="10" fill="#C9A84C" opacity="0.08"/>
      <ellipse cx="210" cy="130" rx="12" ry="8" fill="#C9A84C" opacity="0.06"/>
      <ellipse cx="175" cy="130" rx="8" ry="12" fill="#C9A84C" opacity="0.07"/>
      {/* Latitude/longitude */}
      <ellipse cx="200" cy="120" rx="60" ry="20" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.1"/>
      <line x1="140" y1="120" x2="260" y2="120" stroke="#C9A84C" strokeWidth="0.3" opacity="0.1"/>
      <line x1="200" y1="60" x2="200" y2="180" stroke="#C9A84C" strokeWidth="0.3" opacity="0.1"/>
      {/* People around globe */}
      <circle cx="120" cy="190" r="10" fill="#1a1a1a" opacity="0.4"/>
      <rect x="114" y="198" width="12" height="15" rx="2" fill="#1a1a1a" opacity="0.4"/>
      <circle cx="280" cy="190" r="10" fill="#1a1a1a" opacity="0.4"/>
      <rect x="274" y="198" width="12" height="15" rx="2" fill="#1a1a1a" opacity="0.4"/>
      <circle cx="160" cy="200" r="8" fill="#1a1a1a" opacity="0.3"/>
      <rect x="155" y="206" width="10" height="12" rx="2" fill="#1a1a1a" opacity="0.3"/>
      <circle cx="240" cy="200" r="8" fill="#1a1a1a" opacity="0.3"/>
      <rect x="235" y="206" width="10" height="12" rx="2" fill="#1a1a1a" opacity="0.3"/>
      {/* Connection lines */}
      <line x1="140" y1="160" x2="120" y2="190" stroke="#C9A84C" strokeWidth="0.3" opacity="0.08"/>
      <line x1="260" y1="160" x2="280" y2="190" stroke="#C9A84C" strokeWidth="0.3" opacity="0.08"/>
      {/* Stars */}
      <circle cx="80" cy="50" r="1" fill="#C9A84C" opacity="0.2"/>
      <circle cx="320" cy="40" r="1.5" fill="#C9A84C" opacity="0.15"/>
      <circle cx="350" cy="80" r="1" fill="#C9A84C" opacity="0.2"/>
      <circle cx="55" cy="100" r="1" fill="#C9A84C" opacity="0.15"/>
      <rect width="400" height="300" fill="url(#g-overlay6)"/>
    </svg>
  ),
};

const categoryLabels = {
  Classes: 'CLASSES',
  Events: 'EVENTS',
  Academy: 'ACADEMY',
  Community: 'COMMUNITY',
};

export default function Gallery() {
  const navigate = useNavigate();
  const { gallery } = homeData;

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
            <ScrollReveal key={item.id} delay={i * 100}>
              <div className="group relative rounded-2xl overflow-hidden cursor-pointer" onClick={() => navigate('/gallery')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/gallery'); } }}>
              <div className="aspect-[4/3] relative overflow-hidden">
                {/* Contextual SVG illustration */}
                <div className="absolute inset-0">
                  {galleryIllustrations[item.title] || (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Consistent gradient overlay at bottom for ALL cards */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-400" />

                {/* Hover overlay with title */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 text-center transform scale-95 group-hover:scale-100 transition-transform duration-400">
                    <svg className="w-8 h-8 text-primary mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-sm font-semibold text-primary">View Photo</span>
                  </div>
                </div>
              </div>

              {/* Caption at bottom - always visible */}
              <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 z-10">
                <h3 className="text-white font-heading font-bold text-lg drop-shadow-sm">{item.title}</h3>
                <span className="text-xs text-white/80 font-medium uppercase tracking-wider drop-shadow-sm">
                  {categoryLabels[item.category] || item.category}
                </span>
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
          >
            View Full Gallery
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}