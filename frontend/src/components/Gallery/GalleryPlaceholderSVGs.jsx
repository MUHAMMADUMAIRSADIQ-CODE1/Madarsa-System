// Contextual SVG scene illustrations for placeholder fallback images across the entire site
// Uses ONLY the site's existing color palette: #0B4F30 (primary/dark green), #C9A84C (gold), #F5EDD6 (light), #073A22 (darker green)
// Each SVG is: 400x300 viewBox, w-full h-full, with gradient overlay at bottom

// ==================== GALLERY SVGs ====================

const ClassroomSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cr-bg" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
      <linearGradient id="cr-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#cr-bg)"/>
    <rect x="60" y="50" width="160" height="110" rx="4" fill="rgba(255,255,255,0.08)"/><rect x="65" y="55" width="150" height="100" rx="3" fill="rgba(255,255,255,0.04)"/>
    <line x1="90" y1="85" x2="170" y2="85" stroke="#C9A84C" strokeWidth="0.8" opacity="0.15"/><line x1="90" y1="100" x2="160" y2="100" stroke="#C9A84C" strokeWidth="0.8" opacity="0.12"/><line x1="90" y1="115" x2="150" y2="115" stroke="#C9A84C" strokeWidth="0.8" opacity="0.1"/>
    <rect x="250" y="120" width="80" height="8" rx="2" fill="#C9A84C" opacity="0.12"/><rect x="270" y="160" width="80" height="8" rx="2" fill="#C9A84C" opacity="0.12"/><rect x="250" y="200" width="80" height="8" rx="2" fill="#C9A84C" opacity="0.12"/>
    <circle cx="270" cy="110" r="8" fill="#1a1a1a" opacity="0.3"/><rect x="265" y="116" width="10" height="12" rx="2" fill="#1a1a1a" opacity="0.3"/>
    <circle cx="310" cy="150" r="8" fill="#1a1a1a" opacity="0.3"/><rect x="305" y="156" width="10" height="12" rx="2" fill="#1a1a1a" opacity="0.3"/>
    <circle cx="270" cy="190" r="8" fill="#1a1a1a" opacity="0.3"/><rect x="265" y="196" width="10" height="12" rx="2" fill="#1a1a1a" opacity="0.3"/>
    <rect x="360" y="80" width="8" height="30" rx="1" fill="#C9A84C" opacity="0.1"/><rect x="350" y="85" width="8" height="25" rx="1" fill="#C9A84C" opacity="0.08"/>
    <circle cx="60" cy="45" r="12" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/><line x1="60" y1="45" x2="60" y2="38" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/><line x1="60" y1="45" x2="65" y2="45" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/>
    <g opacity="0.04"><polygon points="20,20 30,5 40,20 30,35" fill="none" stroke="#C9A84C" strokeWidth="0.5"/><polygon points="340,250 350,235 360,250 350,265" fill="none" stroke="#C9A84C" strokeWidth="0.5"/></g>
    <rect width="400" height="300" fill="url(#cr-overlay)"/>
  </svg>
);

const CampusSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ca-bg" cx="0.5" cy="0.35" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.12"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="ca-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#ca-bg)"/>
    <rect x="100" y="80" width="200" height="160" rx="4" fill="#C9A84C" opacity="0.08"/><rect x="110" y="90" width="180" height="140" rx="3" fill="#C9A84C" opacity="0.05"/>
    <path d="M150 80 Q200 30 250 80" fill="#C9A84C" opacity="0.1"/><path d="M160 80 Q200 45 240 80" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <rect x="105" y="50" width="10" height="60" rx="2" fill="#C9A84C" opacity="0.08"/><polygon points="105,50 110,35 115,50" fill="#C9A84C" opacity="0.08"/>
    <rect x="285" y="50" width="10" height="60" rx="2" fill="#C9A84C" opacity="0.08"/><polygon points="285,50 290,35 295,50" fill="#C9A84C" opacity="0.08"/>
    <rect x="130" y="110" width="20" height="25" rx="2" fill="#C9A84C" opacity="0.06"/><rect x="165" y="110" width="20" height="25" rx="2" fill="#C9A84C" opacity="0.06"/>
    <rect x="215" y="110" width="20" height="25" rx="2" fill="#C9A84C" opacity="0.06"/><rect x="250" y="110" width="20" height="25" rx="2" fill="#C9A84C" opacity="0.06"/>
    <path d="M175 240 L175 180 Q200 160 225 180 L225 240" fill="#C9A84C" opacity="0.06"/><path d="M185 240 L185 188 Q200 175 215 188 L215 240" fill="#C9A84C" opacity="0.04"/>
    <rect x="180" y="240" width="40" height="30" fill="#C9A84C" opacity="0.03"/>
    <circle cx="70" cy="200" r="25" fill="#C9A84C" opacity="0.06"/><rect x="68" y="220" width="4" height="20" fill="#C9A84C" opacity="0.04"/>
    <circle cx="340" cy="200" r="25" fill="#C9A84C" opacity="0.06"/><rect x="338" y="220" width="4" height="20" fill="#C9A84C" opacity="0.04"/>
    <ellipse cx="80" cy="40" rx="25" ry="8" fill="#C9A84C" opacity="0.04"/><ellipse cx="320" cy="50" rx="20" ry="6" fill="#C9A84C" opacity="0.04"/>
    <rect width="400" height="300" fill="url(#ca-overlay)"/>
  </svg>
);

const StudentsSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="st-bg" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.13"/><stop offset="100%" stopColor="#073A22" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="st-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#st-bg)"/>
    <circle cx="140" cy="130" r="14" fill="#1a1a1a" opacity="0.4"/><rect x="130" y="142" width="20" height="24" rx="2" fill="#1a1a1a" opacity="0.4"/>
    <circle cx="200" cy="120" r="15" fill="#1a1a1a" opacity="0.45"/><rect x="189" y="133" width="22" height="28" rx="2" fill="#1a1a1a" opacity="0.45"/>
    <circle cx="260" cy="130" r="13" fill="#1a1a1a" opacity="0.4"/><rect x="251" y="141" width="18" height="22" rx="2" fill="#1a1a1a" opacity="0.4"/>
    <circle cx="170" cy="190" r="12" fill="#1a1a1a" opacity="0.35"/><rect x="162" y="200" width="16" height="18" rx="2" fill="#1a1a1a" opacity="0.35"/>
    <circle cx="230" cy="185" r="12" fill="#1a1a1a" opacity="0.35"/><rect x="222" y="195" width="16" height="18" rx="2" fill="#1a1a1a" opacity="0.35"/>
    <rect x="120" y="195" width="160" height="6" rx="2" fill="#C9A84C" opacity="0.08"/>
    <rect x="170" y="185" width="30" height="12" rx="1" fill="#C9A84C" opacity="0.1"/><rect x="205" y="188" width="25" height="9" rx="1" fill="#C9A84C" opacity="0.08"/>
    <rect x="235" y="178" width="24" height="18" rx="2" fill="#1a1a1a" opacity="0.25"/><rect x="237" y="180" width="20" height="14" rx="1" fill="#C9A84C" opacity="0.1"/>
    <path d="M60 250 Q200 120 340 250" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.06"/>
    <circle cx="310" cy="60" r="2" fill="#C9A84C" opacity="0.15"/><line x1="310" y1="62" x2="310" y2="100" stroke="#C9A84C" strokeWidth="0.5" opacity="0.1"/>
    <rect width="400" height="300" fill="url(#st-overlay)"/>
  </svg>
);

const EventsSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ev-bg" cx="0.5" cy="0.35" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="ev-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#ev-bg)"/>
    <rect x="50" y="170" width="300" height="40" rx="3" fill="#C9A84C" opacity="0.15"/><rect x="60" y="175" width="280" height="30" rx="2" fill="#C9A84C" opacity="0.1"/>
    <rect x="170" y="155" width="60" height="18" rx="2" fill="#C9A84C" opacity="0.12"/><rect x="180" y="158" width="40" height="12" rx="1" fill="#C9A84C" opacity="0.08"/>
    <g opacity="0.3"><circle cx="100" cy="220" r="7" fill="#1a1a1a"/><circle cx="130" cy="220" r="7" fill="#1a1a1a"/><circle cx="160" cy="220" r="7" fill="#1a1a1a"/><circle cx="240" cy="220" r="7" fill="#1a1a1a"/><circle cx="270" cy="220" r="7" fill="#1a1a1a"/><circle cx="300" cy="220" r="7" fill="#1a1a1a"/><circle cx="85" cy="245" r="7" fill="#1a1a1a"/><circle cx="115" cy="245" r="7" fill="#1a1a1a"/><circle cx="145" cy="245" r="7" fill="#1a1a1a"/><circle cx="255" cy="245" r="7" fill="#1a1a1a"/><circle cx="285" cy="245" r="7" fill="#1a1a1a"/><circle cx="315" cy="245" r="7" fill="#1a1a1a"/></g>
    <rect x="130" y="60" width="140" height="50" rx="3" fill="#C9A84C" opacity="0.08"/><rect x="135" y="65" width="130" height="40" rx="2" fill="#C9A84C" opacity="0.05"/>
    <line x1="150" y1="80" x2="250" y2="80" stroke="#C9A84C" strokeWidth="0.8" opacity="0.08"/><line x1="160" y1="92" x2="240" y2="92" stroke="#C9A84C" strokeWidth="0.8" opacity="0.06"/>
    <circle cx="120" cy="50" r="4" fill="#C9A84C" opacity="0.15"/><circle cx="200" cy="40" r="4" fill="#C9A84C" opacity="0.15"/><circle cx="280" cy="50" r="4" fill="#C9A84C" opacity="0.15"/>
    <path d="M60 170 Q200 30 340 170" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <rect width="400" height="300" fill="url(#ev-overlay)"/>
  </svg>
);

const ConvocationSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="co-bg" cx="0.5" cy="0.3" r="0.6"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="co-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#co-bg)"/>
    <rect x="40" y="180" width="320" height="55" rx="3" fill="#C9A84C" opacity="0.15"/><rect x="50" y="185" width="300" height="45" rx="2" fill="#C9A84C" opacity="0.1"/>
    <g opacity="0.6"><rect x="120" y="50" width="20" height="4" rx="1" fill="#1a1a1a"/><rect x="123" y="43" width="14" height="9" rx="2" fill="#C9A84C"/><path d="M125 43 L130 34 L135 43" fill="#C9A84C"/><line x1="140" y1="50" x2="138" y2="60" stroke="#C9A84C" strokeWidth="0.8"/><circle cx="138" cy="62" r="1.5" fill="#C9A84C"/></g>
    <g opacity="0.5"><rect x="180" y="40" width="20" height="4" rx="1" fill="#1a1a1a"/><rect x="183" y="33" width="14" height="9" rx="2" fill="#C9A84C"/><path d="M185 33 L190 24 L195 33" fill="#C9A84C"/><line x1="200" y1="40" x2="198" y2="50" stroke="#C9A84C" strokeWidth="0.8"/><circle cx="198" cy="52" r="1.5" fill="#C9A84C"/></g>
    <g opacity="0.55"><rect x="230" y="55" width="20" height="4" rx="1" fill="#1a1a1a"/><rect x="233" y="48" width="14" height="9" rx="2" fill="#C9A84C"/><path d="M235 48 L240 39 L245 48" fill="#C9A84C"/><line x1="250" y1="55" x2="248" y2="65" stroke="#C9A84C" strokeWidth="0.8"/><circle cx="248" cy="67" r="1.5" fill="#C9A84C"/></g>
    <circle cx="150" cy="165" r="10" fill="#1a1a1a" opacity="0.45"/><rect x="144" y="173" width="12" height="15" rx="2" fill="#1a1a1a" opacity="0.45"/><rect x="146" y="168" width="8" height="5" rx="1" fill="#C9A84C" opacity="0.3"/>
    <circle cx="200" cy="160" r="12" fill="#1a1a1a" opacity="0.5"/><rect x="193" y="170" width="14" height="18" rx="2" fill="#1a1a1a" opacity="0.5"/><rect x="195" y="165" width="10" height="6" rx="1" fill="#C9A84C" opacity="0.3"/>
    <circle cx="250" cy="165" r="10" fill="#1a1a1a" opacity="0.45"/><rect x="244" y="173" width="12" height="15" rx="2" fill="#1a1a1a" opacity="0.45"/><rect x="246" y="168" width="8" height="5" rx="1" fill="#C9A84C" opacity="0.3"/>
    <circle cx="160" cy="90" r="2" fill="#C9A84C" opacity="0.15"/><circle cx="220" cy="80" r="2" fill="#C9A84C" opacity="0.12"/><circle cx="280" cy="95" r="2" fill="#C9A84C" opacity="0.15"/><circle cx="140" cy="110" r="1.5" fill="#C9A84C" opacity="0.1"/>
    <rect x="255" y="85" width="4" height="4" rx="1" fill="#C9A84C" opacity="0.1"/><rect x="170" y="105" width="4" height="4" rx="1" fill="#C9A84C" opacity="0.12"/>
    <rect width="400" height="300" fill="url(#co-overlay)"/>
  </svg>
);

const OnlineClassesSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="oc-bg" cx="0.5" cy="0.5" r="0.7"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.1"/><stop offset="100%" stopColor="#073A22" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="oc-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#oc-bg)"/>
    <rect x="130" y="85" width="140" height="95" rx="5" fill="#1a1a1a" opacity="0.7"/><rect x="136" y="91" width="128" height="80" rx="3" fill="#C9A84C" opacity="0.2"/><rect x="140" y="95" width="120" height="72" rx="2" fill="#F5EDD6" opacity="0.08"/>
    <circle cx="200" cy="110" r="6" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.2"/><line x1="155" y1="130" x2="230" y2="130" stroke="#C9A84C" strokeWidth="0.8" opacity="0.15"/><line x1="155" y1="140" x2="220" y2="140" stroke="#C9A84C" strokeWidth="0.8" opacity="0.12"/><line x1="155" y1="150" x2="215" y2="150" stroke="#C9A84C" strokeWidth="0.8" opacity="0.1"/>
    <circle cx="200" cy="82" r="2.5" fill="#C9A84C" opacity="0.4"/>
    <rect x="80" y="110" width="28" height="38" rx="2" fill="#C9A84C" opacity="0.3"/><rect x="290" y="105" width="26" height="35" rx="2" fill="#C9A84C" opacity="0.25"/>
    <line x1="320" y1="95" x2="320" y2="180" stroke="#C9A84C" strokeWidth="0.8" opacity="0.2"/><path d="M312 95 Q320 85 328 95" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.2"/>
    <path d="M60 180 Q200 20 340 180" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.06"/>
    <rect width="400" height="300" fill="url(#oc-overlay)"/>
  </svg>
);

const MosqueSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="mo-bg" cx="0.5" cy="0.35" r="0.6"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.12"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
      <linearGradient id="mo-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#mo-bg)"/>
    <path d="M120 180 Q200 60 280 180" fill="#C9A84C" opacity="0.08"/><path d="M130 180 Q200 75 270 180" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.06"/><path d="M150 180 Q200 95 250 180" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.05"/>
    <circle cx="200" cy="65" r="8" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.15"/><circle cx="203" cy="63" r="6" fill="#0B4F30" opacity="0.9"/>
    <rect x="115" y="50" width="12" height="80" rx="3" fill="#C9A84C" opacity="0.08"/><polygon points="115,50 121,30 127,50" fill="#C9A84C" opacity="0.08"/>
    <rect x="273" y="50" width="12" height="80" rx="3" fill="#C9A84C" opacity="0.08"/><polygon points="273,50 279,30 285,50" fill="#C9A84C" opacity="0.08"/>
    <rect x="110" y="130" width="180" height="110" rx="4" fill="#C9A84C" opacity="0.06"/><rect x="120" y="140" width="160" height="90" rx="3" fill="#C9A84C" opacity="0.04"/>
    <path d="M180 230 L180 170 Q200 150 220 170 L220 230" fill="#C9A84C" opacity="0.06"/>
    <path d="M135 155 Q140 145 145 155 L145 175 L135 175 Z" fill="#C9A84C" opacity="0.06"/><path d="M255 155 Q260 145 265 155 L265 175 L255 175 Z" fill="#C9A84C" opacity="0.06"/>
    <line x1="140" y1="210" x2="260" y2="210" stroke="#C9A84C" strokeWidth="0.5" opacity="0.04"/><line x1="140" y1="220" x2="260" y2="220" stroke="#C9A84C" strokeWidth="0.5" opacity="0.04"/>
    <rect x="0" y="240" width="400" height="60" fill="#C9A84C" opacity="0.03"/>
    <rect width="400" height="300" fill="url(#mo-overlay)"/>
  </svg>
);

const LibrarySVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="li-bg" cx="0.5" cy="0.5" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.1"/><stop offset="100%" stopColor="#073A22" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="li-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#li-bg)"/>
    <rect x="40" y="50" width="140" height="200" rx="3" fill="#C9A84C" opacity="0.08"/><rect x="55" y="60" width="110" height="180" rx="2" fill="#C9A84C" opacity="0.04"/>
    <line x1="45" y1="100" x2="175" y2="100" stroke="#C9A84C" strokeWidth="0.8" opacity="0.05"/><line x1="45" y1="150" x2="175" y2="150" stroke="#C9A84C" strokeWidth="0.8" opacity="0.05"/><line x1="45" y1="200" x2="175" y2="200" stroke="#C9A84C" strokeWidth="0.8" opacity="0.05"/>
    <rect x="62" y="68" width="10" height="30" rx="1" fill="#C9A84C" opacity="0.15"/><rect x="76" y="72" width="12" height="26" rx="1" fill="#C9A84C" opacity="0.12"/><rect x="92" y="65" width="8" height="33" rx="1" fill="#C9A84C" opacity="0.18"/><rect x="104" y="70" width="10" height="28" rx="1" fill="#C9A84C" opacity="0.1"/>
    <rect x="62" y="108" width="14" height="38" rx="1" fill="#C9A84C" opacity="0.2"/><rect x="80" y="112" width="10" height="34" rx="1" fill="#C9A84C" opacity="0.15"/>
    <rect x="62" y="158" width="12" height="38" rx="1" fill="#C9A84C" opacity="0.15"/><rect x="78" y="162" width="10" height="34" rx="1" fill="#C9A84C" opacity="0.2"/>
    <rect x="220" y="50" width="140" height="200" rx="3" fill="#C9A84C" opacity="0.08"/><rect x="235" y="60" width="110" height="180" rx="2" fill="#C9A84C" opacity="0.04"/>
    <line x1="225" y1="100" x2="355" y2="100" stroke="#C9A84C" strokeWidth="0.8" opacity="0.05"/><line x1="225" y1="150" x2="355" y2="150" stroke="#C9A84C" strokeWidth="0.8" opacity="0.05"/><line x1="225" y1="200" x2="355" y2="200" stroke="#C9A84C" strokeWidth="0.8" opacity="0.05"/>
    <rect x="242" y="68" width="10" height="30" rx="1" fill="#C9A84C" opacity="0.15"/><rect x="256" y="72" width="12" height="26" rx="1" fill="#C9A84C" opacity="0.12"/><rect x="272" y="65" width="8" height="33" rx="1" fill="#C9A84C" opacity="0.18"/>
    <rect x="242" y="108" width="14" height="38" rx="1" fill="#C9A84C" opacity="0.2"/><rect x="260" y="112" width="10" height="34" rx="1" fill="#C9A84C" opacity="0.15"/>
    <rect x="242" y="158" width="12" height="38" rx="1" fill="#C9A84C" opacity="0.15"/><rect x="258" y="162" width="10" height="34" rx="1" fill="#C9A84C" opacity="0.2"/>
    <rect x="180" y="160" width="40" height="4" rx="1" fill="#C9A84C" opacity="0.06"/><line x1="200" y1="40" x2="200" y2="50" stroke="#C9A84C" strokeWidth="0.5" opacity="0.12"/><path d="M194 45 Q200 35 206 45" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.12"/>
    <rect width="400" height="300" fill="url(#li-overlay)"/>
  </svg>
);

const TeachersSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="tc-bg" cx="0.5" cy="0.35" r="0.7"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.12"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
      <linearGradient id="tc-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#tc-bg)"/>
    <rect x="70" y="50" width="260" height="140" rx="4" fill="rgba(255,255,255,0.08)"/><rect x="75" y="55" width="250" height="130" rx="3" fill="rgba(255,255,255,0.04)"/>
    <g opacity="0.15"><polygon points="200,80 212,100 232,104 218,118 222,138 200,128 178,138 182,118 168,104 188,100" fill="none" stroke="#C9A84C" strokeWidth="0.6"/><circle cx="200" cy="108" r="15" fill="none" stroke="#C9A84C" strokeWidth="0.3"/></g>
    <line x1="110" y1="130" x2="280" y2="130" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/><line x1="110" y1="145" x2="260" y2="145" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <circle cx="160" cy="50" r="10" fill="#1a1a1a" opacity="0.35"/><rect x="153" y="58" width="14" height="20" rx="2" fill="#1a1a1a" opacity="0.35"/><line x1="150" y1="75" x2="130" y2="60" stroke="#C9A84C" strokeWidth="1.5" opacity="0.15"/>
    <circle cx="120" cy="210" r="9" fill="#1a1a1a" opacity="0.25"/><rect x="114" y="217" width="12" height="16" rx="2" fill="#1a1a1a" opacity="0.25"/>
    <circle cx="160" cy="215" r="9" fill="#1a1a1a" opacity="0.25"/><rect x="154" y="222" width="12" height="16" rx="2" fill="#1a1a1a" opacity="0.25"/>
    <circle cx="200" cy="210" r="9" fill="#1a1a1a" opacity="0.25"/><rect x="194" y="217" width="12" height="16" rx="2" fill="#1a1a1a" opacity="0.25"/>
    <circle cx="240" cy="215" r="9" fill="#1a1a1a" opacity="0.25"/><rect x="234" y="222" width="12" height="16" rx="2" fill="#1a1a1a" opacity="0.25"/>
    <circle cx="280" cy="210" r="9" fill="#1a1a1a" opacity="0.25"/><rect x="274" y="217" width="12" height="16" rx="2" fill="#1a1a1a" opacity="0.25"/>
    <rect x="300" y="195" width="40" height="6" rx="1" fill="#C9A84C" opacity="0.08"/><rect x="310" y="200" width="20" height="15" rx="1" fill="#C9A84C" opacity="0.06"/>
    <rect width="400" height="300" fill="url(#tc-overlay)"/>
  </svg>
);

const InternationalSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="in-bg" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.14"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="in-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#in-bg)"/>
    <circle cx="200" cy="130" r="55" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/><circle cx="200" cy="130" r="55" fill="none" stroke="#C9A84C" strokeWidth="0.2" opacity="0.08"/>
    <ellipse cx="185" cy="115" rx="12" ry="9" fill="#C9A84C" opacity="0.08"/><ellipse cx="215" cy="138" rx="10" ry="7" fill="#C9A84C" opacity="0.06"/><ellipse cx="180" cy="140" rx="7" ry="11" fill="#C9A84C" opacity="0.07"/><ellipse cx="210" cy="115" rx="6" ry="4" fill="#C9A84C" opacity="0.06"/>
    <ellipse cx="200" cy="130" rx="55" ry="18" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.1"/><line x1="145" y1="130" x2="255" y2="130" stroke="#C9A84C" strokeWidth="0.3" opacity="0.1"/><line x1="200" y1="75" x2="200" y2="185" stroke="#C9A84C" strokeWidth="0.3" opacity="0.1"/>
    <circle cx="110" cy="200" r="11" fill="#1a1a1a" opacity="0.45"/><rect x="104" y="209" width="12" height="16" rx="2" fill="#1a1a1a" opacity="0.45"/>
    <circle cx="145" cy="210" r="10" fill="#1a1a1a" opacity="0.4"/><rect x="140" y="218" width="10" height="14" rx="2" fill="#1a1a1a" opacity="0.4"/>
    <circle cx="255" cy="200" r="11" fill="#1a1a1a" opacity="0.45"/><rect x="249" y="209" width="12" height="16" rx="2" fill="#1a1a1a" opacity="0.45"/>
    <circle cx="290" cy="210" r="10" fill="#1a1a1a" opacity="0.4"/><rect x="285" y="218" width="10" height="14" rx="2" fill="#1a1a1a" opacity="0.4"/>
    <line x1="270" y1="165" x2="280" y2="140" stroke="#C9A84C" strokeWidth="0.8" opacity="0.12"/><rect x="278" y="127" width="10" height="12" rx="1" fill="#C9A84C" opacity="0.12"/>
    <line x1="130" y1="170" x2="125" y2="145" stroke="#C9A84C" strokeWidth="0.8" opacity="0.12"/><rect x="120" y="133" width="10" height="12" rx="1" fill="#C9A84C" opacity="0.12"/>
    <line x1="155" y1="180" x2="140" y2="200" stroke="#C9A84C" strokeWidth="0.3" opacity="0.08"/><line x1="245" y1="180" x2="260" y2="200" stroke="#C9A84C" strokeWidth="0.3" opacity="0.08"/>
    <circle cx="70" cy="50" r="1.5" fill="#C9A84C" opacity="0.2"/><circle cx="330" cy="45" r="1.5" fill="#C9A84C" opacity="0.15"/><circle cx="350" cy="80" r="1" fill="#C9A84C" opacity="0.2"/><circle cx="60" cy="100" r="1" fill="#C9A84C" opacity="0.15"/>
    <rect width="400" height="300" fill="url(#in-overlay)"/>
  </svg>
);

const WorkshopSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="wo-bg" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15"/><stop offset="100%" stopColor="#073A22" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="wo-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#wo-bg)"/>
    <rect x="40" y="170" width="320" height="8" rx="2" fill="#C9A84C" opacity="0.18"/><rect x="50" y="176" width="300" height="50" rx="2" fill="#C9A84C" opacity="0.06"/>
    <rect x="140" y="135" width="120" height="38" rx="3" fill="#C9A84C" opacity="0.1"/><rect x="145" y="140" width="110" height="28" rx="2" fill="#F5EDD6" opacity="0.05"/>
    <polygon points="200,147 207,154 215,156 210,162 212,170 200,166 188,170 190,162 185,156 193,154" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/>
    <circle cx="80" cy="145" r="12" fill="#1a1a1a" opacity="0.4"/><rect x="73" y="155" width="14" height="20" rx="2" fill="#1a1a1a" opacity="0.4"/>
    <circle cx="120" cy="140" r="11" fill="#1a1a1a" opacity="0.35"/><rect x="114" y="149" width="12" height="18" rx="2" fill="#1a1a1a" opacity="0.35"/>
    <circle cx="280" cy="145" r="12" fill="#1a1a1a" opacity="0.4"/><rect x="273" y="155" width="14" height="20" rx="2" fill="#1a1a1a" opacity="0.4"/>
    <circle cx="320" cy="140" r="11" fill="#1a1a1a" opacity="0.35"/><rect x="314" y="149" width="12" height="18" rx="2" fill="#1a1a1a" opacity="0.35"/>
    <circle cx="200" cy="100" r="13" fill="#1a1a1a" opacity="0.45"/><rect x="192" y="111" width="16" height="22" rx="2" fill="#1a1a1a" opacity="0.45"/><line x1="185" y1="125" x2="160" y2="140" stroke="#C9A84C" strokeWidth="1.5" opacity="0.2"/>
    <rect x="175" y="163" width="50" height="9" rx="1" fill="#C9A84C" opacity="0.12"/><rect x="240" y="165" width="35" height="7" rx="1" fill="#C9A84C" opacity="0.1"/>
    <g opacity="0.03"><circle cx="60" cy="60" r="30" fill="none" stroke="#C9A84C" strokeWidth="0.5"/><circle cx="340" cy="60" r="25" fill="none" stroke="#C9A84C" strokeWidth="0.5"/></g>
    <rect width="400" height="300" fill="url(#wo-overlay)"/>
  </svg>
);

const CeremonySVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ce-bg" cx="0.5" cy="0.35" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.18"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="ce-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#ce-bg)"/>
    <rect x="30" y="180" width="340" height="50" rx="3" fill="#C9A84C" opacity="0.15"/><rect x="40" y="185" width="320" height="40" rx="2" fill="#C9A84C" opacity="0.1"/>
    <rect x="170" y="155" width="60" height="28" rx="2" fill="#C9A84C" opacity="0.12"/><rect x="180" y="160" width="40" height="20" rx="1" fill="#C9A84C" opacity="0.08"/>
    <path d="M193 148 L193 155 L207 155 L207 148 Z" fill="#C9A84C" opacity="0.2"/><rect x="195" y="140" width="10" height="8" rx="2" fill="#C9A84C" opacity="0.18"/><path d="M192 140 Q200 130 208 140" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity="0.15"/>
    <circle cx="140" cy="160" r="12" fill="#1a1a1a" opacity="0.5"/><rect x="132" y="170" width="16" height="20" rx="2" fill="#1a1a1a" opacity="0.5"/><rect x="134" y="165" width="12" height="6" rx="1" fill="#C9A84C" opacity="0.3"/>
    <circle cx="200" cy="160" r="12" fill="#1a1a1a" opacity="0.45"/><rect x="192" y="170" width="16" height="20" rx="2" fill="#1a1a1a" opacity="0.45"/>
    <g opacity="0.25"><circle cx="80" cy="225" r="8" fill="#1a1a1a"/><circle cx="110" cy="225" r="8" fill="#1a1a1a"/><circle cx="250" cy="225" r="8" fill="#1a1a1a"/><circle cx="280" cy="225" r="8" fill="#1a1a1a"/><circle cx="310" cy="225" r="8" fill="#1a1a1a"/><circle cx="95" cy="245" r="8" fill="#1a1a1a"/><circle cx="125" cy="245" r="8" fill="#1a1a1a"/><circle cx="265" cy="245" r="8" fill="#1a1a1a"/><circle cx="295" cy="245" r="8" fill="#1a1a1a"/></g>
    <rect x="100" y="50" width="200" height="60" rx="4" fill="#C9A84C" opacity="0.08"/><rect x="108" y="56" width="184" height="48" rx="3" fill="#C9A84C" opacity="0.05"/>
    <line x1="130" y1="72" x2="270" y2="72" stroke="#C9A84C" strokeWidth="0.8" opacity="0.08"/><line x1="150" y1="84" x2="250" y2="84" stroke="#C9A84C" strokeWidth="0.8" opacity="0.06"/>
    <path d="M60 180 Q200 20 340 180" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <circle cx="150" cy="40" r="3" fill="#C9A84C" opacity="0.12"/><circle cx="200" cy="35" r="3" fill="#C9A84C" opacity="0.12"/><circle cx="250" cy="40" r="3" fill="#C9A84C" opacity="0.12"/>
    <rect width="400" height="300" fill="url(#ce-overlay)"/>
  </svg>
);

const StudyingSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="su-bg" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.11"/><stop offset="100%" stopColor="#073A22" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="su-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#su-bg)"/>
    <rect x="60" y="190" width="280" height="6" rx="2" fill="#C9A84C" opacity="0.15"/>
    <path d="M160 160 L200 150 L240 160 L240 185 L200 195 L160 185Z" fill="#C9A84C" opacity="0.15"/><path d="M168 158 L176 152 L192 152 L184 160 Z" fill="#F5EDD6" opacity="0.06"/><path d="M208 152 L224 152 L232 158 L216 160 Z" fill="#F5EDD6" opacity="0.06"/><line x1="200" y1="150" x2="200" y2="195" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <line x1="170" y1="173" x2="195" y2="168" stroke="#C9A84C" strokeWidth="0.5" opacity="0.1"/><line x1="170" y1="179" x2="192" y2="174" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <line x1="205" y1="168" x2="230" y2="173" stroke="#C9A84C" strokeWidth="0.5" opacity="0.1"/><line x1="208" y1="174" x2="230" y2="179" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <circle cx="200" cy="115" r="14" fill="#1a1a1a" opacity="0.4"/><rect x="190" y="127" width="20" height="28" rx="2" fill="#1a1a1a" opacity="0.4"/>
    <line x1="290" y1="80" x2="290" y2="190" stroke="#C9A84C" strokeWidth="0.8" opacity="0.15"/><path d="M282 80 Q290 70 298 80" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.15"/><ellipse cx="290" cy="82" rx="10" ry="3" fill="#C9A84C" opacity="0.08"/>
    <ellipse cx="290" cy="130" rx="20" ry="30" fill="#C9A84C" opacity="0.04"/>
    <rect x="300" y="175" width="30" height="5" rx="1" fill="#C9A84C" opacity="0.12"/><rect x="303" y="169" width="28" height="6" rx="1" fill="#C9A84C" opacity="0.1"/><rect x="305" y="163" width="26" height="6" rx="1" fill="#C9A84C" opacity="0.08"/>
    <path d="M60 110 Q80 60 100 110 L100 190 L60 190 Z" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.06"/><path d="M65 110 Q80 70 95 110 L95 190 L65 190 Z" fill="none" stroke="#C9A84C" strokeWidth="0.2" opacity="0.04"/>
    <g opacity="0.03"><polygon points="340,40 350,55 365,58 355,70 357,85 340,78 323,85 325,70 315,58 330,55" fill="none" stroke="#C9A84C" strokeWidth="0.5"/></g>
    <rect width="400" height="300" fill="url(#su-overlay)"/>
  </svg>
);

const DefaultSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="df-bg" cx="0.5" cy="0.5" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.1"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
      <linearGradient id="df-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#df-bg)"/>
    <g opacity="0.06"><polygon points="200,30 230,80 280,90 250,130 255,180 200,155 145,180 150,130 120,90 170,80" fill="none" stroke="#C9A84C" strokeWidth="1"/><circle cx="200" cy="105" r="50" fill="none" stroke="#C9A84C" strokeWidth="0.3"/></g>
    <circle cx="200" cy="155" r="25" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/><line x1="200" y1="130" x2="200" y2="180" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/><line x1="175" y1="155" x2="225" y2="155" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <rect width="400" height="300" fill="url(#df-overlay)"/>
  </svg>
);

// ==================== SITE-WIDE CONTEXT SVGs ====================

const NewsSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="n-bg" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.12"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
      <linearGradient id="n-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#n-bg)"/>
    <rect x="40" y="40" width="320" height="220" rx="4" fill="rgba(255,255,255,0.06)"/>
    <rect x="55" y="55" width="290" height="195" rx="3" fill="rgba(255,255,255,0.03)"/>
    <rect x="65" y="60" width="120" height="80" rx="2" fill="#C9A84C" opacity="0.08"/>
    <circle cx="125" cy="100" r="15" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.12"/>
    <line x1="90" y1="120" x2="160" y2="120" stroke="#C9A84C" strokeWidth="0.8" opacity="0.08"/>
    <line x1="95" y1="130" x2="155" y2="130" stroke="#C9A84C" strokeWidth="0.8" opacity="0.06"/>
    {/* Headline */}
    <rect x="210" y="65" width="120" height="8" rx="2" fill="#C9A84C" opacity="0.15"/>
    <rect x="210" y="80" width="100" height="6" rx="2" fill="#C9A84C" opacity="0.1"/>
    <rect x="210" y="92" width="110" height="6" rx="2" fill="#C9A84C" opacity="0.08"/>
    {/* Category badge */}
    <rect x="65" y="155" width="80" height="20" rx="4" fill="#C9A84C" opacity="0.12"/>
    <line x1="75" y1="165" x2="130" y2="165" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/>
    <rect x="65" y="185" width="260" height="6" rx="2" fill="#C9A84C" opacity="0.08"/>
    <rect x="65" y="198" width="240" height="6" rx="2" fill="#C9A84C" opacity="0.08"/>
    <rect x="65" y="211" width="250" height="6" rx="2" fill="#C9A84C" opacity="0.06"/>
    {/* Decorative */}
    <g opacity="0.04"><circle cx="60" cy="45" r="20" fill="none" stroke="#C9A84C" strokeWidth="0.5"/><circle cx="340" cy="45" r="15" fill="none" stroke="#C9A84C" strokeWidth="0.5"/></g>
    <rect width="400" height="300" fill="url(#n-overlay)"/>
  </svg>
);

const AboutSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="a-bg" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
      <linearGradient id="a-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#a-bg)"/>
    {/* Main building */}
    <rect x="100" y="100" width="200" height="140" rx="3" fill="#C9A84C" opacity="0.08"/>
    <path d="M130 100 Q200 50 270 100" fill="#C9A84C" opacity="0.1"/>
    {/* Minarets */}
    <rect x="100" y="60" width="10" height="50" rx="2" fill="#C9A84C" opacity="0.08"/><polygon points="100,60 105,45 110,60" fill="#C9A84C" opacity="0.08"/>
    <rect x="290" y="60" width="10" height="50" rx="2" fill="#C9A84C" opacity="0.08"/><polygon points="290,60 295,45 300,60" fill="#C9A84C" opacity="0.08"/>
    {/* Doors */}
    <path d="M170 240 L170 180 Q200 160 230 180 L230 240" fill="#C9A84C" opacity="0.06"/>
    <path d="M178 240 L178 188 Q200 172 222 188 L222 240" fill="#C9A84C" opacity="0.04"/>
    {/* Windows */}
    <rect x="125" y="125" width="15" height="20" rx="2" fill="#C9A84C" opacity="0.06"/><rect x="155" y="125" width="15" height="20" rx="2" fill="#C9A84C" opacity="0.06"/>
    <rect x="230" y="125" width="15" height="20" rx="2" fill="#C9A84C" opacity="0.06"/><rect x="260" y="125" width="15" height="20" rx="2" fill="#C9A84C" opacity="0.06"/>
    {/* Trees */}
    <circle cx="60" cy="170" r="25" fill="#C9A84C" opacity="0.06"/><rect x="58" y="190" width="4" height="20" fill="#C9A84C" opacity="0.04"/>
    <circle cx="340" cy="170" r="25" fill="#C9A84C" opacity="0.06"/><rect x="338" y="190" width="4" height="20" fill="#C9A84C" opacity="0.04"/>
    <rect width="400" height="300" fill="url(#a-overlay)"/>
  </svg>
);

const AchievementsSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ach-bg" cx="0.5" cy="0.35" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.18"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.9"/></radialGradient>
      <linearGradient id="ach-overlay" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#ach-bg)"/>
    {/* Trophy */}
    <path d="M170 60 L170 100 L230 100 L230 60 Z" fill="#C9A84C" opacity="0.15"/>
    <rect x="185" y="45" width="30" height="15" rx="3" fill="#C9A84C" opacity="0.12"/>
    <path d="M165 55 Q200 30 235 55" fill="none" stroke="#C9A84C" strokeWidth="2" opacity="0.15"/>
    <path d="M165 75 Q200 80 235 75" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.1"/>
    <line x1="170" y1="110" x2="230" y2="110" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <rect x="185" y="110" width="30" height="40" rx="2" fill="#C9A84C" opacity="0.06"/>
    {/* Stars around trophy */}
    <polygon points="100,80 105,90 115,92 108,98 110,108 100,102 90,108 92,98 85,92 95,90" fill="#C9A84C" opacity="0.12"/>
    <polygon points="300,80 305,90 315,92 308,98 310,108 300,102 290,108 292,98 285,92 295,90" fill="#C9A84C" opacity="0.1"/>
    <polygon points="200,25 203,33 210,35 205,40 207,48 200,43 193,48 195,40 190,35 197,33" fill="#C9A84C" opacity="0.15"/>
    {/* Ribbon */}
    <path d="M175 60 L170 45 L185 55 L200 45 L215 55 L230 45 L225 60" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.08"/>
    <rect width="400" height="300" fill="url(#ach-overlay)"/>
  </svg>
);

const ProfileSVG = ({ initial = '?' }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="p-bg" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
    </defs>
    <rect width="200" height="200" fill="#0B4F30"/>
    <circle cx="100" cy="100" r="100" fill="url(#p-bg)"/>
    <g opacity="0.06"><circle cx="100" cy="100" r="85" fill="none" stroke="#C9A84C" strokeWidth="0.5"/><circle cx="100" cy="100" r="70" fill="none" stroke="#C9A84C" strokeWidth="0.3"/></g>
    <circle cx="100" cy="80" r="28" fill="#1a1a1a" opacity="0.5"/>
    <ellipse cx="100" cy="145" rx="35" ry="25" fill="#1a1a1a" opacity="0.4"/>
    <text x="100" y="165" textAnchor="middle" fill="#C9A84C" fontWeight="bold" fontSize="48" fontFamily="serif">{initial}</text>
  </svg>
);

const HeroIllustrationSVG = () => (
  <svg viewBox="0 0 500 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="h-bg" cx="0.5" cy="0.5" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.1"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
      <linearGradient id="h-overlay" x1="0" y1="0.8" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.85)"/></linearGradient>
    </defs>
    <rect width="500" height="400" fill="#0B4F30"/><rect width="500" height="400" fill="url(#h-bg)"/>
    {/* Large dome */}
    <path d="M120 220 Q250 60 380 220" fill="#C9A84C" opacity="0.08"/>
    <path d="M140 220 Q250 80 360 220" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.06"/>
    {/* Crescent */}
    <circle cx="250" cy="65" r="10" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity="0.15"/>
    <circle cx="253" cy="63" r="8" fill="#0B4F30"/>
    {/* Minarets */}
    <rect x="110" y="40" width="14" height="100" rx="3" fill="#C9A84C" opacity="0.08"/><polygon points="110,40 117,15 124,40" fill="#C9A84C" opacity="0.08"/>
    <rect x="376" y="40" width="14" height="100" rx="3" fill="#C9A84C" opacity="0.08"/><polygon points="376,40 383,15 390,40" fill="#C9A84C" opacity="0.08"/>
    {/* Mosque body */}
    <rect x="150" y="160" width="200" height="120" rx="4" fill="#C9A84C" opacity="0.06"/>
    <rect x="160" y="170" width="180" height="100" rx="3" fill="#C9A84C" opacity="0.04"/>
    {/* Mihrab */}
    <path d="M220 280 L220 200 Q250 180 280 200 L280 280" fill="#C9A84C" opacity="0.05"/>
    {/* Arch */}
    <path d="M50 280 Q250 20 450 280" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.06"/>
    {/* Books open */}
    <path d="M180 300 L200 290 L220 300 L220 320 L200 330 L180 320Z" fill="#C9A84C" opacity="0.08"/>
    <path d="M280 300 L300 290 L320 300 L320 320 L300 330 L280 320Z" fill="#C9A84C" opacity="0.08"/>
    {/* Lamp */}
    <line x1="250" y1="130" x2="250" y2="150" stroke="#C9A84C" strokeWidth="0.8" opacity="0.12"/>
    <path d="M242 140 Q250 128 258 140" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.12"/>
    {/* Islamic pattern */}
    <g opacity="0.04"><polygon points="80,280 90,295 105,298 95,310 97,325 80,318 63,325 65,310 55,298 70,295" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
    <polygon points="420,280 430,295 445,298 435,310 437,325 420,318 403,325 405,310 395,298 410,295" fill="none" stroke="#C9A84C" strokeWidth="0.5"/></g>
    <rect width="500" height="400" fill="url(#h-overlay)"/>
  </svg>
);

const CourseSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="co-bg2" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.13"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
      <linearGradient id="co-overlay2" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#co-bg2)"/>
    <rect x="50" y="60" width="300" height="180" rx="4" fill="rgba(255,255,255,0.06)"/>
    {/* Open book */}
    <path d="M140 120 L200 105 L260 120 L260 200 L200 215 L140 200Z" fill="#C9A84C" opacity="0.12"/>
    <path d="M150 118 L160 110 L180 110 L170 122 Z" fill="#F5EDD6" opacity="0.05"/>
    <path d="M220 110 L240 110 L250 118 L230 122 Z" fill="#F5EDD6" opacity="0.05"/>
    <line x1="200" y1="105" x2="200" y2="215" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <line x1="150" y1="145" x2="195" y2="138" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <line x1="150" y1="155" x2="192" y2="148" stroke="#C9A84C" strokeWidth="0.5" opacity="0.06"/>
    <line x1="205" y1="138" x2="250" y2="145" stroke="#C9A84C" strokeWidth="0.5" opacity="0.08"/>
    <line x1="208" y1="148" x2="250" y2="155" stroke="#C9A84C" strokeWidth="0.5" opacity="0.06"/>
    {/* Pen */}
    <line x1="270" y1="100" x2="290" y2="80" stroke="#C9A84C" strokeWidth="1.5" opacity="0.15"/>
    <circle cx="292" cy="78" r="2" fill="#C9A84C" opacity="0.15"/>
    {/* Islamic star */}
    <g opacity="0.05"><polygon points="330,50 338,65 350,68 343,78 345,90 330,82 315,90 317,78 310,68 322,65" fill="none" stroke="#C9A84C" strokeWidth="0.5"/></g>
    <rect width="400" height="300" fill="url(#co-overlay2)"/>
  </svg>
);

const QuranSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="q-bg2" cx="0.5" cy="0.4" r="0.65"><stop offset="0%" stopColor="#C9A84C" stopOpacity="0.12"/><stop offset="100%" stopColor="#0B4F30" stopOpacity="0.95"/></radialGradient>
      <linearGradient id="q-overlay2" x1="0" y1="0.7" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.75)"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="#0B4F30"/><rect width="400" height="300" fill="url(#q-bg2)"/>
    {/* Open Quran */}
    <path d="M100 80 L200 60 L300 80 L300 240 L200 260 L100 240Z" fill="#C9A84C" opacity="0.12"/>
    <path d="M100 80 L200 60 L200 260 L100 240Z" fill="#C9A84C" opacity="0.08"/>
    <path d="M300 80 L200 60 L200 260 L300 240Z" fill="#C9A84C" opacity="0.06"/>
    <line x1="200" y1="60" x2="200" y2="260" stroke="#C9A84C" strokeWidth="0.8" opacity="0.1"/>
    {/* Arabic text lines */}
    <line x1="125" y1="120" x2="185" y2="108" stroke="#C9A84C" strokeWidth="0.6" opacity="0.12"/>
    <line x1="125" y1="135" x2="182" y2="123" stroke="#C9A84C" strokeWidth="0.6" opacity="0.1"/>
    <line x1="125" y1="150" x2="178" y2="138" stroke="#C9A84C" strokeWidth="0.6" opacity="0.08"/>
    <line x1="215" y1="108" x2="275" y2="120" stroke="#C9A84C" strokeWidth="0.6" opacity="0.12"/>
    <line x1="218" y1="123" x2="275" y2="135" stroke="#C9A84C" strokeWidth="0.6" opacity="0.1"/>
    <line x1="222" y1="138" x2="275" y2="150" stroke="#C9A84C" strokeWidth="0.6" opacity="0.08"/>
    {/* Star */}
    <g opacity="0.05"><polygon points="200,30 208,45 220,48 213,58 215,70 200,62 185,70 187,58 180,48 192,45" fill="none" stroke="#C9A84C" strokeWidth="0.5"/></g>
    {/* Rest */}
    <rect x="155" y="185" width="90" height="8" rx="2" fill="#C9A84C" opacity="0.15"/><rect x="160" y="198" width="80" height="6" rx="2" fill="#C9A84C" opacity="0.1"/>
    <rect width="400" height="300" fill="url(#q-overlay2)"/>
  </svg>
);

// Mapping of categoryId/context to SVG component
const svgMap = {
  'classrooms': ClassroomSVG,
  'campus': CampusSVG,
  'students': StudentsSVG,
  'events': EventsSVG,
  'convocation': ConvocationSVG,
  'online-classes': OnlineClassesSVG,
  'mosque': MosqueSVG,
  'library': LibrarySVG,
  'teachers': TeachersSVG,
  'international': InternationalSVG,
  'workshop': WorkshopSVG,
  'ceremony': CeremonySVG,
  'studying': StudyingSVG,
  'news': NewsSVG,
  'about': AboutSVG,
  'achievements': AchievementsSVG,
  'hero': HeroIllustrationSVG,
  'course': CourseSVG,
  'quran': QuranSVG,
};

/**
 * Returns a contextual SVG placeholder component for the given category/context.
 * @param {string} categoryId - The category or context identifier (e.g., 'classrooms', 'news', 'about', 'profile')
 * @param {object} [options] - Additional options
 * @param {string} [options.initial] - Initial letter for profile SVGs
 * @returns {JSX.Element} SVG component
 */
export function getGalleryPlaceholderSVG(categoryId, options = {}) {
  const SVGComponent = svgMap[categoryId] || DefaultSVG;
  
  if (categoryId === 'profile' && options.initial) {
    return <ProfileSVG initial={options.initial} />;
  }
  
  return <SVGComponent />;
}

// Also export individual SVGs for direct use
export {
  ClassroomSVG, CampusSVG, StudentsSVG, EventsSVG, ConvocationSVG,
  OnlineClassesSVG, MosqueSVG, LibrarySVG, TeachersSVG, InternationalSVG,
  WorkshopSVG, CeremonySVG, StudyingSVG, DefaultSVG,
  NewsSVG, AboutSVG, AchievementsSVG, HeroIllustrationSVG, CourseSVG, QuranSVG, ProfileSVG,
};
