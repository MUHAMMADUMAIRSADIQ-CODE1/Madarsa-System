import { useState, useEffect, useCallback } from 'react';
import {
  FiBell, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiMapPin, FiClock, FiCalendar, FiPaperclip, FiLink,
  FiChevronRight, FiChevronDown, FiChevronUp,
  FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle, FiRefreshCw,
  FiX, FiExternalLink, FiUser, FiSend,
  FiArrowLeft, FiInfo, FiDownload,
} from 'react-icons/fi';
import teacherAcademicService from '../../services/teacherAcademicService';
import studentPortalService from '../../services/studentPortalService';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatFullDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function truncateText(text, maxLen = 120) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '…';
}

// ─── Badge Components ────────────────────────────────────
export function PublishedBadge({ published }) {
  return published ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm">
      <FiEye className="w-3 h-3" />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm">
      <FiEyeOff className="w-3 h-3" />
      Draft
    </span>
  );
}

export function PinnedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm">
      <FiMapPin className="w-3 h-3" />
      Pinned
    </span>
  );
}

export function ResourceBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200 shadow-sm">
      <FiLink className="w-3 h-3" />
      Resource
    </span>
  );
}

// ─── Info Card (matching Lesson Viewer sidebar) ──────────
export function InfoCard({ icon: Icon, iconBg, iconColor, label, value }) {
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

// ─── Resource Card ───────────────────────────────────────
export function ResourceCard({ resourceLink }) {
  if (!resourceLink) return null;

  return (
    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-200/60 p-4 sm:p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
          <FiLink className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">Attached Resource</h4>
          <p className="text-[11px] text-purple-600/70">External link</p>
        </div>
      </div>
      <a
        href={resourceLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-purple-200/60 hover:border-purple-300 hover:shadow-sm transition-all group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <FiExternalLink className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <span className="text-xs font-medium text-text-dark truncate group-hover:text-purple-700 transition-colors">
            {resourceLink.length > 50 ? resourceLink.slice(0, 50) + '…' : resourceLink}
          </span>
        </div>
        <span className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-bold hover:bg-purple-700 transition-colors">
          Open
        </span>
      </a>
    </div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────
function AnnouncementListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-border-light p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-gray-200 rounded-lg" />
                <div className="h-5 w-16 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-5 w-3/4 bg-gray-200 rounded-lg" />
              <div className="h-4 w-full bg-gray-200 rounded-lg" />
              <div className="h-4 w-2/3 bg-gray-200 rounded-lg" />
              <div className="flex gap-4">
                <div className="h-4 w-28 bg-gray-200 rounded-lg" />
                <div className="h-4 w-24 bg-gray-200 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-1">
              <div className="h-7 w-7 bg-gray-200 rounded-lg" />
              <div className="h-7 w-7 bg-gray-200 rounded-lg" />
              <div className="h-7 w-7 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-5 w-32 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-border-light p-6 space-y-4">
            <div className="h-7 w-3/4 bg-gray-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-gray-200 rounded-lg" />
            <div className="h-4 w-full bg-gray-200 rounded-lg" />
            <div className="h-4 w-5/6 bg-gray-200 rounded-lg" />
            <div className="h-20 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ────────────────────────────────
function DeleteConfirm({ isOpen, onClose, onConfirm, title, deleting }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-border-light p-6 animate-fade-in">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FiTrash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-heading font-bold text-text-dark text-lg mb-2">Delete Announcement</h3>
          <p className="text-sm text-text-body mb-1">Are you sure you want to delete:</p>
          <p className="text-sm font-semibold text-text-dark mb-4">&ldquo;{title}&rdquo;</p>
          <p className="text-xs text-text-light mb-6 flex items-center justify-center gap-1">
            <FiAlertCircle className="w-3.5 h-3.5" />
            This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-dark font-semibold hover:bg-bg-light transition-colors text-sm disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {deleting ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Announcement Form Modal ─────────────────────────────
export function AnnouncementFormModal({ isOpen, onClose, onSave, announcement }) {
  const [form, setForm] = useState({
    teacher: '',
    title: '',
    content: '',
    targetType: 'all',
    targetCourse: '',
    priority: 'normal',
    isPublished: true,
    isPinned: false,
    resourceLink: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = !!announcement;

  useEffect(() => {
    if (announcement) {
      setForm({
        teacher: announcement.teacher || '',
        title: announcement.title || '',
        content: announcement.content || '',
        targetType: announcement.targetType || 'all',
        targetCourse: announcement.targetCourse?._id || announcement.targetCourse || '',
        priority: announcement.priority || 'normal',
        isPublished: announcement.isPublished !== false,
        isPinned: announcement.isPinned || false,
        resourceLink: announcement.resourceLink || '',
      });
    } else {
      setForm({
        teacher: '',
        title: '',
        content: '',
        targetType: 'all',
        targetCourse: '',
        priority: 'normal',
        isPublished: true,
        isPinned: false,
        resourceLink: '',
      });
    }
    setError(null);
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(form, announcement);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-border-light animate-fade-in flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Sticky Header ── */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border-light flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FiBell className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-text-dark text-lg truncate">
                {isEditing ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <p className="text-xs text-text-light truncate">
                {isEditing ? 'Update the announcement details below' : 'Create a new announcement for your course'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light hover:text-text-dark hover:bg-gray-100 transition-colors flex-shrink-0">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form id="announcement-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Enter announcement title"
                required
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm transition-all"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write your announcement content..."
                required
                rows={4}
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm resize-none transition-all"
              />
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-1.5">Target</label>
                <select
                  value={form.targetType}
                  onChange={e => setForm(f => ({ ...f, targetType: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm transition-all"
                >
                  <option value="all">All Students</option>
                  <option value="course">Specific Course</option>
                  <option value="batch">Specific Batch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm transition-all"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Resource Link */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Resource Link <span className="text-text-light font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  type="url"
                  value={form.resourceLink}
                  onChange={e => setForm(f => ({ ...f, resourceLink: e.target.value }))}
                  placeholder="https://example.com/resource.pdf"
                  className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    form.isPublished ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    form.isPublished ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
                <span className="text-sm font-medium text-text-dark">Publish immediately</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    form.isPinned ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    form.isPinned ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
                <span className="text-sm font-medium text-text-dark">Pin to top</span>
              </label>
            </div>
          </form>
        </div>

        {/* ── Sticky Footer ── */}
        <div className="flex items-center gap-3 px-5 sm:px-7 py-4 border-t border-border-light flex-shrink-0">
          <button
            type="submit"
            form="announcement-form"
            disabled={saving || !form.title.trim() || !form.content.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all text-sm disabled:opacity-50 shadow-sm hover:shadow-md"
          >
            {saving ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiSend className="w-4 h-4" />
            )}
            {isEditing ? 'Update Announcement' : 'Create Announcement'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-2.5 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-all text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Teacher Announcement Card ───────────────────────────
function TeacherAnnouncementCard({ announcement, onEdit, onDelete, onPin, onPublish, onView }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(announcement)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(announcement); } }}
      className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-200 cursor-pointer group"
    >
      <div className="p-4 sm:p-5">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <PublishedBadge published={announcement.isPublished} />
          {announcement.isPinned && <PinnedBadge />}
          {announcement.resourceLink && <ResourceBadge />}
        </div>

        {/* Title + Actions */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-bold text-text-dark text-sm sm:text-base leading-snug group-hover:text-primary transition-colors flex-1 min-w-0">
            {announcement.title}
          </h4>
          <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onPin(announcement); }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                announcement.isPinned
                  ? 'text-indigo-500 hover:bg-indigo-50'
                  : 'text-text-light/50 hover:text-indigo-500 hover:bg-indigo-50'
              }`}
              title={announcement.isPinned ? 'Unpin' : 'Pin'}
            >
              <FiMapPin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPublish(announcement); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light/50 hover:text-primary hover:bg-primary/10 transition-all"
              title={announcement.isPublished ? 'Unpublish' : 'Publish'}
            >
              {announcement.isPublished ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(announcement); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light/50 hover:text-primary hover:bg-primary/10 transition-all"
              title="Edit"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(announcement); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light/50 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Delete"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        {announcement.content && (
          <p className="text-xs sm:text-sm text-text-body/70 mt-2.5 line-clamp-2 leading-relaxed border-l-2 border-primary/15 pl-3">
            {announcement.content}
          </p>
        )}

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-text-light">
          <span className="flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5 text-primary/50" />
            {formatDateTime(announcement.publishedAt || announcement.createdAt)}
          </span>
          {announcement.resourceLink && (
            <span className="flex items-center gap-1.5">
              <FiPaperclip className="w-3.5 h-3.5 text-purple-500/70" />
              Resource attached
            </span>
          )}
        </div>

        {/* Dates Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-text-light/60">
          <span>Created {formatDate(announcement.createdAt)}</span>
          {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
            <span>Updated {formatDate(announcement.updatedAt)}</span>
          )}
        </div>
      </div>

      {/* View Details Footer */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-border-light/50 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-primary flex items-center gap-1.5 group-hover:gap-2 transition-all">
          <FiInfo className="w-3.5 h-3.5" />
          View Details
        </span>
        <FiChevronRight className="w-3.5 h-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

// ─── Student Announcement Card ───────────────────────────
function StudentAnnouncementCard({ announcement, onView }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(announcement)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(announcement); } }}
      className={`bg-white rounded-xl border overflow-hidden hover:shadow-md hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-200 cursor-pointer group ${
        announcement.isPinned ? 'border-indigo-200/60 bg-gradient-to-r from-indigo-50/30 to-transparent' : 'border-border-light'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {announcement.isPinned && <PinnedBadge />}
          {announcement.resourceLink && <ResourceBadge />}
        </div>

        {/* Title */}
        <h4 className="font-bold text-text-dark text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">
          {announcement.title}
        </h4>

        {/* Content Preview */}
        {announcement.content && (
          <p className="text-xs sm:text-sm text-text-body/70 mt-2 line-clamp-2 leading-relaxed">
            {announcement.content}
          </p>
        )}

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-text-light">
          <span className="flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5 text-primary/50" />
            {formatFullDate(announcement.publishedAt || announcement.createdAt)}
          </span>
          {announcement.teacher && (
            <span className="flex items-center gap-1.5">
              <FiUser className="w-3.5 h-3.5 text-primary/50" />
              {announcement.teacher.fullName || 'Teacher'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Announcement Detail View ────────────────────────────
function AnnouncementDetail({ announcement, onBack, isTeacher, onEdit, onDelete, onPin, onPublish }) {
  if (!announcement) return <DetailSkeleton />;

  const teacherName = announcement.teacher?.fullName || '—';

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors mb-6"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Announcements
      </button>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ─── LEFT COLUMN ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + Badges */}
          <div className="flex flex-wrap items-start gap-3">
            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark flex-1 min-w-0 leading-tight">
              {announcement.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              <PublishedBadge published={announcement.isPublished} />
              {announcement.isPinned && <PinnedBadge />}
            </div>
          </div>

          {/* Quick Meta Row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-text-light">
            <span className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4 text-primary/50" />
              Published: {formatFullDate(announcement.publishedAt || announcement.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <FiClock className="w-4 h-4 text-primary/50" />
              Last updated: {formatDateTime(announcement.updatedAt || announcement.createdAt)}
            </span>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-3 flex items-center gap-2">
              <FiBell className="w-3.5 h-3.5 text-primary" />
              Announcement Details
            </h4>
            <div className="text-sm sm:text-base text-text-body leading-relaxed whitespace-pre-line">
              {announcement.content || (
                <span className="text-text-light/60 italic">No content provided.</span>
              )}
            </div>
          </div>

          {/* Resource Card */}
          {announcement.resourceLink && (
            <ResourceCard resourceLink={announcement.resourceLink} />
          )}

          {/* Teacher Actions */}
          {isTeacher && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onPublish(announcement)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  announcement.isPublished
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {announcement.isPublished ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                {announcement.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => onPin(announcement)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  announcement.isPinned
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                <FiMapPin className="w-4 h-4" />
                {announcement.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={() => onEdit(announcement)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-all"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(announcement)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-100 text-red-700 font-semibold text-sm hover:bg-red-200 transition-all"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR: Info Cards ────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <FiBell className="w-3.5 h-3.5 text-primary" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light">Announcement Info</h4>
          </div>

          <InfoCard
            icon={FiUser}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            label="Teacher"
            value={teacherName}
          />

          <InfoCard
            icon={announcement.isPublished ? FiEye : FiEyeOff}
            iconBg={announcement.isPublished ? 'bg-green-50' : 'bg-yellow-50'}
            iconColor={announcement.isPublished ? 'text-green-500' : 'text-yellow-500'}
            label="Status"
            value={announcement.isPublished ? 'Published' : 'Draft'}
          />

          <InfoCard
            icon={FiCalendar}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            label="Published Date"
            value={formatFullDate(announcement.publishedAt) || '—'}
          />

          <InfoCard
            icon={FiCalendar}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
            label="Created"
            value={formatFullDate(announcement.createdAt) || '—'}
          />

          {announcement.updatedAt && (
            <InfoCard
              icon={FiCalendar}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              label="Last Updated"
              value={formatFullDate(announcement.updatedAt) || '—'}
            />
          )}

          <InfoCard
            icon={FiPaperclip}
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
            label="Resource"
            value={announcement.resourceLink ? 'Attached' : 'None'}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <FiAlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="font-heading text-lg font-bold text-text-dark mb-2">Failed to Load Announcements</h3>
      <p className="text-sm text-text-body/70 text-center max-w-sm mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light hover:border-primary/30 transition-all text-sm"
      >
        <FiRefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

// ─── Empty State (Teacher) ───────────────────────────────
function TeacherEmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <FiBell className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-2">No Announcements Yet</h3>
      <p className="text-sm text-text-body/70 text-center max-w-md mb-8 leading-relaxed">
        Keep your students informed. Create announcements to share updates, 
        reminders, and important course information.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all text-sm shadow-sm hover:shadow-md"
      >
        <FiPlus className="w-5 h-5" />
        Create Announcement
      </button>
    </div>
  );
}

// ─── Empty State (Student) ───────────────────────────────
function StudentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
        <FiBell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-2">No Announcements Yet</h3>
      <p className="text-sm text-text-body/70 text-center max-w-md leading-relaxed">
        There are no announcements for this course yet. 
        Check back later when your teacher posts updates.
      </p>
    </div>
  );
}

// ─── Section Separator ───────────────────────────────────
function SectionSeparator({ label, count }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <FiMapPin className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-bold text-text-dark">{label}</h3>
      </div>
      <div className="flex-1 h-px bg-border-light" />
      {count > 0 && (
        <span className="text-xs font-medium text-text-light">{count}</span>
      )}
    </div>
  );
}

// ─── Loading State ───────────────────────────────────────
function LoadingState() {
  return <AnnouncementListSkeleton />;
}

// ─── Main CourseAnnouncementTab ──────────────────────────
export default function CourseAnnouncementTab({ course, role }) {
  const isTeacher = role === 'teacher';
  const { user } = useAuth();

  const courseId = course?._id || course?.id || course?.course?._id;
  const userId = user?._id || user?.id;

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  // Detail view
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // ─── Fetch Announcements ──────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    if (!courseId || !userId) return;
    setLoading(true);
    setError(null);
    try {
      if (isTeacher) {
        const res = await teacherAcademicService.getAnnouncements(userId, { course: courseId });
        const data = res?.data || res;
        const items = data?.announcements || data || [];
        setAnnouncements(items);
        // Sync selectedAnnouncement with fresh data if detail view is open
        setSelectedAnnouncement(prev => {
          if (!prev) return null;
          const fresh = items.find(a => (a._id || a.id) === (prev._id || prev.id));
          return fresh || prev;
        });
      } else {
        const res = await studentPortalService.getCourseAnnouncements(courseId);
        const data = res?.data || res;
        const items = data || [];
        setAnnouncements(items);
        // Sync selectedAnnouncement with fresh data if detail view is open
        setSelectedAnnouncement(prev => {
          if (!prev) return null;
          const fresh = items.find(a => (a._id || a.id) === (prev._id || prev.id));
          return fresh || prev;
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [courseId, userId, isTeacher]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ─── Handlers ──────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditAnnouncement(null);
    setMutationError(null);
    setShowForm(true);
  }, []);

  const handleOpenEdit = useCallback((announcement) => {
    setEditAnnouncement(announcement);
    setMutationError(null);
    setShowForm(true);
  }, []);

  const handleFormSave = useCallback(async (form, existing) => {
    // Auto-populate targetCourse from the current course context
    // when targetType is 'course' but no specific course ID was provided
    const resolvedTargetCourse = (form.targetType === 'course')
      ? (form.targetCourse || courseId)
      : undefined;

    const payload = {
      teacher: form.teacher || userId,
      title: form.title.trim(),
      content: form.content.trim(),
      targetType: form.targetType,
      targetCourse: resolvedTargetCourse,
      priority: form.priority,
      isPublished: form.isPublished,
      isPinned: form.isPinned,
      resourceLink: form.resourceLink.trim() || undefined,
    };

    if (existing) {
      await teacherAcademicService.updateAnnouncement(existing._id, payload);
    } else {
      await teacherAcademicService.createAnnouncement(payload);
    }
    // Navigate back to list after edit, since the detail view may show stale edited fields
    setSelectedAnnouncement(null);
    fetchAnnouncements();
  }, [userId, fetchAnnouncements]);

  const handleDeleteClick = useCallback((announcement) => {
    setDeleteTarget(announcement);
    setShowDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await teacherAcademicService.deleteAnnouncement(deleteTarget._id);
      setShowDelete(false);
      setDeleteTarget(null);
      if (selectedAnnouncement?._id === deleteTarget._id) {
        setSelectedAnnouncement(null);
      }
      fetchAnnouncements();
    } catch (err) {
      setMutationError(err.message || 'Failed to delete announcement');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, selectedAnnouncement, fetchAnnouncements]);

  const handlePinToggle = useCallback(async (announcement) => {
    const prevId = announcement._id || announcement.id;
    try {
      await teacherAcademicService.pinAnnouncement(prevId);
      fetchAnnouncements();
    } catch (err) {
      setMutationError(err.message || 'Failed to toggle pin');
    }
  }, [fetchAnnouncements]);

  const handlePublishToggle = useCallback(async (announcement) => {
    const prevId = announcement._id || announcement.id;
    try {
      await teacherAcademicService.publishAnnouncement(prevId);
      fetchAnnouncements();
    } catch (err) {
      setMutationError(err.message || 'Failed to toggle publish');
    }
  }, [fetchAnnouncements]);

  const handleViewDetail = useCallback((announcement) => {
    setSelectedAnnouncement(announcement);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedAnnouncement(null);
  }, []);

  // ─── Split pinned vs normal ────────────────────────────
  const pinnedAnnouncements = announcements.filter(a => a.isPinned);
  const normalAnnouncements = announcements.filter(a => !a.isPinned);

  // ─── Detail View ───────────────────────────────────────
  const showDetailView = !!selectedAnnouncement;

  // Modals must be OUTSIDE the conditional return so they mount in both list and detail views
  return (
    <>
      {showDetailView ? (
        <AnnouncementDetail
          announcement={selectedAnnouncement}
          onBack={handleBackToList}
          isTeacher={isTeacher}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteClick}
          onPin={handlePinToggle}
          onPublish={handlePublishToggle}
        />
      ) : (
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-text-dark flex items-center gap-2">
                <FiBell className="w-5 h-5 text-primary" />
                Announcements
              </h3>
              <p className="text-sm text-text-light mt-1">
                {announcements.length > 0
                  ? `${announcements.length} announcement${announcements.length !== 1 ? 's' : ''}`
                  : 'Course announcements and updates'}
              </p>
            </div>
            {isTeacher && (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all text-sm shadow-sm hover:shadow-md"
              >
                <FiPlus className="w-4 h-4" />
                New Announcement
              </button>
            )}
          </div>

          {/* Mutation Error */}
          {mutationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              {mutationError}
              <button onClick={() => setMutationError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && <LoadingState />}

          {/* Error State */}
          {!loading && error && <ErrorState message={error} onRetry={fetchAnnouncements} />}

          {/* Empty State */}
          {!loading && !error && announcements.length === 0 && (
            isTeacher
              ? <TeacherEmptyState onCreate={handleOpenCreate} />
              : <StudentEmptyState />
          )}

          {/* Announcement Lists */}
          {!loading && !error && announcements.length > 0 && (
            <div className="space-y-6">
              {/* Pinned Announcements */}
              {pinnedAnnouncements.length > 0 && (
                <div>
                  <SectionSeparator label="Pinned" count={pinnedAnnouncements.length} />
                  <div className="space-y-3">
                    {pinnedAnnouncements.map(ann => (
                      isTeacher ? (
                        <TeacherAnnouncementCard
                          key={ann._id}
                          announcement={ann}
                          onEdit={handleOpenEdit}
                          onDelete={handleDeleteClick}
                          onPin={handlePinToggle}
                          onPublish={handlePublishToggle}
                          onView={handleViewDetail}
                        />
                      ) : (
                        <StudentAnnouncementCard
                          key={ann._id}
                          announcement={ann}
                          onView={handleViewDetail}
                        />
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Normal Announcements */}
              {normalAnnouncements.length > 0 && (
                <div>
                  {pinnedAnnouncements.length > 0 && (
                    <SectionSeparator label="All Announcements" count={normalAnnouncements.length} />
                  )}
                  <div className="space-y-3">
                    {normalAnnouncements.map(ann => (
                      isTeacher ? (
                        <TeacherAnnouncementCard
                          key={ann._id}
                          announcement={ann}
                          onEdit={handleOpenEdit}
                          onDelete={handleDeleteClick}
                          onPin={handlePinToggle}
                          onPublish={handlePublishToggle}
                          onView={handleViewDetail}
                        />
                      ) : (
                        <StudentAnnouncementCard
                          key={ann._id}
                          announcement={ann}
                          onView={handleViewDetail}
                        />
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── MODALS: Always rendered regardless of list/detail view ─── */}
      <AnnouncementFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditAnnouncement(null); }}
        onSave={handleFormSave}
        announcement={editAnnouncement}
      />

      <DeleteConfirm
        isOpen={showDelete}
        onClose={() => { setShowDelete(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.title || ''}
        deleting={deleting}
      />
    </>
  );
}
