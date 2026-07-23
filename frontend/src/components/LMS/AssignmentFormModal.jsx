import { useState, useEffect } from 'react';
import {
  FiX, FiCheck, FiLoader, FiAlertCircle, FiFileText,
} from 'react-icons/fi';
import teacherAcademicService from '../../services/teacherAcademicService';

const defaultForm = {
  title: '',
  description: '',
  dueDate: '',
  totalMarks: 100,
  isPublished: true,
  resourceUrl: '',
};

export default function AssignmentFormModal({ isOpen, onClose, onSave, editAssignment, courseId, teacherId }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!editAssignment;

  useEffect(() => {
    if (isOpen) {
      if (editAssignment) {
        setForm({
          title: editAssignment.title || '',
          description: editAssignment.description || '',
          dueDate: editAssignment.dueDate
            ? new Date(editAssignment.dueDate).toISOString().slice(0, 10)
            : '',
          totalMarks: editAssignment.totalMarks ?? 100,
          isPublished: editAssignment.isPublished ?? true,
          resourceUrl: editAssignment.resourceUrl || '',
        });
      } else {
        setForm({ ...defaultForm });
      }
      setError(null);
      setSaving(false);
    }
  }, [isOpen, editAssignment]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: new Date(form.dueDate).toISOString(),
        totalMarks: Number(form.totalMarks) || 100,
        isPublished: form.isPublished,
        course: courseId,
        attachments: form.resourceUrl.trim()
          ? [{ name: 'Resource', url: form.resourceUrl.trim() }]
          : [],
      };

      // Backend validator requires teacher field; use userId (User._id) which
      // works because the service looks up the Teacher by user field
      const enrichedPayload = {
        ...payload,
        teacher: teacherId,
      };

      if (isEditing) {
        const res = await teacherAcademicService.updateAssignment(
          editAssignment._id || editAssignment.id,
          enrichedPayload
        );
        onSave(res?.data || res);
      } else {
        const res = await teacherAcademicService.createAssignment(enrichedPayload);
        onSave(res?.data || res);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-border-light max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiFileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-text-dark text-lg">
                {isEditing ? 'Edit Assignment' : 'Create Assignment'}
              </h3>
              <p className="text-xs text-text-light">
                {isEditing ? 'Update assignment details' : 'Add a new assignment to this course'}
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
              Assignment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Chapter 5: Tajweed Rules"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
              autoFocus
              required
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1.5">
              Instructions <span className="text-text-light font-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Provide detailed instructions for students..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none"
              disabled={saving}
            />
          </div>

          {/* Due Date + Total Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Total Marks
              </label>
              <input
                type="number"
                value={form.totalMarks}
                onChange={(e) => updateField('totalMarks', parseInt(e.target.value) || 0)}
                min={0}
                max={1000}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                disabled={saving}
              />
            </div>
          </div>

          {/* Resource URL */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1.5">
              Resource Link <span className="text-text-light font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={form.resourceUrl}
              onChange={(e) => updateField('resourceUrl', e.target.value)}
              placeholder="https://example.com/assignment-resource.pdf"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
              disabled={saving}
            />
          </div>

          {/* Published Toggle */}
          <div>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-light bg-white cursor-pointer hover:bg-bg-light/50 transition-colors">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => updateField('isPublished', e.target.checked)}
                className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary/30"
                disabled={saving}
              />
              <div>
                <span className="text-sm font-semibold text-text-dark">Publish immediately</span>
                <p className="text-xs text-text-light mt-0.5">Students will see this assignment right away</p>
              </div>
            </label>
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
              disabled={saving || !form.title.trim() || !form.dueDate}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheck className="w-4 h-4" />
              )}
              {isEditing ? 'Update Assignment' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
