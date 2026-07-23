import { useState, useEffect } from 'react';
import {
  FiX, FiCheck, FiLoader, FiAlertCircle, FiBarChart2,
} from 'react-icons/fi';
import teacherAcademicService from '../../services/teacherAcademicService';

const defaultForm = {
  examName: '',
  examDate: '',
  totalMarks: 100,
  obtainedMarks: 0,
  remarks: '',
  status: 'draft',
};

export default function ResultFormModal({ isOpen, onClose, onSave, editResult, courseId, teacherId, students }) {
  const [form, setForm] = useState(defaultForm);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!editResult;

  useEffect(() => {
    if (isOpen) {
      if (editResult) {
        setForm({
          examName: editResult.examName || '',
          examDate: editResult.examDate
            ? new Date(editResult.examDate).toISOString().slice(0, 10)
            : '',
          totalMarks: editResult.totalMarks ?? 100,
          obtainedMarks: editResult.obtainedMarks ?? 0,
          remarks: editResult.remarks || '',
          status: editResult.status || 'draft',
        });
        setSelectedStudent(editResult.student?._id || editResult.student || '');
      } else {
        setForm({ ...defaultForm });
        setSelectedStudent('');
      }
      setError(null);
      setSaving(false);
    }
  }, [isOpen, editResult]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-calculate percentage for preview
  const percentage = form.totalMarks > 0
    ? Math.round((form.obtainedMarks / form.totalMarks) * 100)
    : 0;

  const previewGrade = percentage >= 90 ? 'A+' :
    percentage >= 80 ? 'A' :
    percentage >= 70 ? 'B+' :
    percentage >= 60 ? 'B' :
    percentage >= 50 ? 'C' :
    percentage >= 40 ? 'D' : 'F';

  const gradeColor = percentage >= 90 ? 'text-green-600 bg-green-50 border-green-200' :
    percentage >= 80 ? 'text-blue-600 bg-blue-50 border-blue-200' :
    percentage >= 70 ? 'text-indigo-600 bg-indigo-50 border-indigo-200' :
    percentage >= 60 ? 'text-purple-600 bg-purple-50 border-purple-200' :
    percentage >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-red-600 bg-red-50 border-red-200';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.examName.trim() || !selectedStudent) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        examName: form.examName.trim(),
        examDate: form.examDate ? new Date(form.examDate).toISOString() : undefined,
        totalMarks: Number(form.totalMarks) || 100,
        obtainedMarks: Number(form.obtainedMarks) || 0,
        remarks: form.remarks.trim(),
        status: form.status,
        student: selectedStudent,
        course: courseId,
        teacher: teacherId,
      };

      if (isEditing) {
        await teacherAcademicService.updateResult(
          editResult._id || editResult.id,
          payload
        );
      } else {
        await teacherAcademicService.createResult(payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save result');
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
              <FiBarChart2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-text-dark text-lg">
                {isEditing ? 'Edit Result' : 'Create Result'}
              </h3>
              <p className="text-xs text-text-light">
                {isEditing ? 'Update student result details' : 'Add a new result for a student'}
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

          {/* Student Select (only when creating) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                required
                disabled={saving}
              >
                <option value="">Select a student...</option>
                {(students || []).map((s) => {
                  const studentName = s.studentName || s.name || 'Unnamed';
                  const sid = s._id || s.id;
                  return (
                    <option key={sid} value={sid}>
                      {studentName} {s.studentId ? `(${s.studentId})` : ''}
                    </option>
                  );
                })}
              </select>
              {(!students || students.length === 0) && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  No students available. Ensure students are assigned to this course.
                </p>
              )}
            </div>
          )}

          {/* Exam Name */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1.5">
              Exam Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.examName}
              onChange={(e) => updateField('examName', e.target.value)}
              placeholder="e.g. Monthly Test - July 2026"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
              autoFocus
              required
              disabled={saving}
            />
          </div>

          {/* Exam Date + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Exam Date <span className="text-text-light font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={form.examDate}
                onChange={(e) => updateField('examDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                disabled={saving}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Total Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.totalMarks}
                onChange={(e) => updateField('totalMarks', parseInt(e.target.value) || 0)}
                min={1}
                max={1000}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Obtained Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.obtainedMarks}
                onChange={(e) => updateField('obtainedMarks', parseInt(e.target.value) || 0)}
                min={0}
                max={form.totalMarks}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                required
                disabled={saving}
              />
            </div>
          </div>

          {/* Preview Card - shows live percentage & grade */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${gradeColor} bg-opacity-50`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Preview</p>
              <p className="text-sm font-semibold mt-0.5">
                {form.obtainedMarks} / {form.totalMarks} = {percentage}%
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${gradeColor.split(' ')[0]}`}>
                {previewGrade}
              </div>
              <p className="text-xs opacity-70 mt-0.5">
                {percentage >= 90 ? 'Excellent' :
                 percentage >= 80 ? 'Very Good' :
                 percentage >= 70 ? 'Good' :
                 percentage >= 60 ? 'Above Average' :
                 percentage >= 50 ? 'Average' :
                 'Needs Improvement'}
              </p>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1.5">
              Remarks <span className="text-text-light font-normal">(optional)</span>
            </label>
            <textarea
              value={form.remarks}
              onChange={(e) => updateField('remarks', e.target.value)}
              placeholder="Add any remarks or feedback for this result..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none"
              disabled={saving}
            />
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
              disabled={saving || !form.examName.trim() || (!isEditing && !selectedStudent)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheck className="w-4 h-4" />
              )}
              {isEditing ? 'Update Result' : 'Create Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
