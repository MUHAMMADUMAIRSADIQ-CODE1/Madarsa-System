import { useState, useEffect } from 'react';
import {
  FiX, FiCheck, FiLoader, FiAlertCircle, FiAward, FiUser,
  FiExternalLink, FiClock,
} from 'react-icons/fi';
import teacherAcademicService from '../../services/teacherAcademicService';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function AssignmentGradeModal({ isOpen, onClose, onSave, submission, assignment }) {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const maxMarks = assignment?.totalMarks || 100;

  useEffect(() => {
    if (isOpen && submission) {
      setScore(submission.score !== undefined ? String(submission.score) : '');
      setFeedback(submission.feedback || '');
      setError(null);
      setSaving(false);
    }
  }, [isOpen, submission]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0) return;

    setSaving(true);
    setError(null);

    try {
      const assignmentId = assignment._id || assignment.id;
      const studentId = submission.student?._id || submission.student;
      await teacherAcademicService.gradeSubmission(assignmentId, studentId, {
        score: scoreNum,
        feedback: feedback.trim(),
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !submission) return null;

  const studentName = submission.student?.studentName || 'Student';
  const studentPhoto = submission.student?.studentPhoto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-border-light flex flex-col max-h-[90vh]">
        {/* ── Sticky Header ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border-light flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <FiAward className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-text-dark text-lg truncate">Grade Submission</h3>
              <p className="text-xs text-text-light truncate">{assignment?.title || 'Assignment'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light hover:text-text-dark hover:bg-gray-100 transition-colors flex-shrink-0">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5">
          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="grade-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Student Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-light/50 border border-border-light">
              {studentPhoto ? (
                <img src={studentPhoto} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-border-light flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-text-dark text-sm truncate">{studentName}</p>
                <p className="text-xs text-text-light">Submitted {formatDate(submission.submittedAt)}</p>
              </div>
            </div>

            {/* Submitted File */}
            {submission.fileUrl && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 min-w-0">
                  <FiExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-blue-700 truncate">Submitted File</span>
                </div>
                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                  View
                </a>
              </div>
            )}

            {/* Student Notes */}
            {submission.notes && (
              <div className="p-3 rounded-xl bg-gray-50 border border-border-light">
                <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-1">Student Notes</p>
                <p className="text-sm text-text-body">{submission.notes}</p>
              </div>
            )}

            {/* Score */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Score <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="number" value={score} onChange={(e) => setScore(e.target.value)}
                  min={0} max={maxMarks} step={0.5} required autoFocus disabled={saving}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm pr-20" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-light font-medium">/ {maxMarks}</span>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5">
                Feedback <span className="text-text-light font-normal">(optional)</span>
              </label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide constructive feedback to the student..." rows={3} disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none" />
            </div>
          </form>
        </div>

        {/* ── Sticky Footer ── */}
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-t border-border-light flex-shrink-0">
          <button type="button" onClick={onClose} disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-dark font-semibold hover:bg-bg-light transition-colors text-sm disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" form="grade-form" disabled={saving || score === '' || parseFloat(score) < 0}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
            Save Grade
          </button>
        </div>
      </div>
    </div>
  );
}
