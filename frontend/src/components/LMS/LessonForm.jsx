import { useState, useEffect } from 'react';
import {
  FiX, FiCheck, FiLoader, FiAlertCircle, FiPlay, FiFile,
  FiExternalLink, FiFileText,
} from 'react-icons/fi';
import lessonService from '../../services/lessonService';

const LESSON_TYPES = [
  { value: 'video', label: 'Video', icon: FiPlay, desc: 'YouTube video URL' },
  { value: 'pdf', label: 'PDF', icon: FiFile, desc: 'Upload or link a PDF' },
  { value: 'document', label: 'Document', icon: FiFileText, desc: 'Upload or link a document' },
  { value: 'external_link', label: 'External Link', icon: FiExternalLink, desc: 'Link to external resource' },
  { value: 'text', label: 'Text Lesson', icon: FiFileText, desc: 'Write lesson content' },
];

const defaultForm = {
  title: '',
  shortDescription: '',
  lessonType: 'video',
  videoUrl: '',
  pdfUrl: '',
  documentUrl: '',
  externalUrl: '',
  textContent: '',
  duration: '',
  isPreviewFree: false,
};

export default function LessonForm({ isOpen, onClose, onSave, editLesson, moduleId }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!editLesson;

  useEffect(() => {
    if (isOpen) {
      if (editLesson) {
        setForm({
          title: editLesson.title || '',
          shortDescription: editLesson.shortDescription || '',
          lessonType: editLesson.lessonType || 'video',
          videoUrl: editLesson.videoUrl || '',
          pdfUrl: editLesson.pdfUrl || '',
          documentUrl: editLesson.documentUrl || '',
          externalUrl: editLesson.externalUrl || '',
          textContent: editLesson.textContent || '',
          duration: editLesson.duration || '',
          isPreviewFree: editLesson.isPreviewFree || false,
        });
      } else {
        setForm(defaultForm);
      }
      setError(null);
      setSaving(false);
    }
  }, [isOpen, editLesson]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        lessonType: form.lessonType,
        duration: form.duration.trim(),
        isPreviewFree: form.isPreviewFree,
        ...(form.lessonType === 'video' && { videoUrl: form.videoUrl.trim() }),
        ...(form.lessonType === 'pdf' && { pdfUrl: form.pdfUrl.trim() }),
        ...(form.lessonType === 'document' && { documentUrl: form.documentUrl.trim() }),
        ...(form.lessonType === 'external_link' && { externalUrl: form.externalUrl.trim() }),
        ...(form.lessonType === 'text' && { textContent: form.textContent }),
        ...(isEditing ? {} : { module: moduleId }),
      };

      if (isEditing) {
        const res = await lessonService.updateLesson(editLesson._id || editLesson.id, payload);
        onSave(res?.data || res);
      } else {
        const res = await lessonService.createLesson(payload);
        onSave(res?.data || res);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const typeInfo = LESSON_TYPES.find((t) => t.value === form.lessonType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-border-light max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              {typeInfo && <typeInfo.icon className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <h3 className="font-heading font-bold text-text-dark text-lg">
                {isEditing ? 'Edit Lesson' : 'Create Lesson'}
              </h3>
              <p className="text-xs text-text-light">
                {isEditing ? 'Update lesson details' : 'Add a new lesson to this module'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light hover:text-text-dark hover:bg-bg-light transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1.5">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Introduction to Tajweed Rules"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
              autoFocus
              required
              disabled={saving}
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1.5">
              Short Description <span className="text-text-light font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => updateField('shortDescription', e.target.value)}
              placeholder="Brief description of this lesson"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
              disabled={saving}
            />
          </div>

          {/* Lesson Type */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">
              Lesson Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {LESSON_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = form.lessonType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField('lessonType', type.value)}
                    disabled={saving}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      isActive
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-light text-text-light hover:border-primary/30 hover:bg-bg-light'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-semibold leading-tight">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type-specific content fields */}
          <div className="rounded-xl bg-bg-light/50 border border-border-light p-4 space-y-4">
            <p className="text-xs font-semibold text-text-dark uppercase tracking-wider flex items-center gap-2">
              {typeInfo && <typeInfo.icon className="w-4 h-4" />}
              {typeInfo?.label} Content
            </p>

            {form.lessonType === 'video' && (
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1.5">YouTube Video URL</label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  required={form.lessonType === 'video'}
                  disabled={saving}
                />
              </div>
            )}

            {form.lessonType === 'pdf' && (
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1.5">PDF URL</label>
                <input
                  type="url"
                  value={form.pdfUrl}
                  onChange={(e) => updateField('pdfUrl', e.target.value)}
                  placeholder="https://example.com/lesson.pdf"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  required={form.lessonType === 'pdf'}
                  disabled={saving}
                />
              </div>
            )}

            {form.lessonType === 'document' && (
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1.5">Document URL</label>
                <input
                  type="url"
                  value={form.documentUrl}
                  onChange={(e) => updateField('documentUrl', e.target.value)}
                  placeholder="https://example.com/document.docx"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  required={form.lessonType === 'document'}
                  disabled={saving}
                />
              </div>
            )}

            {form.lessonType === 'external_link' && (
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1.5">External URL</label>
                <input
                  type="url"
                  value={form.externalUrl}
                  onChange={(e) => updateField('externalUrl', e.target.value)}
                  placeholder="https://example.com/resource"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  required={form.lessonType === 'external_link'}
                  disabled={saving}
                />
              </div>
            )}

            {form.lessonType === 'text' && (
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1.5">Lesson Content</label>
                <textarea
                  value={form.textContent}
                  onChange={(e) => updateField('textContent', e.target.value)}
                  placeholder="Write your lesson content here..."
                  rows={8}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-y font-mono"
                  required={form.lessonType === 'text'}
                  disabled={saving}
                />
              </div>
            )}
          </div>

          {/* Duration + Preview Free */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Duration <span className="text-text-light font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => updateField('duration', e.target.value)}
                placeholder="e.g. 15 min"
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Preview Free
              </label>
              <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border-light bg-white cursor-pointer hover:bg-bg-light/50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isPreviewFree}
                  onChange={(e) => updateField('isPreviewFree', e.target.checked)}
                  className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary/30"
                  disabled={saving}
                />
                <span className="text-sm text-text-body">
                  Students can preview this lesson without full access
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-border-light">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-dark font-semibold hover:bg-bg-light transition-colors text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheck className="w-4 h-4" />
              )}
              {isEditing ? 'Update Lesson' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
