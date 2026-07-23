import { Link } from 'react-router-dom';

export default function TeacherCard({ teacher }) {
  const t = teacher || {};
  const initial = t.name ? t.name.charAt(0) : '?';
  const subjects = Array.isArray(t.subjects) ? t.subjects : [];
  const studentCount = typeof t.students === 'number' ? t.students.toLocaleString() : (t.students || '0');

  // Contextual SVG avatar placeholder illustrations for each scholar
  const avatarSVGs = {
    Q: (
      <svg viewBox="0 0 200 240" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="q-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0B4F30"/><stop offset="100%" stopColor="#073A22"/></linearGradient>
          <linearGradient id="q-glow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2"/><stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/></linearGradient>
        </defs>
        <rect width="200" height="240" fill="url(#q-bg)" rx="0"/>
        <circle cx="100" cy="100" r="80" fill="url(#q-glow)"/>
        {/* Islamic geometric pattern */}
        <g opacity="0.08">
          <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
          <polygon points="100,35 165,65 165,135 100,165 35,135 35,65" fill="none" stroke="#C9A84C" strokeWidth="1"/>
          <circle cx="100" cy="100" r="55" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5"/>
        </g>
        {/* Turban/head */}
        <ellipse cx="100" cy="72" rx="24" ry="28" fill="#1a1a1a"/>
        <path d="M76 72 Q76 55 100 50 Q124 55 124 72" fill="#1a1a1a"/>
        <path d="M78 68 Q100 58 122 68 L122 72 Q100 64 78 72Z" fill="#C9A84C" opacity="0.8"/>
        {/* Face */}
        <ellipse cx="100" cy="90" rx="20" ry="22" fill="#D4A574"/>
        {/* Beard */}
        <path d="M84 98 Q88 130 100 135 Q112 130 116 98" fill="#1a1a1a" opacity="0.7"/>
        {/* Eyes */}
        <circle cx="93" cy="88" r="2.5" fill="#1a1a1a"/>
        <circle cx="107" cy="88" r="2.5" fill="#1a1a1a"/>
        {/* Smile */}
        <path d="M93 98 Q100 104 107 98" fill="none" stroke="#8B6F47" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Body/shoulders */}
        <path d="M72 108 Q60 130 55 160 Q55 180 50 240 L150 240 Q145 180 145 160 Q140 130 128 108" fill="#0B4F30"/>
        {/* Collar */}
        <path d="M92 108 L100 120 L108 108" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
        {/* Book in hands */}
        <rect x="88" y="155" width="24" height="32" rx="2" fill="#C9A84C" opacity="0.7"/>
        <rect x="86" y="155" width="24" height="32" rx="2" fill="none" stroke="#C9A84C" strokeWidth="0.8"/>
        <line x1="91" y1="162" x2="103" y2="162" stroke="#0B4F30" strokeWidth="1.5" opacity="0.5"/>
        <line x1="91" y1="167" x2="105" y2="167" stroke="#0B4F30" strokeWidth="1.5" opacity="0.5"/>
        <line x1="91" y1="172" x2="100" y2="172" stroke="#0B4F30" strokeWidth="1.5" opacity="0.5"/>
        {/* Name initial badge */}
        <circle cx="160" cy="40" r="18" fill="#C9A84C"/>
        <text x="160" y="46" textAnchor="middle" fill="#0B4F30" fontWeight="bold" fontSize="18" fontFamily="Playfair Display, serif">Q</text>
      </svg>
    ),
    D: (
      <svg viewBox="0 0 200 240" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="d-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0B4F30"/><stop offset="100%" stopColor="#073A22"/></linearGradient>
          <radialGradient id="d-glow" cx="0.5" cy="0.4" r="0.6"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15"/><stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="200" height="240" fill="url(#d-bg)" rx="0"/>
        <circle cx="100" cy="100" r="70" fill="url(#d-glow)"/>
        {/* Geometric arch */}
        <g opacity="0.06">
          <path d="M20 240 L20 100 Q100 0 180 100 L180 240" fill="none" stroke="#C9A84C" strokeWidth="2"/>
          <path d="M40 240 L40 115 Q100 30 160 115 L160 240" fill="none" stroke="#C9A84C" strokeWidth="1"/>
        </g>
        {/* Scholar cap */}
        <rect x="80" y="58" width="40" height="8" rx="2" fill="#1a1a1a"/>
        <rect x="85" y="50" width="30" height="10" rx="3" fill="#C9A84C"/>
        <path d="M88 50 L100 40 L112 50" fill="#C9A84C"/>
        {/* Face */}
        <ellipse cx="100" cy="88" rx="22" ry="24" fill="#C68B5C"/>
        {/* Glasses */}
        <circle cx="92" cy="88" r="7" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
        <circle cx="108" cy="88" r="7" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
        <line x1="99" y1="88" x2="101" y2="88" stroke="#1a1a1a" strokeWidth="1.2"/>
        {/* Eyes */}
        <circle cx="92" cy="88" r="2" fill="#1a1a1a"/>
        <circle cx="108" cy="88" r="2" fill="#1a1a1a"/>
        {/* Beard */}
        <path d="M84 98 Q88 132 100 137 Q112 132 116 98" fill="#555" opacity="0.6"/>
        {/* Body with robe */}
        <path d="M70 108 Q58 132 55 165 L55 240 L145 240 L145 165 Q142 132 130 108" fill="#0B4F30"/>
        <path d="M90 108 L100 122 L110 108" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
        {/* Scroll/paper */}
        <rect x="80" y="160" width="40" height="28" rx="3" fill="#F5EDD6" opacity="0.8"/>
        <line x1="87" y1="170" x2="113" y2="170" stroke="#0B4F30" strokeWidth="1" opacity="0.4"/>
        <line x1="87" y1="176" x2="110" y2="176" stroke="#0B4F30" strokeWidth="1" opacity="0.4"/>
        <line x1="87" y1="182" x2="108" y2="182" stroke="#0B4F30" strokeWidth="1" opacity="0.4"/>
        {/* Name initial badge */}
        <circle cx="160" cy="40" r="18" fill="#C9A84C"/>
        <text x="160" y="46" textAnchor="middle" fill="#0B4F30" fontWeight="bold" fontSize="18" fontFamily="Playfair Display, serif">D</text>
      </svg>
    ),
    H: (
      <svg viewBox="0 0 200 240" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="h-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0B4F30"/><stop offset="100%" stopColor="#073A22"/></linearGradient>
          <radialGradient id="h-glow" cx="0.5" cy="0.4" r="0.6"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.12"/><stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="200" height="240" fill="url(#h-bg)" rx="0"/>
        <circle cx="100" cy="100" r="70" fill="url(#h-glow)"/>
        {/* Star pattern */}
        <g opacity="0.07">
          <polygon points="100,30 115,65 150,70 125,95 130,130 100,110 70,130 75,95 50,70 85,65" fill="none" stroke="#C9A84C" strokeWidth="1"/>
        </g>
        {/* Turban */}
        <ellipse cx="100" cy="70" rx="28" ry="22" fill="#1a1a1a"/>
        <path d="M72 70 Q72 52 100 48 Q128 52 128 70" fill="#1a1a1a"/>
        <path d="M74 66 Q100 56 126 66" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity="0.6"/>
        {/* Face */}
        <ellipse cx="100" cy="90" rx="22" ry="24" fill="#D4A574"/>
        {/* Eyes */}
        <circle cx="92" cy="88" r="2.5" fill="#1a1a1a"/>
        <circle cx="108" cy="88" r="2.5" fill="#1a1a1a"/>
        {/* Smile */}
        <path d="M93 99 Q100 106 107 99" fill="none" stroke="#8B6F47" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Beard */}
        <path d="M82 98 Q88 136 100 140 Q112 136 118 98" fill="#1a1a1a" opacity="0.8"/>
        {/* Body */}
        <path d="M70 108 Q55 130 52 165 L52 240 L148 240 L148 165 Q145 130 130 108" fill="#0B4F30"/>
        <path d="M92 108 L100 122 L108 108" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
        {/* Quran in hands - open book */}
        <path d="M82 155 L100 148 L118 155 L118 180 L100 188 L82 180Z" fill="#C9A84C" opacity="0.6"/>
        <path d="M92 152 L96 148 L104 148 L108 152" fill="#F5EDD6" opacity="0.5"/>
        <line x1="100" y1="148" x2="100" y2="188" stroke="#C9A84C" strokeWidth="0.8" opacity="0.4"/>
        {/* Name initial badge */}
        <circle cx="160" cy="40" r="18" fill="#C9A84C"/>
        <text x="160" y="46" textAnchor="middle" fill="#0B4F30" fontWeight="bold" fontSize="18" fontFamily="Playfair Display, serif">H</text>
      </svg>
    ),
    U: (
      <svg viewBox="0 0 200 240" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="u-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0B4F30"/><stop offset="100%" stopColor="#073A22"/></linearGradient>
          <radialGradient id="u-glow" cx="0.5" cy="0.4" r="0.6"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.14"/><stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="200" height="240" fill="url(#u-bg)" rx="0"/>
        <circle cx="100" cy="100" r="70" fill="url(#u-glow)"/>
        {/* Bookshelf pattern */}
        <g opacity="0.06">
          <rect x="30" y="60" width="140" height="4" rx="2" fill="#C9A84C"/>
          <rect x="30" y="100" width="140" height="4" rx="2" fill="#C9A84C"/>
          <rect x="30" y="140" width="140" height="4" rx="2" fill="#C9A84C"/>
          <rect x="40" y="40" width="8" height="20" fill="#C9A84C" opacity="0.5"/>
          <rect x="55" y="50" width="6" height="10" fill="#C9A84C" opacity="0.3"/>
          <rect x="130" y="80" width="8" height="20" fill="#C9A84C" opacity="0.5"/>
          <rect x="145" y="85" width="6" height="15" fill="#C9A84C" opacity="0.3"/>
        </g>
        {/* Cap */}
        <rect x="82" y="56" width="36" height="6" rx="2" fill="#1a1a1a"/>
        <rect x="86" y="48" width="28" height="10" rx="4" fill="#1a1a1a"/>
        <rect x="86" y="48" width="28" height="10" rx="4" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.5"/>
        {/* Face */}
        <ellipse cx="100" cy="88" rx="20" ry="22" fill="#C68B5C"/>
        {/* Eyes */}
        <circle cx="93" cy="87" r="2" fill="#1a1a1a"/>
        <circle cx="107" cy="87" r="2" fill="#1a1a1a"/>
        {/* Smile */}
        <path d="M94 97 Q100 102 106 97" fill="none" stroke="#8B6F47" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Body */}
        <path d="M72 108 Q60 130 56 165 L56 240 L144 240 L144 165 Q140 130 128 108" fill="#0B4F30"/>
        <path d="M90 108 L100 120 L110 108" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
        {/* Pen and board */}
        <rect x="85" y="155" width="30" height="22" rx="2" fill="#F5EDD6" opacity="0.7"/>
        <line x1="92" y1="164" x2="108" y2="164" stroke="#0B4F30" strokeWidth="1" opacity="0.5"/>
        <line x1="92" y1="170" x2="105" y2="170" stroke="#0B4F30" strokeWidth="1" opacity="0.5"/>
        {/* Name initial badge */}
        <circle cx="160" cy="40" r="18" fill="#C9A84C"/>
        <text x="160" y="46" textAnchor="middle" fill="#0B4F30" fontWeight="bold" fontSize="18" fontFamily="Playfair Display, serif">A</text>
      </svg>
    ),
  };

  const getAvatarSVG = (name) => {
    if (!name) return null;
    const firstLetter = name.charAt(0);
    // Determine which SVG to use based on name/title
    // Keyed by title prefix ('Q' for Qari, 'D' for Dr, 'H' for Hafiz, 'U' for Ustadh)
    // Each SVG's badge shows the teacher's actual initial letter
    if (firstLetter === 'Q' || name.includes('Qari')) return avatarSVGs.Q;
    if (firstLetter === 'D' || name.includes('Dr')) return avatarSVGs.D;
    if (firstLetter === 'H' || name.includes('Hafiz')) return avatarSVGs.H;
    if (name.includes('Ustadh') || name.includes('Ahmed')) return avatarSVGs.U; // badge shows 'A' for Ahmed
    // Fallback: return based on first letter
    return avatarSVGs[firstLetter] || avatarSVGs.Q;
  };

  const avatarSVG = getAvatarSVG(t.name);

  return (
    <article
      className="group relative bg-white rounded-2xl border border-border-light overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(11,79,48,0.1)] hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        {avatarSVG ? (
          <div className="w-full h-full">
            {avatarSVG}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
              <span className="font-heading text-3xl font-bold text-white">{initial}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 lg:p-7">
        <h3 className="font-heading text-xl font-bold text-text-dark group-hover:text-primary transition-colors duration-300">
          {t.name || 'Teacher'}
        </h3>
        <p className="text-sm text-gold font-medium mt-0.5">{t.title || 'Islamic Scholar'}</p>

        <p className="text-xs text-text-light mt-2">{t.qualification || ''}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-text-light">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a6 6 0 00-6 6c0 3.5 3 5.5 6 9 3-3.5 6-5.5 6-9a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {t.experience || ''}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 14c.5 1.5 1.5 2 3 2s2.5-.5 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {studentCount} students
          </span>
        </div>

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <span
                key={subject}
                className="px-2.5 py-1 text-xs font-medium bg-primary-light text-primary rounded-lg"
              >
                {subject}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {t.rating != null && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="13" height="13" viewBox="0 0 14 14" fill={star <= Math.round(t.rating) ? '#C9A84C' : '#E8EDEA'} xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.5l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1z" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-medium text-text-light">{t.rating}</span>
          </div>
        )}

        {/* View Profile */}
        <div className="mt-5 pt-4 border-t border-border-light">
          <Link
            to="/teachers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors duration-300"
          >
            View Profile
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}