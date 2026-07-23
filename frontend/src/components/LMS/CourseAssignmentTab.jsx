import { useState, useEffect, useCallback } from 'react';
import {
  FiFileText, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiClock, FiCalendar, FiAward, FiUsers, FiChevronRight,
  FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle, FiRefreshCw,
  FiX, FiExternalLink, FiUpload, FiMessageSquare,
  FiDownload, FiLink,
  FiArrowLeft,
} from 'react-icons/fi';
import teacherAcademicService from '../../services/teacherAcademicService';
import studentPortalService from '../../services/studentPortalService';
import { useAuth } from '../../context/AuthContext';
import AssignmentFormModal from './AssignmentFormModal';
import AssignmentGradeModal from './AssignmentGradeModal';

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

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000; // Within 3 days
}

export function hasResource(assignment) {
  return assignment.attachments?.length > 0 ||
    assignment.resourceUrl ||
    assignment.resourceLink;
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

function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm">
      <FiClock className="w-3 h-3" />
      Overdue
    </span>
  );
}

function DueSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
      <FiClock className="w-3 h-3" />
      Due Soon
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

function StudentStatusBadge({ status, isLate }) {
  if (status === 'graded') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm">
        <FiCheckCircle className="w-3 h-3" />
        Graded
      </span>
    );
  }
  if (status === 'submitted') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
        <FiUpload className="w-3 h-3" />
        Submitted
      </span>
    );
  }
  if (isLate) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm">
        <FiClock className="w-3 h-3" />
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">
      <FiFileText className="w-3 h-3" />
      Pending
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
export function ResourceCard({ attachments }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-200/60 p-4 sm:p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
          <FiLink className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">Attached Resource</h4>
          <p className="text-[11px] text-purple-600/70">{attachments.length} file{attachments.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="space-y-2">
        {attachments.map((att, i) => (
          <a
            key={i}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-purple-200/60 hover:border-purple-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                {att.url?.toLowerCase().endsWith('.pdf') ? (
                  <FiDownload className="w-3.5 h-3.5 text-purple-500" />
                ) : (
                  <FiExternalLink className="w-3.5 h-3.5 text-purple-500" />
                )}
              </div>
              <span className="text-xs font-medium text-text-dark truncate group-hover:text-purple-700 transition-colors">
                {att.name || 'Resource File'}
              </span>
            </div>
            <span className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-bold hover:bg-purple-700 transition-colors">
              Open
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton Loader: Assignment List ────────────────────
function AssignmentListSkeleton() {
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
              <div className="flex gap-4">
                <div className="h-4 w-28 bg-gray-200 rounded-lg" />
                <div className="h-4 w-20 bg-gray-200 rounded-lg" />
                <div className="h-4 w-24 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-lg" />
            </div>
            <div className="flex gap-1">
              <div className="h-7 w-7 bg-gray-200 rounded-lg" />
              <div className="h-7 w-7 bg-gray-200 rounded-lg" />
              <div className="h-7 w-7 bg-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="mt-3 h-8 w-full bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton Loader: Detail View ────────────────────────
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
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-gray-200 rounded-lg" />
              <div className="h-4 w-20 bg-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-border-light p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded-lg" />
                  <div className="h-3 w-24 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded-lg" />
              </div>
            ))}
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
          <h3 className="font-heading font-bold text-text-dark text-lg mb-2">Delete Assignment</h3>
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

// ─── Teacher Assignment Card (Polished) ──────────────────
function TeacherAssignmentCard({ assignment, onEdit, onDelete, onPublish, onViewSubmissions }) {
  const isPub = assignment.isPublished;
  const subCount = assignment.submissionCount ?? assignment.submissions?.length ?? 0;
  const overDue = isOverdue(assignment.dueDate);
  const hasRes = hasResource(assignment);
  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
      <div className="p-4 sm:p-5">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <PublishedBadge published={isPub} />
          {overDue && <OverdueBadge />}
          {hasRes && <ResourceBadge />}
        </div>

        {/* Title + Actions */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-bold text-text-dark text-sm sm:text-base leading-snug group-hover:text-primary transition-colors flex-1 min-w-0">
            {assignment.title}
          </h4>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onPublish(assignment); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light/50 hover:text-primary hover:bg-primary/10 transition-all"
              title={isPub ? 'Unpublish' : 'Publish'}
            >
              {isPub ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(assignment); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light/50 hover:text-primary hover:bg-primary/10 transition-all"
              title="Edit"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(assignment); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light/50 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Delete"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-text-light">
          <span className="flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5 text-primary/50" />
            Due {formatDate(assignment.dueDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <FiAward className="w-3.5 h-3.5 text-amber-500/70" />
            {assignment.totalMarks || 100} marks
          </span>
          <span className="flex items-center gap-1.5">
            <FiUsers className="w-3.5 h-3.5 text-blue-500/70" />
            {subCount} submission{subCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Instructions Preview */}
        {assignment.description && (
          <p className="text-xs sm:text-sm text-text-body/70 mt-2.5 line-clamp-2 leading-relaxed border-l-2 border-primary/15 pl-3">
            {assignment.description}
          </p>
        )}

        {/* Dates Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[10px] text-text-light/60">
          <span>Created {formatDate(assignment.createdAt)}</span>
          {assignment.updatedAt && (
            <span>Updated {formatDate(assignment.updatedAt)}</span>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <button
        onClick={() => onViewSubmissions(assignment)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-2.5 border-t border-border-light/50 text-xs font-semibold text-primary hover:bg-primary/5 transition-all group"
      >
        <span className="flex items-center gap-1.5">
          <FiUsers className="w-3.5 h-3.5" />
          View Submissions
          {subCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-[10px]">{subCount}</span>
          )}
        </span>
        <FiChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

// ─── Student Assignment Card (Polished) ──────────────────
function StudentAssignmentCard({ assignment, onView }) {
  const mySub = assignment.mySubmission;
  const status = mySub?.status || 'not_submitted';
  const isLate = isOverdue(assignment.dueDate) && status === 'not_submitted';
  const isGraded = status === 'graded';
  const overDue = isOverdue(assignment.dueDate);
  const dueS = isDueSoon(assignment.dueDate);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(assignment)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(assignment); } }}
      className="bg-white rounded-xl border border-border-light p-4 sm:p-5 hover:shadow-md hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-200 cursor-pointer group"
    >
      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        <StudentStatusBadge status={status} isLate={isLate} />
        {overDue && status === 'not_submitted' && <OverdueBadge />}
        {dueS && status === 'not_submitted' && <DueSoonBadge />}
      </div>

      {/* Title + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-text-dark text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">
            {assignment.title}
          </h4>
        </div>
      </div>

      {/* Meta Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-text-light">
        <span className="flex items-center gap-1.5">
          <FiCalendar className="w-3.5 h-3.5 text-primary/50" />
          Due {formatDate(assignment.dueDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <FiAward className="w-3.5 h-3.5 text-amber-500/70" />
          {assignment.totalMarks || 100} marks
        </span>
      </div>

      {/* Instructions Preview */}
      {assignment.description && (
        <p className="text-xs text-text-body/60 mt-2 line-clamp-1 leading-relaxed">
          {assignment.description}
        </p>
      )}

      {/* Score Progress Bar (for graded) */}
      {isGraded && mySub?.score !== undefined && (
        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, (mySub.score / (assignment.totalMarks || 100)) * 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <FiCheckCircle className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-bold text-green-700">
              {mySub.score}/{assignment.totalMarks || 100}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Teacher Assignment Detail (Two-Column Layout) ───────
function TeacherAssignmentDetail({ assignment, onBack, onGrade }) {
  const submissions = assignment.submissions || [];
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const submittedCount = submissions.length;
  const hasRes = hasResource(assignment);

  if (!assignment) return <DetailSkeleton />;

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors mb-6"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Assignments
      </button>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* ─── LEFT COLUMN ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Title + Badge */}
          <div className="flex flex-wrap items-start gap-3">
            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark flex-1 min-w-0 leading-tight">
              {assignment.title}
            </h2>
            <PublishedBadge published={assignment.isPublished} />
          </div>

          {/* Quick Meta Row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-text-light">
            <span className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4 text-primary/50" /> Due: {formatFullDate(assignment.dueDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <FiAward className="w-4 h-4 text-amber-500/70" /> {assignment.totalMarks || 100} Marks
            </span>
            <span className="flex items-center gap-1.5">
              <FiUsers className="w-4 h-4 text-blue-500/70" /> {submittedCount} Submitted
            </span>
            <span className="flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-green-500/70" /> {gradedCount} Graded
            </span>
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-3 flex items-center gap-2">
              <FiFileText className="w-3.5 h-3.5 text-primary" />
              Assignment Instructions
            </h4>
            <div className="text-sm sm:text-base text-text-body leading-relaxed whitespace-pre-line">
              {assignment.description || (
                <span className="text-text-light/60 italic">No instructions provided.</span>
              )}
            </div>
          </div>

          {/* Resource Card */}
          {assignment.attachments?.length > 0 && (
            <ResourceCard attachments={assignment.attachments} />
          )}

          {/* Submissions Section */}
          {submissions.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-text-dark flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-primary" />
                  Student Submissions
                  <span className="text-xs font-medium text-text-light">({submittedCount})</span>
                </h4>
                <span className="text-xs text-text-light">
                  {gradedCount} of {submittedCount} graded
                </span>
              </div>

              <div className="space-y-2">
                {submissions.map((sub, idx) => {
                  const studentName = sub.student?.studentName || `Student ${idx + 1}`;
                  const isGraded = sub.status === 'graded';
                  const scorePct = isGraded && sub.score !== undefined && assignment.totalMarks
                    ? Math.round((sub.score / assignment.totalMarks) * 100)
                    : 0;

                  return (
                    <div
                      key={sub._id || idx}
                      className="bg-white rounded-xl border border-border-light p-4 hover:shadow-sm hover:border-primary/20 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Student Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {sub.student?.studentPhoto ? (
                            <img
                              src={sub.student.studentPhoto}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover border-2 border-border-light flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">
                                {studentName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-text-dark text-sm truncate">{studentName}</p>
                            <p className="text-xs text-text-light flex items-center gap-1 mt-0.5">
                              <FiUpload className="w-3 h-3" />
                              Submitted {formatDateTime(sub.submittedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isGraded ? (
                            <div className="text-right">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                                <span className="text-sm font-bold text-green-700">{sub.score}</span>
                                <span className="text-[10px] text-green-500">/ {assignment.totalMarks || 100}</span>
                              </div>
                              {scorePct && (
                                <p className="text-[10px] text-green-600/70 mt-0.5">{scorePct}%</p>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => onGrade(assignment, sub)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all shadow-sm hover:shadow-md"
                            >
                              <FiAward className="w-3.5 h-3.5" />
                              Grade
                            </button>
                          )}

                          {sub.fileUrl && (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg border border-border-light flex items-center justify-center text-text-light hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                              title="Open submission file"
                            >
                              <FiExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Feedback Preview (Graded) */}
                      {isGraded && sub.feedback && (
                        <div className="mt-3 ml-[52px] p-3 rounded-xl bg-blue-50/80 border border-blue-200/60">
                          <p className="text-[11px] font-bold text-blue-700 mb-1 flex items-center gap-1">
                            <FiMessageSquare className="w-3 h-3" /> Feedback
                          </p>
                          <p className="text-xs text-blue-800 leading-relaxed line-clamp-2">{sub.feedback}</p>
                        </div>
                      )}

                      {/* Student Note */}
                      {sub.notes && !isGraded && (
                        <div className="mt-2 ml-[52px]">
                          <p className="text-[11px] text-text-light italic">
                            Student note: &ldquo;{sub.notes}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Score Progress (Graded) */}
                      {isGraded && (
                        <div className="mt-3 ml-[52px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${scorePct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 bg-white rounded-xl border border-dashed border-border-light">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <FiUsers className="w-7 h-7 text-gray-300" />
              </div>
              <h4 className="font-bold text-text-dark text-sm mb-1">No Submissions Yet</h4>
              <p className="text-xs text-text-light/60 text-center max-w-xs">
                Students haven&apos;t submitted anything for this assignment. Submissions will appear here once received.
              </p>
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR: Info Cards ────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <FiFileText className="w-3.5 h-3.5 text-primary" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light">Assignment Details</h4>
          </div>

          <InfoCard
            icon={FiCalendar}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            label="Due Date"
            value={formatFullDate(assignment.dueDate) || '—'}
          />

          <InfoCard
            icon={FiAward}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            label="Total Marks"
            value={String(assignment.totalMarks || 100)}
          />

          <InfoCard
            icon={assignment.isPublished ? FiEye : FiEyeOff}
            iconBg={assignment.isPublished ? 'bg-green-50' : 'bg-yellow-50'}
            iconColor={assignment.isPublished ? 'text-green-500' : 'text-yellow-500'}
            label="Status"
            value={assignment.isPublished ? 'Published' : 'Draft'}
          />

          <InfoCard
            icon={FiUsers}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            label="Submissions"
            value={`${submittedCount} received, ${gradedCount} graded`}
          />

          <InfoCard
            icon={FiCalendar}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            label="Created"
            value={formatFullDate(assignment.createdAt) || '—'}
          />

          {assignment.updatedAt && (
            <InfoCard
              icon={FiCalendar}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              label="Last Updated"
              value={formatFullDate(assignment.updatedAt) || '—'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Student Assignment Detail (Two-Column Layout) ───────
function StudentAssignmentDetail({ assignment, onBack }) {
  const mySub = assignment.mySubmission;
  const status = mySub?.status || 'not_submitted';
  const isLate = isOverdue(assignment.dueDate) && status === 'not_submitted';
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const canSubmit = !isOverdue(assignment.dueDate) || status === 'graded';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileUrl.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await studentPortalService.submitAssignment(assignment._id || assignment.id, {
        fileUrl: fileUrl.trim(),
        notes: notes.trim(),
      });
      setSuccess('Assignment submitted successfully!');
      setTimeout(() => {
        setSuccess(null);
        onBack();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = () => {
    setFileUrl(mySub?.fileUrl || '');
    setNotes(mySub?.notes || '');
  };

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors mb-6"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Assignments
      </button>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* ─── LEFT COLUMN ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Title + Status Badge */}
          <div className="flex flex-wrap items-start gap-3">
            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark flex-1 min-w-0 leading-tight">
              {assignment.title}
            </h2>
            <StudentStatusBadge status={status} isLate={isLate} />
          </div>

          {/* Quick Meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-text-light">
            <span className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4 text-primary/50" /> Due: {formatFullDate(assignment.dueDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <FiAward className="w-4 h-4 text-amber-500/70" /> {assignment.totalMarks || 100} Marks
            </span>
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-3 flex items-center gap-2">
              <FiFileText className="w-3.5 h-3.5 text-primary" />
              Assignment Instructions
            </h4>
            <div className="text-sm sm:text-base text-text-body leading-relaxed whitespace-pre-line">
              {assignment.description || (
                <span className="text-text-light/60 italic">No instructions provided.</span>
              )}
            </div>
          </div>

          {/* Resource Card */}
          {assignment.attachments?.length > 0 && (
            <ResourceCard attachments={assignment.attachments} />
          )}

          {/* ─── Submission Section ──────────────────────── */}

          {/* Graded State */}
          {status === 'graded' ? (
            <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-text-dark text-base">Graded</h4>
                  <p className="text-xs text-text-light flex items-center gap-1 mt-0.5">
                    <FiUpload className="w-3 h-3" />
                    Submitted {formatDateTime(mySub.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Score Display */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-200/60 mb-4">
                <div className="text-3xl sm:text-4xl font-bold text-green-700">{mySub.score}</div>
                <div className="text-sm text-green-600/80">
                  out of {assignment.totalMarks || 100} marks
                  <div className="text-xs text-green-500/70 mt-0.5">
                    {assignment.totalMarks
                      ? `${Math.round((mySub.score / assignment.totalMarks) * 100)}%`
                      : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, ((mySub.score || 0) / (assignment.totalMarks || 100)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {mySub.feedback && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/60 mb-4">
                  <p className="text-xs font-bold text-blue-700 mb-1.5 flex items-center gap-1.5">
                    <FiMessageSquare className="w-3.5 h-3.5" /> Teacher Feedback
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed">{mySub.feedback}</p>
                </div>
              )}

              {/* Submitted File */}
              {mySub.fileUrl && (
                <a
                  href={mySub.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-sm font-semibold text-text-dark hover:bg-bg-light hover:border-primary/30 transition-all"
                >
                  <FiExternalLink className="w-4 h-4 text-primary" />
                  View Submitted File
                </a>
              )}
            </div>
          ) : status === 'submitted' ? (
            /* Submitted (Not Graded) State */
            <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiUpload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-text-dark text-base">Submitted</h4>
                  <p className="text-xs text-text-light mt-0.5">
                    Submitted {formatDateTime(mySub.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Submitted File */}
              {mySub.fileUrl && (
                <a
                  href={mySub.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-sm font-semibold text-text-dark hover:bg-bg-light hover:border-primary/30 transition-all"
                >
                  <FiExternalLink className="w-4 h-4 text-primary" />
                  View Submitted File
                </a>
              )}

              {/* Resubmit */}
              {canSubmit && (
                <div className="mt-4 pt-4 border-t border-border-light/50">
                  <button
                    onClick={handleResubmit}
                    className="text-xs text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-1"
                  >
                    <FiUpload className="w-3 h-3" />
                    Re-submit before due date
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not Submitted State */
            <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isLate ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <FiFileText className={`w-6 h-6 ${isLate ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h4 className="font-bold text-text-dark text-base">Not Submitted</h4>
                  {isLate ? (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <FiClock className="w-3 h-3" /> This assignment is past due.
                    </p>
                  ) : (
                    <p className="text-xs text-text-light mt-0.5">Submit your work before the due date.</p>
                  )}
                </div>
              </div>

              {/* Submit Form */}
              {!isLate && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                      <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 animate-fade-in">
                      <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-1.5">
                      File URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="https://example.com/my-assignment.pdf"
                      className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-dark mb-1.5">
                      Notes <span className="text-text-light font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes for your teacher..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none"
                      disabled={submitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !fileUrl.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all text-sm disabled:opacity-50 shadow-sm hover:shadow-md"
                  >
                    {submitting ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiUpload className="w-4 h-4" />
                    )}
                    Submit Assignment
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR: Info Cards ────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <FiFileText className="w-3.5 h-3.5 text-primary" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light">Assignment Details</h4>
          </div>

          <InfoCard
            icon={FiCalendar}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            label="Due Date"
            value={formatFullDate(assignment.dueDate) || '—'}
          />

          <InfoCard
            icon={FiAward}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            label="Total Marks"
            value={String(assignment.totalMarks || 100)}
          />

          {/* Student Status in Sidebar */}
          <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
            status === 'graded'
              ? 'bg-green-50/50 border-green-200/60'
              : status === 'submitted'
              ? 'bg-blue-50/50 border-blue-200/60'
              : isLate
              ? 'bg-red-50/50 border-red-200/60'
              : 'bg-white border-border-light'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              status === 'graded' ? 'bg-green-100' :
              status === 'submitted' ? 'bg-blue-100' :
              isLate ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {status === 'graded' ? <FiCheckCircle className="w-4 h-4 text-green-600" /> :
               status === 'submitted' ? <FiUpload className="w-4 h-4 text-blue-600" /> :
               isLate ? <FiClock className="w-4 h-4 text-red-600" /> :
               <FiFileText className="w-4 h-4 text-gray-400" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">My Status</p>
              <p className={`text-sm font-semibold mt-0.5 ${
                status === 'graded' ? 'text-green-700' :
                status === 'submitted' ? 'text-blue-700' :
                isLate ? 'text-red-700' : 'text-gray-600'
              }`}>
                {status === 'graded' ? 'Graded' :
                 status === 'submitted' ? 'Submitted' :
                 isLate ? 'Overdue' : 'Pending'}
              </p>
              {mySub?.submittedAt && (
                <p className="text-[10px] text-text-light mt-0.5">
                  {formatDateTime(mySub.submittedAt)}
                </p>
              )}
              {mySub?.score !== undefined && status === 'graded' && (
                <p className="text-[10px] font-semibold text-green-600 mt-0.5">
                  {mySub.score}/{assignment.totalMarks || 100}
                </p>
              )}
            </div>
          </div>

          <InfoCard
            icon={FiCalendar}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            label="Created"
            value={formatFullDate(assignment.createdAt) || '—'}
          />

          {assignment.updatedAt && (
            <InfoCard
              icon={FiCalendar}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              label="Last Updated"
              value={formatFullDate(assignment.updatedAt) || '—'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Loading State ───────────────────────────────────────
function LoadingState({ count = 3 }) {
  return <AssignmentListSkeleton />;
}

// ─── Error State ─────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <FiAlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="font-heading text-lg font-bold text-text-dark mb-2">Failed to Load Assignments</h3>
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
        <FiFileText className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-2">No Assignments Yet</h3>
      <p className="text-sm text-text-body/70 text-center max-w-md mb-8 leading-relaxed">
        Start by creating your first assignment. Set due dates, attach resources, 
        and grade student submissions &mdash; all from here.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all text-sm shadow-sm hover:shadow-md"
      >
        <FiPlus className="w-5 h-5" />
        Create Assignment
      </button>
    </div>
  );
}

// ─── Empty State (Student) ───────────────────────────────
function StudentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
        <FiFileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-2">No Assignments Yet</h3>
      <p className="text-sm text-text-body/70 text-center max-w-md leading-relaxed">
        Your teacher hasn&apos;t published any assignments for this course yet. 
        Check back later when new assignments are added.
      </p>
    </div>
  );
}

// ─── No Submissions Empty State ──────────────────────────
// ─── Main CourseAssignmentTab ────────────────────────────
export default function CourseAssignmentTab({ course, role }) {
  const isTeacher = role === 'teacher';
  const { user } = useAuth();

  const courseId = course?._id || course?.id || course?.course?._id;
  const userId = user?._id || user?.id;

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  // Detail view
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Grade modal
  const [showGrade, setShowGrade] = useState(false);
  const [gradeTarget, setGradeTarget] = useState({ assignment: null, submission: null });

  // Student submit refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Fetch Assignments ────────────────────────────────
  const fetchAssignments = useCallback(async () => {
    if (!courseId || !userId) return;
    setLoading(true);
    setError(null);
    try {
      if (isTeacher) {
        const res = await teacherAcademicService.getAssignments(userId, { course: courseId });
        const data = res?.data || res;
        setAssignments(data?.assignments || data || []);
      } else {
        const res = await studentPortalService.getCourseAssignments(courseId);
        const data = res?.data || res;
        setAssignments(data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [courseId, userId, isTeacher]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments, refreshKey]);

  // ─── Handlers ──────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditAssignment(null);
    setShowForm(true);
  }, []);

  const handleOpenEdit = useCallback((assignment) => {
    setEditAssignment(assignment);
    setShowForm(true);
  }, []);

  const handleFormSave = useCallback(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleOpenDelete = useCallback((assignment) => {
    setDeleteTarget(assignment);
    setShowDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await teacherAcademicService.deleteAssignment(deleteTarget._id || deleteTarget.id);
      setShowDelete(false);
      setDeleteTarget(null);
      fetchAssignments();
    } catch (err) {
      setMutationError(err.message || 'Failed to delete assignment');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchAssignments]);

  const handlePublishToggle = useCallback(async (assignment) => {
    try {
      await teacherAcademicService.updateAssignment(assignment._id || assignment.id, {
        isPublished: !assignment.isPublished,
      });
      fetchAssignments();
    } catch (err) {
      setMutationError(err.message || 'Failed to update assignment status');
    }
  }, [fetchAssignments]);

  const handleViewSubmissions = useCallback(async (assignment) => {
    try {
      const res = await teacherAcademicService.getAssignmentById(assignment._id || assignment.id);
      const data = res?.data || res;
      setSelectedAssignment(data || assignment);
    } catch (err) {
      setMutationError(err.message || 'Failed to load assignment details');
    }
  }, []);

  const handleOpenGrade = useCallback((assignment, submission) => {
    setGradeTarget({ assignment, submission });
    setShowGrade(true);
  }, []);

  const handleGradeSave = useCallback(() => {
    if (selectedAssignment) {
      handleViewSubmissions(selectedAssignment);
    }
    fetchAssignments();
  }, [selectedAssignment, handleViewSubmissions, fetchAssignments]);

  const handleViewAssignment = useCallback(async (assignment) => {
    try {
      const res = await studentPortalService.getCourseAssignments(courseId);
      const data = res?.data || res;
      const full = (data || []).find(a => (a._id || a.id) === (assignment._id || assignment.id));
      setSelectedAssignment(full || assignment);
    } catch {
      setSelectedAssignment(assignment);
    }
  }, [courseId]);

  const handleBack = useCallback(() => {
    setSelectedAssignment(null);
    setRefreshKey(k => k + 1);
  }, []);

  // ─── Render ────────────────────────────────────────────
  // Detail view
  if (selectedAssignment) {
    if (isTeacher) {
      return (
        <TeacherAssignmentDetail
          assignment={selectedAssignment}
          onBack={handleBack}
          onGrade={handleOpenGrade}
        />
      );
    }
    return (
      <StudentAssignmentDetail
        assignment={selectedAssignment}
        onBack={handleBack}
      />
    );
  }

  // Main list view
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-xl font-bold text-text-dark flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiFileText className="w-4 h-4 text-primary" />
            </div>
            Assignments
          </h3>
          <p className="text-sm text-text-light mt-1.5 ml-10">
            {isTeacher
              ? `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} · ${assignments.filter(a => a.isPublished).length} published · ${assignments.filter(a => a.isPublished).reduce((sum, a) => sum + (a.submissionCount ?? a.submissions?.length ?? 0), 0)} submissions`
              : `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} available`
            }
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all text-sm shadow-sm hover:shadow-md"
          >
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Assignment</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Mutation Error */}
      {mutationError && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 animate-slide-down">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{mutationError}</span>
          <button onClick={() => setMutationError(null)} className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center hover:bg-red-100 transition-colors">
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAssignments} />
      ) : assignments.length > 0 ? (
        <div className="space-y-3 animate-fade-in">
          {assignments.map((a, i) => (
            isTeacher ? (
              <TeacherAssignmentCard
                key={a._id || a.id || i}
                assignment={a}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onPublish={handlePublishToggle}
                onViewSubmissions={handleViewSubmissions}
              />
            ) : (
              <StudentAssignmentCard
                key={a._id || a.id || i}
                assignment={a}
                onView={handleViewAssignment}
              />
            )
          ))}
        </div>
      ) : isTeacher ? (
        <TeacherEmptyState onCreate={handleOpenCreate} />
      ) : (
        <StudentEmptyState />
      )}

      {/* Modals */}
      <AssignmentFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleFormSave}
        editAssignment={editAssignment}
        courseId={courseId}
        teacherId={userId}
      />

      <DeleteConfirm
        isOpen={showDelete}
        onClose={() => { setShowDelete(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.title || ''}
        deleting={deleting}
      />

      <AssignmentGradeModal
        isOpen={showGrade}
        onClose={() => { setShowGrade(false); setGradeTarget({ assignment: null, submission: null }); }}
        onSave={handleGradeSave}
        submission={gradeTarget.submission}
        assignment={gradeTarget.assignment}
      />
    </div>
  );
}
