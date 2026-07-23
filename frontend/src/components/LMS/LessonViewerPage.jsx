import {
  FiArrowLeft, FiPlay, FiFile, FiFileText, FiExternalLink,
  FiClock, FiCalendar, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiChevronLeft, FiChevronRight, FiStar, FiMaximize2, FiMinimize2,
  FiDownload, FiBookOpen, FiLayers, FiHash, FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { useState } from 'react';

// ─── YouTube URL conversion ──────────────────────────────
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Type config ──────────────────────────────────────────
const typeConfig = {
  video: {
    icon: FiPlay,
    label: 'Video',
    badge: 'text-red-700 bg-red-100',
  },
  pdf: {
    icon: FiFile,
    label: 'PDF',
    badge: 'text-red-700 bg-red-100',
  },
  document: {
    icon: FiFileText,
    label: 'Document',
    badge: 'text-blue-700 bg-blue-100',
  },
  external_link: {
    icon: FiExternalLink,
    label: 'External Link',
    badge: 'text-purple-700 bg-purple-100',
  },
  text: {
    icon: FiFileText,
    label: 'Text Lesson',
    badge: 'text-green-700 bg-green-100',
  },
};

// ─── Info Card ────────────────────────────────────────────
function InfoCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-border-light hover:border-primary/20 hover:shadow-sm transition-all duration-200">
      <div className={`w-8 h-8 rounded-lg ${iconBg || 'bg-primary/10'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${iconColor || 'text-primary'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">{label}</p>
        <p className="text-sm font-semibold text-text-dark truncate mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────
function StatusBadge({ published, isTeacher }) {
  if (!isTeacher) return null;
  return published ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 border border-green-200">
      <FiEye className="w-3 h-3" />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
      <FiEyeOff className="w-3 h-3" />
      Draft
    </span>
  );
}

// ─── Loading State ────────────────────────────────────────
function LessonViewerLoading() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
          <div className="h-10 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-200 rounded-lg w-1/4" />
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────
function LessonViewerEmpty({ onBack }) {
  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors mb-6 group"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Course Content
      </button>
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-border-light">
        <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center mb-4">
          <FiBookOpen className="w-8 h-8 text-yellow-500" />
        </div>
        <h3 className="font-heading text-xl font-bold text-text-dark mb-2">Lesson Not Available</h3>
        <p className="text-sm text-text-body/70 max-w-sm text-center">
          The selected lesson could not be found. It may have been removed or is no longer available.
        </p>
      </div>
    </div>
  );
}

// ─── Video Viewer ─────────────────────────────────────────
function VideoViewer({ lesson }) {
  const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);
  if (!embedUrl) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-8 text-center">
        <FiPlay className="w-10 h-10 text-red-300 mx-auto mb-3" />
        <p className="font-semibold text-red-700 mb-1">Video Not Available</p>
        <p className="text-sm text-red-500/80">The video URL for this lesson is invalid or missing.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl overflow-hidden bg-black shadow-lg shadow-black/10">
      <div className="aspect-video relative">
        <iframe
          src={embedUrl}
          title={lesson.title || 'Lesson Video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// ─── PDF Viewer ───────────────────────────────────────────
function PdfViewer({ lesson }) {
  const [expanded, setExpanded] = useState(false);
  const pdfUrl = lesson.pdfUrl;

  if (!pdfUrl) {
    return (
      <div className="rounded-xl bg-gray-50 border border-border-light p-8 text-center">
        <FiFile className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="font-semibold text-text-light mb-1">PDF Not Available</p>
        <p className="text-sm text-text-light/60">No PDF file has been attached to this lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`rounded-2xl overflow-hidden border border-border-light bg-gray-50 transition-all duration-500 ease-in-out ${
          expanded ? 'h-[80vh] min-h-[600px]' : 'h-[450px]'
        }`}
      >
        <embed
          src={pdfUrl}
          type="application/pdf"
          className="w-full h-full"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-light text-sm text-text-dark font-medium hover:bg-bg-light hover:border-primary/30 transition-all"
        >
          {expanded ? (
            <><FiMinimize2 className="w-4 h-4 text-primary" /> Collapse PDF</>
          ) : (
            <><FiMaximize2 className="w-4 h-4 text-primary" /> Expand PDF</>
          )}
        </button>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md"
        >
          <FiDownload className="w-4 h-4" />
          Open PDF
        </a>
      </div>
    </div>
  );
}

// ─── Document Viewer ──────────────────────────────────────
function DocumentViewer({ lesson }) {
  const docUrl = lesson.documentUrl;

  if (!docUrl) {
    return (
      <div className="rounded-xl bg-gray-50 border border-border-light p-8 text-center">
        <FiFileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="font-semibold text-text-light mb-1">Document Not Available</p>
        <p className="text-sm text-text-light/60">No document has been attached to this lesson.</p>
      </div>
    );
  }

  const isPdf = docUrl.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden border border-border-light h-[450px] bg-gray-50">
        {isPdf ? (
          <embed src={docUrl} type="application/pdf" className="w-full h-full" />
        ) : (
          <iframe
            src={docUrl}
            title="Document"
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
      <a
        href={docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm shadow-sm hover:shadow-md"
      >
        <FiExternalLink className="w-4 h-4" />
        Open Document
      </a>
    </div>
  );
}

// ─── External Link Viewer ─────────────────────────────────
function ExternalLinkViewer({ lesson }) {
  const url = lesson.externalUrl;

  if (!url) {
    return (
      <div className="rounded-xl bg-gray-50 border border-border-light p-8 text-center">
        <FiExternalLink className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="font-semibold text-text-light mb-1">External Link Not Available</p>
        <p className="text-sm text-text-light/60">No external resource link has been added to this lesson.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-200/60 p-6 sm:p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <FiExternalLink className="w-7 h-7 text-purple-600" />
      </div>
      <h4 className="font-heading font-bold text-text-dark text-lg mb-1">External Resource</h4>
      <p className="text-sm text-text-body/70 mb-5 break-all max-w-lg mx-auto leading-relaxed">
        {url}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-sm shadow-sm hover:shadow-md"
      >
        <FiExternalLink className="w-4 h-4" />
        Visit Resource
      </a>
    </div>
  );
}

// ─── Text Viewer ──────────────────────────────────────────
function TextViewer({ lesson }) {
  const textContent = lesson.textContent;

  if (!textContent) {
    return (
      <div className="rounded-xl bg-gray-50 border border-border-light p-8 text-center">
        <FiFileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="font-semibold text-text-light mb-1">No Content</p>
        <p className="text-sm text-text-light/60">This text lesson has no content yet.</p>
      </div>
    );
  }

  // Simple markdown-like rendering for text content
  const renderTextContent = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();

      // Headings
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-bold text-text-dark mt-6 mb-2">{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold text-text-dark mt-8 mb-3">{trimmed.replace('## ', '')}</h2>;
      }
      if (trimmed.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold text-text-dark mt-8 mb-4">{trimmed.replace('# ', '')}</h1>;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={i} className="border-l-4 border-primary/30 pl-4 py-1 my-3 text-text-body italic bg-primary/5 rounded-r-lg">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }

      // List items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={i} className="text-text-body ml-5 list-disc pl-1 my-1">
            {trimmed.replace(/^[-*] /, '')}
          </li>
        );
      }

      // Numbered list items
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <li key={i} className="text-text-body ml-5 list-decimal pl-1 my-1">
            {trimmed.replace(/^\d+\.\s/, '')}
          </li>
        );
      }

      // Empty line
      if (!trimmed) {
        return <div key={i} className="h-3" />;
      }

      // Regular paragraph
      return <p key={i} className="text-text-body leading-relaxed my-2">{line}</p>;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-border-light p-6 sm:p-8 shadow-sm">
      <div className="prose prose-sm sm:prose-base max-w-none">
        {renderTextContent(textContent)}
      </div>
    </div>
  );
}

// ─── Nav Button ───────────────────────────────────────────
function NavButton({ direction, onClick, lessonTitle, disabled }) {
  if (disabled) {
    return (
      <div className="flex-1 p-4 rounded-xl border border-border-light/50 bg-gray-50/50 opacity-40 cursor-not-allowed select-none">
        <p className="text-xs text-text-light mb-1">
          {direction === 'prev' ? 'Previous' : 'Next'}
        </p>
        <p className="text-sm font-medium text-text-light/60 italic truncate">
          No {direction === 'prev' ? 'previous' : 'next'} lesson
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group flex-1 p-4 sm:p-5 rounded-xl border border-border-light bg-white hover:border-primary/30 hover:bg-primary/5 hover:shadow-md transition-all duration-200 text-left"
    >
      <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-1.5 flex items-center gap-1">
        {direction === 'prev' ? (
          <>
            <FiChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Previous Lesson
          </>
        ) : (
          <>
            Next Lesson
            <FiChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </p>
      <p className={`text-sm font-semibold text-text-dark truncate ${direction === 'next' ? 'text-right' : ''}`}>
        {lessonTitle}
      </p>
    </button>
  );
}

// ─── Main LessonViewerPage ────────────────────────────────
export default function LessonViewerPage({
  lesson,
  moduleName,
  lessons,
  lessonIndex,
  isTeacher,
  onBack,
  onEdit,
  onDelete,
  onPublish,
  onNavigate,
}) {
  // ── Defensive guards ──────────────────────────────────
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  const safeIndex = typeof lessonIndex === 'number' && lessonIndex >= 0 ? lessonIndex : 0;

  // ── Loading state ────────────────────────────────────
  if (!lesson && safeLessons.length > 0) {
    return <LessonViewerLoading />;
  }

  // ── Empty / not-found state ──────────────────────────
  if (!lesson) {
    return <LessonViewerEmpty onBack={onBack} />;
  }

  const type = lesson.lessonType || 'text';
  const typeInfo = typeConfig[type] || typeConfig.text;
  const TypeIcon = typeInfo.icon;
  const isPublished = lesson.isPublished;
  const isPreview = lesson.isPreviewFree;

  const prevLesson = safeIndex > 0 ? safeLessons[safeIndex - 1] : null;
  const nextLesson = safeIndex < safeLessons.length - 1 ? safeLessons[safeIndex + 1] : null;

  const lessonNumber = safeIndex + 1;
  const totalLessons = safeLessons.length;

  const handlePrev = () => {
    if (prevLesson) onNavigate(prevLesson, lessonIndex - 1);
  };

  const handleNext = () => {
    if (nextLesson) onNavigate(nextLesson, lessonIndex + 1);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* ── Back Button ──────────────────────────────── */}
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors mb-6"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Course Content
      </button>

      {/* ── Two-Column Layout ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* ─── LEFT COLUMN: Content ─────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Module + Lesson Number */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-primary/70">
              {moduleName || 'Module'}
            </span>
            <span className="text-text-light/30 hidden sm:inline">·</span>
            <span className="text-text-light">
              Lesson {lessonNumber}{totalLessons > 0 ? ` of ${totalLessons}` : ''}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-dark leading-tight">
            {lesson.title}
          </h1>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${typeInfo.badge} border border-current/20`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeInfo.label}
            </span>

            {/* Preview badge */}
            {isPreview && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                <FiStar className="w-3.5 h-3.5" />
                Free Preview
              </span>
            )}

            {/* Published / Draft badge (teacher only) */}
            <StatusBadge published={isPublished} isTeacher={isTeacher} />
          </div>

          {/* Description */}
          {lesson.shortDescription && (
            <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-2 flex items-center gap-2">
                <FiBookOpen className="w-3.5 h-3.5 text-primary" />
                About This Lesson
              </h4>
              <p className="text-sm sm:text-base text-text-body leading-relaxed">
                {lesson.shortDescription}
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="animate-fade-in">
            {type === 'video' && <VideoViewer lesson={lesson} />}
            {type === 'pdf' && <PdfViewer lesson={lesson} />}
            {type === 'document' && <DocumentViewer lesson={lesson} />}
            {type === 'external_link' && <ExternalLinkViewer lesson={lesson} />}
            {type === 'text' && <TextViewer lesson={lesson} />}
          </div>

          {/* Teacher Actions (mobile - below content) */}
          {isTeacher && (
            <div className="flex items-center gap-2 lg:hidden pt-2">
              <button
                onClick={() => onEdit(lesson)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border-light text-text-dark text-sm font-semibold hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(lesson)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => onPublish(lesson._id || lesson.id, isPublished)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border-light text-text-dark text-sm font-semibold hover:bg-bg-light transition-all"
              >
                {isPublished ? (
                  <><FiEyeOff className="w-4 h-4" /> Unpublish</>
                ) : (
                  <><FiEye className="w-4 h-4" /> Publish</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR: Info Cards ────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <FiLayers className="w-3.5 h-3.5 text-primary" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light">Lesson Details</h4>
          </div>

          {/* Module Name */}
          <InfoCard
            icon={FiBookOpen}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            label="Module"
            value={moduleName || '—'}
          />

          {/* Lesson Number */}
          <InfoCard
            icon={FiHash}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
            label="Lesson Number"
            value={`${lessonNumber}${totalLessons > 0 ? ` of ${totalLessons}` : ''}`}
          />

          {/* Duration */}
          {lesson.duration && (
            <InfoCard
              icon={FiClock}
              iconBg="bg-green-50"
              iconColor="text-green-500"
              label="Duration"
              value={lesson.duration}
            />
          )}

          {/* Lesson Type */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-border-light hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <div className={`w-8 h-8 rounded-lg ${typeInfo.badge.split(' ')[1]} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <TypeIcon className={`w-4 h-4 ${typeInfo.badge.split(' ')[0]}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Lesson Type</p>
              <p className="text-sm font-semibold text-text-dark capitalize mt-0.5">
                {typeInfo.label}
              </p>
            </div>
          </div>

          {/* Created Date */}
          {lesson.createdAt && (
            <InfoCard
              icon={FiCalendar}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              label="Created"
              value={formatShortDate(lesson.createdAt)}
            />
          )}

          {/* Updated Date */}
          {lesson.updatedAt && (
            <InfoCard
              icon={FiCalendar}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              label="Last Updated"
              value={formatShortDate(lesson.updatedAt)}
            />
          )}

          {/* Preview Status */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-border-light hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <div className={`w-8 h-8 rounded-lg ${isPreview ? 'bg-amber-50' : 'bg-gray-50'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              {isPreview ? (
                <FiStar className="w-4 h-4 text-amber-500" />
              ) : (
                <FiEyeOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Preview</p>
              <p className={`text-sm font-semibold mt-0.5 ${isPreview ? 'text-amber-600' : 'text-text-light'}`}>
                {isPreview ? 'Free Preview Available' : 'Not Available'}
              </p>
            </div>
          </div>

          {/* Published Status (teacher only) */}
          {isTeacher && (
            <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
              isPublished
                ? 'bg-green-50/50 border-green-200/60 hover:border-green-300'
                : 'bg-yellow-50/50 border-yellow-200/60 hover:border-yellow-300'
            }`}>
              <div className={`w-8 h-8 rounded-lg ${isPublished ? 'bg-green-100' : 'bg-yellow-100'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                {isPublished ? (
                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <FiXCircle className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Status</p>
                <p className={`text-sm font-semibold mt-0.5 ${isPublished ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isPublished ? 'Published' : 'Draft'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Teacher Actions (desktop) ─────────────────── */}
      {isTeacher && (
        <div className="hidden lg:flex items-center gap-3 mt-8 mb-2 pb-6 border-b border-border-light/60">
          <button
            onClick={() => onEdit(lesson)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-text-dark text-sm font-semibold hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit Lesson
          </button>
          <button
            onClick={() => onDelete(lesson)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete Lesson
          </button>
          <button
            onClick={() => onPublish(lesson._id || lesson.id, isPublished)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-text-dark text-sm font-semibold hover:bg-bg-light transition-all"
          >
            {isPublished ? (
              <><FiEyeOff className="w-4 h-4" /> Unpublish</>
            ) : (
              <><FiEye className="w-4 h-4" /> Publish</>
            )}
          </button>
        </div>
      )}

      {/* ── Bottom Navigation ────────────────────────── */}
      <div className="mt-6 space-y-3">
        {/* Position indicator */}
        {totalLessons > 0 && (
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
              <FiBookOpen className="w-3.5 h-3.5 text-primary/60" />
              <span className="text-xs font-semibold text-text-light">
                Lesson {lessonNumber} of {totalLessons}
              </span>
            </div>
          </div>
        )}

        {/* Previous / Next */}
        <div className="flex flex-col sm:flex-row gap-3">
          <NavButton
            direction="prev"
            onClick={handlePrev}
            lessonTitle={prevLesson?.title || ''}
            disabled={!prevLesson}
          />
          <NavButton
            direction="next"
            onClick={handleNext}
            lessonTitle={nextLesson?.title || ''}
            disabled={!nextLesson}
          />
        </div>
      </div>
    </div>
  );
}
