import { useState } from 'react';
import {
  FiPlay, FiFile, FiExternalLink, FiFileText, FiEye,
  FiMaximize2, FiMinimize2,
} from 'react-icons/fi';

// ─── YouTube URL conversion ──────────────────────────────
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // bare video ID
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

// ─── Video Lesson ────────────────────────────────────────
function VideoViewer({ videoUrl }) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  if (!embedUrl) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        Invalid YouTube URL: {videoUrl}
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden bg-black">
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          title="Lesson Video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// ─── PDF Lesson ──────────────────────────────────────────
function PdfViewer({ pdfUrl }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className={`rounded-xl overflow-hidden border border-border-light transition-all duration-300 ${expanded ? 'h-[600px]' : 'h-[400px]'}`}>
        <embed
          src={pdfUrl}
          type="application/pdf"
          className="w-full h-full"
        />
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary-dark transition-colors"
      >
        {expanded ? (
          <><FiMinimize2 className="w-3.5 h-3.5" /> Collapse PDF</>
        ) : (
          <><FiMaximize2 className="w-3.5 h-3.5" /> Expand PDF</>
        )}
      </button>
    </div>
  );
}

// ─── Document Lesson ─────────────────────────────────────
function DocumentViewer({ documentUrl }) {
  const isPdf = documentUrl?.toLowerCase().endsWith('.pdf');

  return (
    <div className="rounded-xl overflow-hidden border border-border-light h-[400px]">
      {isPdf ? (
        <embed src={documentUrl} type="application/pdf" className="w-full h-full" />
      ) : (
        <iframe
          src={documentUrl}
          title="Document"
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin"
        />
      )}
    </div>
  );
}

// ─── External Link Lesson ────────────────────────────────
function ExternalLinkViewer({ externalUrl }) {
  return (
    <div className="rounded-xl bg-bg-light border border-border-light p-4 sm:p-6 text-center">
      <FiExternalLink className="w-10 h-10 text-primary/40 mx-auto mb-3" />
      <p className="text-sm text-text-body mb-2">External resource:</p>
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
      >
        <FiExternalLink className="w-4 h-4" />
        Open External Link
      </a>
      <p className="mt-2 text-xs text-text-light break-all">{externalUrl}</p>
    </div>
  );
}

// ─── Text Lesson ─────────────────────────────────────────
function TextViewer({ textContent }) {
  return (
    <div className="prose prose-sm sm:prose-base max-w-none text-text-body leading-relaxed whitespace-pre-line bg-bg-light/50 rounded-xl p-4 sm:p-6 border border-border-light">
      {textContent}
    </div>
  );
}

// ─── Main LessonViewer ───────────────────────────────────
export default function LessonViewer({ lesson }) {
  const type = lesson.lessonType;
  const content = lesson.content || {};

  const typeIcons = {
    video: { icon: FiPlay, label: 'Video', color: 'text-red-500 bg-red-50' },
    pdf: { icon: FiFile, label: 'PDF', color: 'text-red-600 bg-red-50' },
    document: { icon: FiFileText, label: 'Document', color: 'text-blue-600 bg-blue-50' },
    external_link: { icon: FiExternalLink, label: 'External Link', color: 'text-purple-600 bg-purple-50' },
    text: { icon: FiFileText, label: 'Text Lesson', color: 'text-green-600 bg-green-50' },
  };

  const typeInfo = typeIcons[type] || typeIcons.text;
  const TypeIcon = typeInfo.icon;

  return (
    <div className="space-y-4">
      {/* Type header */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${typeInfo.color}`}>
        <TypeIcon className="w-4 h-4" />
        {typeInfo.label}
      </div>

      {/* Content */}
      {type === 'video' && <VideoViewer videoUrl={lesson.videoUrl || content.videoUrl} />}
      {type === 'pdf' && <PdfViewer pdfUrl={lesson.pdfUrl || content.pdfUrl} />}
      {type === 'document' && <DocumentViewer documentUrl={lesson.documentUrl || content.documentUrl} />}
      {type === 'external_link' && <ExternalLinkViewer externalUrl={lesson.externalUrl || content.externalUrl} />}
      {type === 'text' && <TextViewer textContent={lesson.textContent || content.textContent} />}
    </div>
  );
}
