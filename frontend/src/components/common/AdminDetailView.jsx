import {
  FiMail, FiPhone, FiGlobe, FiMapPin, FiCalendar,
  FiUser, FiShield, FiAward, FiBookOpen, FiBriefcase,
  FiClock, FiMonitor, FiCheckCircle,
  FiExternalLink, FiDownload, FiFile, FiImage,
  FiPhoneCall,
  FiInfo, FiFlag, FiStar, FiHome, FiPaperclip,
  FiHeart,
  FiBook,
} from 'react-icons/fi';

// ─── Helpers ─────────────────────────────────────────────

const NA = <span className="text-text-light italic text-sm">Not Provided</span>;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null;

const fmtShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : null;

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : null);

// ─── Badge ───────────────────────────────────────────────

function Badge({ children, variant = 'default', size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
  const base = `inline-flex items-center ${sizeClass} rounded-full font-bold border`;
  const v = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    blocked: 'bg-gray-200 text-gray-700 border-gray-300',
    published: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-orange-100 text-orange-800 border-orange-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    not_submitted: 'bg-gray-100 text-gray-800 border-gray-200',
    changes_requested: 'bg-blue-100 text-blue-800 border-blue-200',
    inactive: 'bg-orange-100 text-orange-800 border-orange-200',
    graduated: 'bg-blue-100 text-blue-800 border-blue-200',
    suspended: 'bg-red-100 text-red-800 border-red-200',
    transferred: 'bg-purple-100 text-purple-800 border-purple-200',
    complete: 'bg-green-100 text-green-800 border-green-200',
    incomplete: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return <span className={`${base} ${v[variant] || v.default}`}>{children}</span>;
}

// ─── Field ───────────────────────────────────────────────

function Field({ label, value, icon: Icon, fullWidth }) {
  const val = value !== null && value !== undefined && value !== '' ? value : NA;
  return (
    <div className={`min-w-0 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1">
        {Icon && <Icon size={12} className="text-text-light flex-shrink-0" />}
        {label}
      </p>
      <p className="text-sm font-semibold text-text-dark leading-relaxed break-words">{val}</p>
    </div>
  );
}

// ─── TagList ─────────────────────────────────────────────

function TagList({ items, color = 'primary' }) {
  if (!items || items.length === 0) return NA;
  const colors = {
    primary: 'bg-primary/5 text-primary',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-bg-light text-text-dark',
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${colors[color] || colors.primary}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────

const GRID_COLS = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };

function SectionCard({ title, icon: Icon, children, cols = 2, className = '' }) {
  return (        <div className={`bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border-light bg-gradient-to-r from-bg-light/80 to-white">
        <h3 className="flex items-center gap-2 font-heading font-bold text-text-dark text-sm">
          {Icon && (
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon size={14} className="text-primary" />
            </span>
          )}
          {title}
        </h3>
      </div>
      <div
        className={`p-4 sm:p-6 grid grid-cols-1 ${GRID_COLS[cols] || 'sm:grid-cols-2'} gap-x-5 gap-y-3 sm:gap-y-4 min-w-0`}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Premium Stat Pill (used in header) ──────────────────

function StatPill({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[85px] border border-white/10">
      {Icon && <Icon size={16} className="text-white/60 mx-auto mb-1" />}
      <p className="text-lg font-bold text-white leading-none">{value ?? '-'}</p>
      <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mt-1.5">
        {label}
      </p>
    </div>
  );
}

// ─── Account Status Card ─────────────────────────────────

function AccountStatusCard({ label, value, badge, icon: Icon, color }) {
  const colors = {
    green: 'border-l-green-500 bg-gradient-to-r from-green-50/50 to-white',
    yellow: 'border-l-yellow-500 bg-gradient-to-r from-yellow-50/50 to-white',
    red: 'border-l-red-500 bg-gradient-to-r from-red-50/50 to-white',
    blue: 'border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white',
    gray: '    border-l-gray-400 bg-gradient-to-r from-gray-50/50 to-white',
  };
  const iconColors = {
    green: 'text-emerald-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
  };
  return (      <div
        className={`rounded-xl border border-border-light border-l-4 p-4 ${colors[color] || colors.gray} shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {Icon && (
              <span className="w-9 h-9 rounded-lg bg-white shadow-sm border border-border-light flex items-center justify-center flex-shrink-0">
                <Icon size={16} className={iconColors[color] || 'text-gray-600'} />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-light uppercase tracking-wider break-words whitespace-normal">{label}</p>
              <p className="text-sm font-bold text-text-dark mt-0.5 break-words whitespace-normal">{value}</p>
            </div>
          </div>
          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
        </div>
      </div>
  );
}

// ─── Timeline Event ──────────────────────────────────────

function TimelineEvent({ icon: Icon, date, title, status, variant = 'default', isLast }) {
  const dotColors = {
    default: 'border-gray-300 bg-white',
    active: 'border-green-500 bg-green-500',
    pending: 'border-yellow-500 bg-yellow-500',
    rejected: 'border-red-500 bg-red-500',
    blocked: 'border-gray-500 bg-gray-500',
    verified: 'border-green-500 bg-green-500',
  };
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[17px] top-8 bottom-0 w-0.5 bg-border-light" />
      )}
      {/* Dot */}
      <div
        className={`relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 shadow-sm ${
          dotColors[variant] || dotColors.default
        }`}
      >
        {Icon && (
          <Icon
            size={14}
            className={
              variant === 'default' ? 'text-text-light' : 'text-white'
            }
          />
        )}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-text-dark">{title}</p>
          {status && <Badge variant={status.variant}>{status.label}</Badge>}
        </div>
        {date && (
          <p className="text-xs text-text-light mt-0.5">{date}</p>
        )}
      </div>
    </div>
  );
}

// ─── Document Card (enhanced) ────────────────────────────

function DocumentCard({ doc, index }) {
  const url = typeof doc === 'string' ? doc : doc?.url || '';
  const fileName =
    typeof doc === 'string'
      ? doc.split('/').pop() || `Document ${index + 1}`
      : doc?.name || doc?.originalName || `Document ${index + 1}`;

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);
  const isUrl = url.startsWith('http://') || url.startsWith('https://');
  const fileExt = url.split('.').pop()?.toUpperCase() || 'FILE';

  const uploadDate = doc?.uploadedAt || doc?.uploadDate || doc?.createdAt || null;
  const fmtDocDate = (d) => {
    if (!d) return null;
    // Handle year-only values
    if (/^\d{4}$/.test(String(d))) return d;
    try {
      return fmtShortDate(d);
    } catch {
      return String(d);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-200 group">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail/Icon */}
          <div
            className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border ${
              isImage
                ? 'border-border-light'
                : isPdf
                  ? 'border-red-200 bg-red-50'
                  : 'border-border-light bg-bg-light'
            }`}
          >
            {isImage ? (
              <img
                src={url}
                alt={fileName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : isPdf ? (
              <div className="text-center">
                <FiFile size={24} className="text-red-500" />
                <span className="block text-[9px] font-bold text-red-500 mt-0.5">PDF</span>
              </div>
            ) : (
              <div className="text-center">
                <FiPaperclip size={24} className="text-text-light" />
                <span className="block text-[9px] font-bold text-text-light mt-0.5">{fileExt}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-dark truncate" title={fileName}>
              {fileName}
            </p>
            <p className="text-[11px] text-text-light mt-0.5 flex items-center gap-1.5">
              {isImage ? (
                <>
                  <FiImage size={11} /> Image
                </>
              ) : isPdf ? (
                <>
                  <FiFile size={11} /> PDF Document
                </>
              ) : (
                <>
                  <FiPaperclip size={11} /> {fileExt} File
                </>
              )}
              <span className="text-border-light">|</span>
              {fmtDocDate(uploadDate) || 'Date unknown'}
            </p>
          </div>

          {/* Actions - always visible */}
          {isUrl && (
            <div className="flex gap-1 flex-shrink-0">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
                title="Open in new tab"
              >
                <FiExternalLink size={15} />
              </a>
              <a
                href={url}
                download
                className="p-2 rounded-lg text-text-body hover:bg-bg-light transition-colors border border-transparent hover:border-border-light"
                title="Download"
              >
                <FiDownload size={15} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Social Link Button ──────────────────────────────────

function SocialLinkButton({ href, icon: Icon, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-bg-light rounded-xl text-sm font-semibold text-text-body hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all border border-border-light"
    >
      <span className="w-7 h-7 rounded-lg bg-white border border-border-light flex items-center justify-center">
        <Icon size={14} className="text-text-body group-hover:text-primary" />
      </span>
      {label}
      <FiExternalLink size={12} className="text-text-light/60" />
    </a>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function AdminDetailView({ entity, type = 'teacher', statusMaps }) {
  const user = entity?.user || {};
  const isTeacher = type === 'teacher';

  // ── Status helpers ──
  const userStatus = user?.status;
  const userStatusLabel =
    statusMaps?.userStatus?.[userStatus]?.label ||
    capitalize(userStatus) ||
    'Pending';
  const userStatusVariant =
    statusMaps?.userStatus?.[userStatus]?.variant || userStatus;

  const verifStatus = user?.profileVerificationStatus;
  const verifLabel =
    statusMaps?.verification?.[verifStatus]?.label || 'Not Submitted';
  const verifVariant =
    statusMaps?.verification?.[verifStatus]?.variant || 'not_submitted';

  const completionPct = user?.completionPercentage ?? 0;
  const profileCompleteVariant = completionPct >= 100 ? 'complete' : 'incomplete';

  const name = isTeacher ? entity?.fullName : entity?.studentName;
  const photo = isTeacher ? entity?.profilePhoto : entity?.studentPhoto;
  const bio = isTeacher ? entity?.shortBio || entity?.bio : entity?.bio;

  // ── Documents ──
  const allDocs = isTeacher
    ? [
        ...(entity?.resume ? [{ url: entity.resume, name: 'Resume', type: 'resume' }] : []),
        ...(entity?.additionalDocuments?.map((d) =>
          typeof d === 'string' ? { url: d, type: 'additional' } : d
        ) || []),
      ]
    : [
        ...(entity?.educationalCertificates?.map((c) =>
          typeof c === 'string' ? { url: c, type: 'certificate' } : c
        ) || []),
      ];



  // ── Account Timeline ──
  const timelineEvents = [
    {
      icon: FiFlag,
      title: 'Account Created',
      date: fmtDate(entity?.createdAt),
      variant: 'active',
    },
    ...(entity?.updatedAt && entity?.updatedAt !== entity?.createdAt
      ? [
          {
            icon: FiClock,
            title: 'Profile Updated',
            date: fmtDate(entity?.updatedAt),
            variant: 'default',
          },
        ]
      : []),
    ...(userStatus === 'active'
      ? [
          {
            icon: FiCheckCircle,
            title: 'Account Approved',
            variant: 'active',
            status: { label: 'Active', variant: 'active' },
          },
        ]
      : []),
    ...(userStatus === 'rejected'
      ? [
          {
            icon: FiShield,
            title: 'Account Rejected',
            variant: 'rejected',
            status: { label: 'Rejected', variant: 'rejected' },
          },
        ]
      : []),
    ...(userStatus === 'blocked'
      ? [
          {
            icon: FiShield,
            title: 'Account Blocked',
            variant: 'blocked',
            status: { label: 'Blocked', variant: 'blocked' },
          },
        ]
      : []),
    ...(verifStatus === 'verified'
      ? [
          {
            icon: FiStar,
            title: 'Profile Verified',
            variant: 'verified',
            status: { label: 'Verified', variant: 'verified' },
          },
        ]
      : []),
    ...(verifStatus === 'pending' || verifStatus === 'not_submitted'
      ? [
          {
            icon: FiClock,
            title: 'Profile Verification',
            date: verifStatus === 'pending' ? 'Awaiting review' : null,
            variant: 'pending',
            status: { label: verifStatus === 'pending' ? 'Pending' : 'Not Submitted', variant: 'pending' },
          },
        ]
      : []),
  ];

  // Remove duplicate timeline entries
  const uniqueTimeline = timelineEvents.filter(
    (event, index, self) => index === self.findIndex((e) => e.title === event.title)
  );

  // ── Google Maps link ──
  const addressParts = [entity?.address, entity?.city, entity?.province || entity?.state, entity?.country, entity?.postalCode].filter(Boolean);
  const mapsQuery = addressParts.join(', ');
  const mapsUrl = mapsQuery
    ? `https://www.google.com/maps/search/${encodeURIComponent(mapsQuery)}`
    : null;

  // ── Languages ──
  const languages = isTeacher ? entity?.teachingLanguages : entity?.languages;

  // ── Skills ──
  const skills = entity?.skills;

  const notAssigned = <span className="text-white/60 text-xs">Not Assigned</span>;
  const notProvided = <span className="text-white/60 text-xs">Not Provided</span>;

  const headerSummaryCards = [
    {
      icon: FiCalendar,
      label: 'Member Since',
      value: entity?.createdAt
        ? new Date(entity.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : notProvided,
      show: true,
    },
    ...(isTeacher
      ? [
          {
            icon: FiClock,
            label: 'Experience',
            value: entity?.experience ? `${entity.experience} years` : notAssigned,
            show: true,
          },
          {
            icon: FiBookOpen,
            label: 'Subjects',
            value: entity?.subjects?.length > 0 ? `${entity.subjects.length} Subject${entity.subjects.length > 1 ? 's' : ''}` : notAssigned,
            show: true,
          },
        ]
      : []),
    {
      icon: FiMapPin,
      label: 'Country',
      value: entity?.country || notProvided,
      show: true,
    },
    ...(entity?.department
      ? [{
          icon: FiBriefcase,
          label: 'Department',
          value: entity.department,
          show: true,
        }]
      : []),
  ];

  function SummaryCard({ icon: Icon, label, value }) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 border border-white/10 hover:bg-white/15 transition-colors">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Icon size={14} className="text-white/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 break-words whitespace-normal">{label}</p>
            <p className="text-sm font-bold text-white mt-0.5 break-words whitespace-normal" title={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}>{value}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════════════
          PREMIUM PROFILE HEADER — 3-COLUMN RESPONSIVE
      ══════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-[#1a3a6b] rounded-2xl overflow-hidden shadow-xl">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 opacity-[0.07]">
          <svg className="w-96 h-96" viewBox="0 0 400 400" fill="none">
            <circle cx="250" cy="150" r="180" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="250" cy="150" r="120" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="250" cy="150" r="60" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent" />          <div className="relative z-10 p-5 sm:p-8">
            {/* ── Responsive layout: stacks on mobile, 3 cols on lg ── */}
            <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">

              {/* ════ LEFT SECTION: Avatar + Name + Badges ════ */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                  {photo ? (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl ring-4 ring-white/10">
                      <img src={photo} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-gold/10"><span class="text-3xl font-bold text-primary">' + (entity?.fullName?.charAt(0)?.toUpperCase() || '?') + '</span></div>'; }} />
                    </div>
                  ) : (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 shadow-xl ring-4 ring-white/10">
                      <FiUser size={44} className="text-white/60" />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-400 border-2 border-white rounded-full shadow-lg" />
                </div>

                {/* Name + Email + Badges */}
                <div className="text-center sm:text-left min-w-0 flex-1">
                  <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
                    {name || 'Unknown'}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
                    {entity?.email && (
                      <p className="flex items-center justify-center sm:justify-start gap-1.5 text-green-100/80 text-sm min-w-0">
                        <FiMail size={13} className="flex-shrink-0" />
                        <span className="truncate">{entity.email}</span>
                      </p>
                    )}
                    {entity?.country && (
                      <p className="flex items-center justify-center sm:justify-start gap-1.5 text-green-100/60 text-sm min-w-0">
                        <FiMapPin size={12} className="flex-shrink-0" />
                        <span className="truncate">{[entity?.city, entity?.country].filter(Boolean).join(', ')}</span>
                      </p>
                    )}
                  </div>
                  {/* Badges */}
                  <div className="flex flex-col items-center sm:items-start gap-1.5 mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Status</p>
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                        <FiShield size={10} />
                        {isTeacher ? 'Teacher' : 'Student'}
                      </span>
                      <Badge variant={userStatusVariant}>{userStatusLabel}</Badge>
                      <Badge variant={verifVariant}>{verifLabel}</Badge>
                      <Badge variant={profileCompleteVariant}>
                        {completionPct >= 100 ? 'Complete' : `${completionPct}%`}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* ════ RIGHT SECTION: Summary Cards ════ */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5 lg:gap-3 min-w-0">
                {headerSummaryCards
                  .filter((c) => c.show)
                  .map((card, i) => (
                    <SummaryCard key={i} icon={card.icon} label={card.label} value={card.value} />
                  ))}
              </div>

            </div>
          </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ACCOUNT SUMMARY - RESPONSIVE FLEX WRAP
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="flex-1 min-w-[200px] sm:min-w-[210px]">
          <AccountStatusCard
            label="Account Status"
            value={userStatusLabel}
            icon={FiShield}
            color={userStatus === 'active' ? 'green' : userStatus === 'blocked' ? 'red' : userStatus === 'pending' ? 'yellow' : 'gray'}
            badge={{ label: userStatusLabel, variant: userStatusVariant }}
          />
        </div>
        <div className="flex-1 min-w-[200px] sm:min-w-[210px]">
          <AccountStatusCard
            label="Verification Status"
            value={verifLabel}
            icon={FiCheckCircle}
            color={verifStatus === 'verified' ? 'green' : verifStatus === 'pending' ? 'yellow' : verifStatus === 'rejected' ? 'red' : 'gray'}
            badge={{ label: verifLabel, variant: verifVariant }}
          />
        </div>
        <div className="flex-1 min-w-[200px] sm:min-w-[210px]">
          <AccountStatusCard
            label="Approval Status"
            value={userStatusLabel}
            icon={FiFlag}
            color={userStatus === 'active' ? 'green' : userStatus === 'blocked' ? 'red' : userStatus === 'pending' ? 'yellow' : 'gray'}
            badge={{
              label: userStatusLabel,
              variant: userStatusVariant,
            }}
          />
        </div>
        <div className="flex-1 min-w-[200px] sm:min-w-[210px]">
          <AccountStatusCard
            label="Profile Completion"
            value={`${completionPct}%`}
            icon={FiStar}
            color={completionPct >= 100 ? 'green' : 'yellow'}
            badge={{
              label: completionPct >= 100 ? 'Complete' : 'Incomplete',
              variant: profileCompleteVariant,
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          2-COLUMN CONTENT GRID
      ══════════════════════════════════════════════════════ */}
      {/* role-specific content */}
      {isTeacher ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── TEACHER: PERSONAL INFORMATION ── */}
            <SectionCard title="Personal Information" icon={FiUser} cols={2}>
              <Field label="Full Name" value={entity?.fullName} icon={FiUser} />
              <Field label="Gender" value={entity?.gender ? capitalize(entity.gender) : null} icon={FiUser} />
              <Field label="Date of Birth" value={fmtShortDate(entity?.dateOfBirth)} icon={FiCalendar} />
              <Field label="Nationality" value={entity?.nationality} icon={FiGlobe} />
              <Field label="Phone" value={entity?.phone} icon={FiPhone} />
              <Field label="WhatsApp" value={entity?.whatsapp} icon={FiPhoneCall} />
              <Field label="Country" value={entity?.country} icon={FiGlobe} />
              <Field label="City" value={entity?.city} icon={FiMapPin} />
              <Field label="Address" value={entity?.address} icon={FiHome} fullWidth />
            </SectionCard>

            {/* ── TEACHER: QUALIFICATION & EXPERIENCE ── */}
            <SectionCard title="Qualification & Experience" icon={FiAward} cols={2}>
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1.5">
                  <FiBook size={12} /> Courses You Can Teach
                </p>
                {entity?.canTeachCourses?.length > 0 ? (
                  <TagList items={entity.canTeachCourses.map(c => c.title || c.name || c)} color="primary" />
                ) : (
                  NA
                )}
              </div>
              <Field label="Qualification" value={entity?.qualification} icon={FiAward} />
              <Field label="Degree" value={entity?.degree} icon={FiBookOpen} />
              <Field label="Experience (years)" value={entity?.experience} icon={FiClock} />
              <Field label="Specialization" value={entity?.specialization} icon={FiAward} />
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1.5">
                  <FiBookOpen size={12} /> Subjects
                </p>
                <TagList items={entity?.subjects} color="primary" />
              </div>
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1.5">
                  <FiGlobe size={12} /> Teaching Languages
                </p>
                <TagList items={languages} color="blue" />
              </div>
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1">
                  <FiInfo size={12} /> Short Biography
                </p>
                <p className="text-sm font-semibold text-text-dark leading-relaxed break-words whitespace-pre-line bg-gradient-to-r from-bg-light/50 to-white rounded-xl p-4 border border-border-light">{entity?.shortBio || NA}</p>
              </div>
            </SectionCard>

            {/* ── TEACHER: SKILLS & AVAILABILITY ── */}
            <SectionCard title="Skills & Availability" icon={FiStar} cols={2}>
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1.5">
                  <FiCheckCircle size={12} /> Skills
                </p>
                <TagList items={skills} color="green" />
              </div>
              <Field label="Teaching Mode" value={entity?.teachingMode ? capitalize(entity.teachingMode) : null} icon={FiMonitor} />
              <Field label="Availability" value={entity?.availability} icon={FiCalendar} />
            </SectionCard>


          </div>

          {/* ── TEACHER: DOCUMENTS ── */}
          {(entity?.profilePhoto || entity?.resume || entity?.certificates?.length > 0 || entity?.additionalDocuments?.length > 0) && (
            <SectionCard title="Documents" icon={FiFile} cols={1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {entity?.profilePhoto && (
                  <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-lg transition-all duration-200 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-light mb-2">Profile Photo</p>
                    <div className="w-20 h-20 rounded-lg overflow-hidden border mb-2">
                      <img src={entity.profilePhoto} alt="Profile Photo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <a href={entity.profilePhoto} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      <FiExternalLink size={12} /> View Image
                    </a>
                  </div>
                )}
                {entity?.resume && (
                  <DocumentCard doc={{ url: entity.resume, name: 'Resume' }} index={0} />
                )}
                {entity?.additionalDocuments?.map((docUrl, idx) => (
                  <DocumentCard key={idx} doc={{ url: docUrl, name: `Additional Document ${idx + 1}` }} index={idx} />
                ))}
              </div>

              {/* Certificates */}
              {entity?.certificates?.length > 0 && (
                <div className="mt-6 border-t border-border-light pt-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-light mb-3">Certificates</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {entity.certificates.map((cert, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-bg-light rounded-xl border border-border-light">
                        <div>
                          <p className="text-sm font-semibold text-text-dark">{cert.title}</p>
                          <p className="text-xs text-text-light">{cert.issuer}{cert.year ? ` (${cert.year})` : ''}</p>
                        </div>
                        {cert.url && (
                          <a href={cert.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-xs font-bold hover:underline px-3 py-1.5 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                            <FiExternalLink size={12} /> View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── STUDENT: PERSONAL INFORMATION ── */}
            <SectionCard title="Personal Information" icon={FiUser} cols={2}>
              <Field label="Full Name" value={entity?.studentName} icon={FiUser} />
              <Field label="Father Name" value={entity?.fatherName} icon={FiUser} />
              <Field label="Date of Birth" value={fmtShortDate(entity?.dateOfBirth)} icon={FiCalendar} />
              <Field label="Gender" value={entity?.gender ? capitalize(entity.gender) : null} icon={FiUser} />
              <Field label="Nationality" value={entity?.nationality} icon={FiGlobe} />
            </SectionCard>

            {/* ── STUDENT: CONTACT & ADDRESS ── */}
            <SectionCard title="Contact & Address" icon={FiMapPin} cols={2}>
              <Field label="Phone Number" value={entity?.phone} icon={FiPhone} />
              <Field label="WhatsApp Number" value={entity?.whatsapp} icon={FiPhoneCall} />
              <Field label="Email" value={entity?.email} icon={FiMail} />
              <Field label="Country" value={entity?.country} icon={FiGlobe} />
              <Field label="City" value={entity?.city} icon={FiMapPin} />
              <Field label="Postal Code" value={entity?.postalCode} />
              <Field label="Address" value={entity?.address} icon={FiHome} fullWidth />
              <Field label="Emergency Contact Name" value={entity?.emergencyContact} icon={FiUser} />
              <Field label="Emergency Contact Phone" value={entity?.emergencyPhone} icon={FiPhone} />
            </SectionCard>

            {/* ── STUDENT: EDUCATION & COURSES ── */}
            <SectionCard title="Education & Courses" icon={FiBookOpen} cols={2}>
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1.5">
                  <FiBook size={12} /> Selected Courses
                </p>
                {entity?.courses?.length > 0 ? (
                  <TagList items={entity.courses.filter(c => c.course).map(c => c.course.title || c.course.name || c.course)} color="primary" />
                ) : (
                  NA
                )}
              </div>
              <Field label="Previous Institute / School" value={entity?.previousEducation} icon={FiHome} fullWidth />
              <Field label="Current Qualification" value={entity?.currentQualification} icon={FiAward} fullWidth />
            </SectionCard>

            {/* ── STUDENT: BIO & SKILLS ── */}
            <SectionCard title="Bio & Skills" icon={FiStar} cols={2}>
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1">
                  <FiInfo size={12} /> Bio
                </p>
                <p className="text-sm font-semibold text-text-dark leading-relaxed break-words whitespace-pre-line bg-gradient-to-r from-bg-light/50 to-white rounded-xl p-4 border border-border-light">{entity?.bio || NA}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1.5">
                  <FiGlobe size={12} /> Languages
                </p>
                <TagList items={languages} color="blue" />
              </div>
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1.5">
                  <FiCheckCircle size={12} /> Skills
                </p>
                <TagList items={skills} color="green" />
              </div>
            </SectionCard>
          </div>

          {/* ── STUDENT: DOCUMENTS ── */}
          {entity?.studentPhoto && (
            <SectionCard title="Documents" icon={FiFile} cols={1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-lg transition-all duration-200 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-light mb-2">Profile Photo</p>
                  <div className="w-20 h-20 rounded-lg overflow-hidden border mb-2">                      <img src={entity.studentPhoto} alt="Profile Photo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <a href={entity.studentPhoto} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    <FiExternalLink size={12} /> View Image
                  </a>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ACCOUNT TIMELINE
      ══════════════════════════════════════════════════════ */}
      <SectionCard title="Account Timeline" icon={FiClock} cols={1}>
        <div className="col-span-1 px-1">
          {uniqueTimeline.length > 0 ? (
            uniqueTimeline.map((event, i) => (
              <TimelineEvent
                key={i}
                icon={event.icon}
                title={event.title}
                date={event.date}
                status={event.status}
                variant={event.variant}
                isLast={i === uniqueTimeline.length - 1}
              />
            ))
          ) : (
            <p className="text-sm text-text-light italic">No timeline events available.</p>
          )}
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════
          TIMESTAMPS FOOTER
      ══════════════════════════════════════════════════════ */}
      {(entity?.createdAt || entity?.updatedAt) && (
        <div className="bg-gradient-to-r from-bg-light/80 to-white rounded-2xl px-4 sm:px-6 py-4 sm:py-5 border border-border-light">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center sm:text-left min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-light">Created</p>
              <p className="text-sm font-bold text-text-dark mt-0.5 break-words">
                {entity?.createdAt ? fmtShortDate(entity.createdAt) : '-'}
              </p>
            </div>
            <div className="text-center sm:text-left min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-light">Updated</p>
              <p className="text-sm font-bold text-text-dark mt-0.5 break-words">
                {entity?.updatedAt ? fmtShortDate(entity.updatedAt) : '-'}
              </p>
            </div>
            {isTeacher && (
              <div className="text-center sm:text-left min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-light">
                  Published
                </p>
                <p className="text-sm font-bold text-text-dark mt-0.5 break-words">
                  {entity?.publishedAt
                    ? fmtShortDate(entity.publishedAt)
                    : '-'}
                </p>
              </div>
            )}
            <div className="text-center sm:text-left min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-light">
                Profile
              </p>
              <p className="text-sm font-bold text-text-dark mt-0.5 capitalize break-words">
                {completionPct >= 100 ? 'Complete' : `${completionPct}%`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { Badge };
