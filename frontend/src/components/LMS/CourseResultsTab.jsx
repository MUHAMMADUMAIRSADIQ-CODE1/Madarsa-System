import { useState, useEffect, useCallback } from 'react';
import {
  FiBarChart2, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiCalendar, FiAward, FiUser, FiChevronRight, FiCheckCircle,
  FiClock, FiLoader, FiAlertCircle, FiRefreshCw, FiX,
  FiArrowLeft, FiMessageSquare, FiStar, FiTrendingUp,
  FiTarget, FiBookOpen,
} from 'react-icons/fi';
import teacherAcademicService from '../../services/teacherAcademicService';
import studentPortalService from '../../services/studentPortalService';
import { useAuth } from '../../context/AuthContext';
import ResultFormModal from './ResultFormModal';

// ─── Helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return dateStr; }
}

function formatFullDate(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return null; }
}

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return null; }
}

function getGradeInfo(percentage) {
  if (percentage >= 90) return { grade: 'A+', label: 'Excellent', color: 'text-green-600 bg-green-50 border-green-200', bar: 'from-green-400 to-green-500' };
  if (percentage >= 80) return { grade: 'A', label: 'Very Good', color: 'text-blue-600 bg-blue-50 border-blue-200', bar: 'from-blue-400 to-blue-500' };
  if (percentage >= 70) return { grade: 'B+', label: 'Good', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', bar: 'from-indigo-400 to-indigo-500' };
  if (percentage >= 60) return { grade: 'B', label: 'Above Average', color: 'text-purple-600 bg-purple-50 border-purple-200', bar: 'from-purple-400 to-purple-500' };
  if (percentage >= 50) return { grade: 'C', label: 'Average', color: 'text-amber-600 bg-amber-50 border-amber-200', bar: 'from-amber-400 to-amber-500' };
  if (percentage >= 40) return { grade: 'D', label: 'Below Average', color: 'text-orange-600 bg-orange-50 border-orange-200', bar: 'from-orange-400 to-orange-500' };
  return { grade: 'F', label: 'Needs Improvement', color: 'text-red-600 bg-red-50 border-red-200', bar: 'from-red-400 to-red-500' };
}

function calcPercentage(obtained, total) {
  if (!total || total <= 0) return 0;
  return Math.round((obtained / total) * 100);
}

// ─── Badge Components ────────────────────────────────────
function PublishedBadge({ published }) {
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

function GradeBadge({ percentage, large }) {
  const info = getGradeInfo(percentage);
  return (
    <span className={`inline-flex items-center justify-center rounded-lg font-bold border shadow-sm ${info.color} ${
      large ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-[11px]'
    }`}>
      {large && <FiStar className={`w-3.5 h-3.5 mr-1 ${info.color.split(' ')[0]}`} />}
      {info.grade}
    </span>
  );
}

// ─── Info Card ───────────────────────────────────────────
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

// ─── Summary Card ────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 sm:p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg ${color || 'bg-primary/10'} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${color ? color.split(' ')[0] || 'text-primary' : 'text-primary'}`} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-light">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-text-dark">{value}</p>
      {sub && <p className="text-xs text-text-light mt-1">{sub}</p>}
    </div>
  );
}

// ─── Skeleton Loaders ────────────────────────────────────
function ListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4">
            {/* Badge skeleton */}
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-100 rounded-lg" />
              <div className="h-6 w-16 bg-gray-100 rounded-lg" />
            </div>
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-gray-200 rounded-lg" />
              <div className="h-4 w-1/3 bg-gray-200 rounded-lg" />
            </div>
            {/* Progress bar skeleton */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-10 bg-gray-200 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full" />
            </div>
            {/* Meta skeleton */}
            <div className="flex gap-4 pt-2 border-t border-gray-100">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          </div>
          {/* Footer skeleton */}
          <div className="px-5 sm:px-6 py-3 border-t border-border-light/50">
            <div className="h-3 w-28 bg-gray-200 rounded" />
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
        <div className="lg:col-span-2 space-y-5">
          {/* Title + badge */}
          <div className="flex items-start justify-between">
            <div className="h-8 w-2/3 bg-gray-200 rounded-lg" />
            <div className="h-8 w-16 bg-gray-200 rounded-lg" />
          </div>
          {/* Student info */}
          <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-200 rounded-lg" />
              <div className="h-3 w-24 bg-gray-200 rounded-lg" />
            </div>
          </div>
          {/* Score card */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 space-y-5">
            <div className="h-4 w-32 bg-gray-200 rounded-lg" />
            <div className="flex items-center gap-6 sm:gap-10">
              <div className="w-24 h-24 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                  <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full" />
              </div>
            </div>
          </div>
          {/* Exam info grid */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 space-y-4">
            <div className="h-4 w-36 bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="p-3.5 bg-gray-100 rounded-xl space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-5 w-12 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-20 bg-gray-200 rounded-lg mb-2" />
          {[1, 2, 3, 4, 5, 6].map(i => (
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-border-light p-6 animate-fade-in">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FiTrash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-heading font-bold text-text-dark text-lg mb-2">Delete Result</h3>
          <p className="text-sm text-text-body mb-1">Are you sure you want to delete:</p>
          <p className="text-sm font-semibold text-text-dark mb-4">&ldquo;{title}&rdquo;</p>
          <p className="text-xs text-text-light mb-6 flex items-center justify-center gap-1"><FiAlertCircle className="w-3.5 h-3.5" />This action cannot be undone.</p>
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

// ─── Teacher Result Card ─────────────────────────────────
function TeacherResultCard({ result, onEdit, onDelete, onPublish, onView }) {
  const isPub = result.status === 'published';
  const pct = calcPercentage(result.obtainedMarks, result.totalMarks);
  const gradeInfo = getGradeInfo(pct);
  const studentName = result.student?.studentName || 'Unnamed Student';
  const studentPhoto = result.student?.studentPhoto;
  const hasRemarks = !!result.remarks;

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="p-5 sm:p-6">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <PublishedBadge published={isPub} />
          <GradeBadge percentage={pct} />
        </div>

        {/* Title + Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-text-dark text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">
              {result.examName}
            </h4>
            {/* Student Avatar + Name */}
            <div className="flex items-center gap-2 mt-2">
              {studentPhoto ? (
                <img src={studentPhoto} alt="" className="w-6 h-6 rounded-full object-cover border border-border-light" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary">{studentName.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <span className="text-xs text-text-body font-medium truncate">{studentName}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={(e) => { e.stopPropagation(); onPublish(result); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light/50 hover:text-primary hover:bg-primary/10 transition-all" title={isPub ? 'Unpublish' : 'Publish'}>
              {isPub ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(result); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light/50 hover:text-primary hover:bg-primary/10 transition-all" title="Edit">
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(result); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light/50 hover:text-red-500 hover:bg-red-50 transition-all" title="Delete">
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Score + Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-dark">{result.obtainedMarks}</span>
              <span className="text-xs text-text-light">/ {result.totalMarks}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${gradeInfo.color.split(' ').slice(0, 2).join(' ')}`}>
                {gradeInfo.label}
              </div>
              <span className={`text-sm font-bold ${gradeInfo.color.split(' ')[0]}`}>{pct}%</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradeInfo.bar} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3.5 text-xs text-text-light border-t border-border-light/40 pt-3">
          <span className="flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5 text-primary/50" />{formatDate(result.examDate) || 'No date'}</span>
          <span className="flex items-center gap-1.5"><FiClock className="w-3.5 h-3.5 text-amber-500/70" />Created {formatDate(result.createdAt) || ''}</span>
        </div>

        {/* Remarks Preview (2 lines) */}
        {hasRemarks && (
          <div className="mt-3.5 pl-3.5 border-l-2 border-primary/20">
            <p className="text-xs text-text-body/80 leading-relaxed line-clamp-2">{result.remarks}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <button onClick={() => onView(result)} className="w-full flex items-center justify-between px-5 sm:px-6 py-3 border-t border-border-light/50 text-xs font-semibold text-primary hover:bg-primary/5 transition-all group">
        <span className="flex items-center gap-1.5"><FiBarChart2 className="w-3.5 h-3.5" />View Full Details</span>
        <FiChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

// ─── Student Result Card ─────────────────────────────────
function StudentResultCard({ result, onView }) {
  const pct = calcPercentage(result.obtainedMarks, result.totalMarks);
  const gradeInfo = getGradeInfo(pct);
  const hasRemarks = !!result.remarks;

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => onView(result)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(result); } }}
      className="bg-white rounded-xl border border-border-light p-5 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 hover:bg-primary/[0.02] transition-all duration-200 cursor-pointer group"
    >
      {/* Title + Grade Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-text-dark text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">
            {result.examName}
          </h4>
          {result.examDate && (
            <p className="text-xs text-text-light mt-1 flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {formatDate(result.examDate)}
            </p>
          )}
        </div>
        <GradeBadge percentage={pct} />
      </div>

      {/* Score Bar */}
      <div className="mt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-light">
            <span className="font-semibold text-text-dark">{result.obtainedMarks}</span> / {result.totalMarks}
          </span>
          <span className={`text-xs font-bold ${gradeInfo.color.split(' ')[0]}`}>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradeInfo.bar} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>

      {/* Grade Label */}
      <div className="flex items-center gap-2 mt-3 text-xs text-text-light">
        <FiAward className="w-3.5 h-3.5 text-amber-500/70" />
        <span>
          {gradeInfo.grade} — <span className={`font-semibold ${gradeInfo.color.split(' ')[0]}`}>{gradeInfo.label}</span>
        </span>
      </div>

      {/* Remarks Preview */}
      {hasRemarks && (
        <p className="text-xs text-text-body/70 mt-2.5 leading-relaxed line-clamp-1 pl-3 border-l-2 border-primary/15">
          {result.remarks}
        </p>
      )}
    </div>
  );
}

// ─── Teacher Result Detail ───────────────────────────────
function TeacherResultDetail({ result, onBack }) {
  if (!result) return <DetailSkeleton />;
  const pct = calcPercentage(result.obtainedMarks, result.totalMarks);
  const gradeInfo = getGradeInfo(pct);
  const studentName = result.student?.studentName || 'Unnamed Student';
  const studentPhoto = result.student?.studentPhoto;

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="group inline-flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors mb-6">
        <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + Badge */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark flex-1 min-w-0 leading-tight">{result.examName}</h2>
            <GradeBadge percentage={pct} large />
          </div>

          {/* Student Info */}
          <div className="flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-primary/[0.04] to-primary-dark/[0.02] border border-primary/10">
            {studentPhoto ? (
              <img src={studentPhoto} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-lg font-bold text-white">{studentName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <p className="font-heading font-bold text-text-dark text-base">{studentName}</p>
              {result.student?.studentId && <p className="text-sm text-text-light mt-0.5">Student ID: {result.student.studentId}</p>}
              <p className="text-xs text-text-light/70 mt-0.5 flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {formatFullDate(result.examDate) || 'Exam date not set'}
              </p>
            </div>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-5 flex items-center gap-2">
              <FiAward className="w-3.5 h-3.5 text-amber-500" />
              Score &amp; Grade
            </h4>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 sm:gap-8">
              {/* Grade Circle */}
              <div className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl border-2 ${gradeInfo.color} bg-opacity-30 min-w-[100px]`}>
                <div className={`text-4xl sm:text-5xl font-black ${gradeInfo.color.split(' ')[0]}`}>{gradeInfo.grade}</div>
                <p className={`text-[11px] font-bold mt-1 uppercase tracking-wider ${gradeInfo.color.split(' ')[0]}`}>{gradeInfo.label}</p>
              </div>
              {/* Score Bar */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-bold text-text-dark">{result.obtainedMarks}</span>
                    <span className="text-sm text-text-light">/ {result.totalMarks}</span>
                  </div>
                  <span className={`text-lg sm:text-xl font-black ${gradeInfo.color.split(' ')[0]}`}>{pct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${gradeInfo.bar} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exam Information */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-4 flex items-center gap-2">
              <FiBookOpen className="w-3.5 h-3.5 text-primary" />
              Exam Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-bg-light/50 border border-border-light">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Obtained Marks</p>
                <p className="text-lg font-bold text-text-dark mt-1">{result.obtainedMarks}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-light/50 border border-border-light">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Total Marks</p>
                <p className="text-lg font-bold text-text-dark mt-1">{result.totalMarks}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-light/50 border border-border-light">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Percentage</p>
                <p className={`text-lg font-bold mt-1 ${gradeInfo.color.split(' ')[0]}`}>{pct}%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-light/50 border border-border-light">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Grade</p>
                <p className={`text-lg font-bold mt-1 ${gradeInfo.color.split(' ')[0]}`}>{gradeInfo.grade}</p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className={`bg-white rounded-xl border ${result.remarks ? 'border-border-light' : 'border-dashed border-border-light'} p-5 sm:p-6 ${result.remarks ? 'shadow-sm' : ''}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-3 flex items-center gap-2">
              <FiMessageSquare className="w-3.5 h-3.5 text-primary" />
              Teacher Remarks
            </h4>
            {result.remarks ? (
              <p className="text-sm sm:text-base text-text-body leading-relaxed whitespace-pre-line">{result.remarks}</p>
            ) : (
              <p className="text-sm text-text-light/60 italic">No remarks provided for this result.</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><FiBarChart2 className="w-3.5 h-3.5 text-primary" /></div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light">Details</h4>
          </div>

          <InfoCard icon={FiAward} iconBg="bg-amber-50" iconColor="text-amber-500" label="Grade" value={gradeInfo.grade} />
          <InfoCard icon={FiBarChart2} iconBg="bg-blue-50" iconColor="text-blue-500" label="Percentage" value={`${pct}%`} />
          <InfoCard icon={FiUser} iconBg="bg-primary/10" iconColor="text-primary" label="Student" value={studentName} />
          <InfoCard icon={FiCalendar} iconBg="bg-red-50" iconColor="text-red-500" label="Exam Date" value={formatFullDate(result.examDate) || 'Not set'} />
          <InfoCard icon={result.status === 'published' ? FiEye : FiEyeOff} iconBg={result.status === 'published' ? 'bg-green-50' : 'bg-yellow-50'} iconColor={result.status === 'published' ? 'text-green-500' : 'text-yellow-500'} label="Status" value={result.status === 'published' ? 'Published' : 'Draft'} />
          <InfoCard icon={FiCalendar} iconBg="bg-blue-50" iconColor="text-blue-500" label="Created" value={formatFullDate(result.createdAt) || '—'} />
          <InfoCard icon={FiCalendar} iconBg="bg-amber-50" iconColor="text-amber-500" label="Last Updated" value={formatFullDate(result.updatedAt) || '—'} />
        </div>
      </div>
    </div>
  );
}

// ─── Student Result Detail ───────────────────────────────
function StudentResultDetail({ result, onBack }) {
  if (!result) return <DetailSkeleton />;
  const pct = calcPercentage(result.obtainedMarks, result.totalMarks);
  const gradeInfo = getGradeInfo(pct);
  const teacherName = result.teacher?.fullName || (typeof result.teacher === 'string' ? result.teacher : '—');

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="group inline-flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors mb-6">
        <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark flex-1 min-w-0 leading-tight">{result.examName}</h2>
            <GradeBadge percentage={pct} large />
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-5 flex items-center gap-2">
              <FiAward className="w-3.5 h-3.5 text-amber-500" />
              Your Score
            </h4>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 sm:gap-8">
              <div className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl border-2 ${gradeInfo.color} bg-opacity-30 min-w-[100px]`}>
                <div className={`text-4xl sm:text-5xl font-black ${gradeInfo.color.split(' ')[0]}`}>{gradeInfo.grade}</div>
                <p className={`text-[11px] font-bold mt-1 uppercase tracking-wider ${gradeInfo.color.split(' ')[0]}`}>{gradeInfo.label}</p>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-bold text-text-dark">{result.obtainedMarks}</span>
                    <span className="text-sm text-text-light">/ {result.totalMarks}</span>
                  </div>
                  <span className={`text-lg sm:text-xl font-black ${gradeInfo.color.split(' ')[0]}`}>{pct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${gradeInfo.bar} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exam Information */}
          <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-4 flex items-center gap-2">
              <FiBookOpen className="w-3.5 h-3.5 text-primary" />
              Exam Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-bg-light/50 border border-border-light">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Obtained Marks</p>
                <p className="text-lg font-bold text-text-dark mt-1">{result.obtainedMarks}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-light/50 border border-border-light">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Total Marks</p>
                <p className="text-lg font-bold text-text-dark mt-1">{result.totalMarks}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-light/50 border border-border-light">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Percentage</p>
                <p className={`text-lg font-bold mt-1 ${gradeInfo.color.split(' ')[0]}`}>{pct}%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-light/50 border border-border-light">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">Grade</p>
                <p className={`text-lg font-bold mt-1 ${gradeInfo.color.split(' ')[0]}`}>{gradeInfo.grade}</p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className={`bg-white rounded-xl border ${result.remarks ? 'border-border-light' : 'border-dashed border-border-light'} p-5 sm:p-6 ${result.remarks ? 'shadow-sm' : ''}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light mb-3 flex items-center gap-2">
              <FiMessageSquare className="w-3.5 h-3.5 text-primary" />
              Teacher Remarks
            </h4>
            {result.remarks ? (
              <p className="text-sm sm:text-base text-text-body leading-relaxed whitespace-pre-line">{result.remarks}</p>
            ) : (
              <p className="text-sm text-text-light/60 italic">No remarks provided for this result.</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><FiBarChart2 className="w-3.5 h-3.5 text-primary" /></div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-light">Details</h4>
          </div>

          <InfoCard icon={FiAward} iconBg="bg-amber-50" iconColor="text-amber-500" label="Grade" value={gradeInfo.grade} />
          <InfoCard icon={FiBarChart2} iconBg="bg-blue-50" iconColor="text-blue-500" label="Percentage" value={`${pct}%`} />
          <InfoCard icon={FiCalendar} iconBg="bg-red-50" iconColor="text-red-500" label="Exam Date" value={formatFullDate(result.examDate) || 'Not set'} />
          <InfoCard icon={FiUser} iconBg="bg-primary/10" iconColor="text-primary" label="Teacher" value={teacherName} />
          <InfoCard icon={FiCalendar} iconBg="bg-green-50" iconColor="text-green-500" label="Published" value={formatFullDate(result.publishedAt || result.createdAt) || 'Not yet published'} />
        </div>
      </div>
    </div>
  );
}

// ─── Empty / Error / Loading States ──────────────────────
function TeacherEmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <FiBarChart2 className="w-12 h-12 sm:w-14 sm:h-14 text-primary/60" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <FiPlus className="w-4 h-4 text-white" />
        </div>
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-3">No Results Yet</h3>
      <p className="text-sm text-text-body/70 text-center max-w-md mb-8 leading-relaxed">
        Start recording student results for this course. Create exam scores, 
        and grades will be calculated automatically. Publish them when ready 
        so students can view their performance.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button onClick={onCreate} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all text-sm shadow-md hover:shadow-lg">
          <FiPlus className="w-5 h-5" />
          Create Your First Result
        </button>
      </div>
    </div>
  );
}

function StudentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 animate-fade-in">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-8">
        <FiBarChart2 className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300" />
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-3">No Results Published Yet</h3>
      <p className="text-sm text-text-body/70 text-center max-w-md leading-relaxed">
        Your teacher hasn&apos;t published any results for this course yet.
        Once results are available, they will appear here with your scores,
        grades, and teacher feedback.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <FiAlertCircle className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="font-heading text-lg font-bold text-text-dark mb-2">Failed to Load Results</h3>
      <p className="text-sm text-text-body/60 text-center max-w-sm mb-6 leading-relaxed">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light hover:border-primary/30 hover:text-primary transition-all text-sm shadow-sm">
        <FiRefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

// ─── Main CourseResultsTab ──────────────────────────────
export default function CourseResultsTab({ course, role, students }) {
  const isTeacher = role === 'teacher';
  const { user } = useAuth();

  const courseId = course?._id || course?.id || course?.course?._id;
  const userId = user?._id || user?.id;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editResult, setEditResult] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Detail view
  const [selectedResult, setSelectedResult] = useState(null);

  // Refresh key for student
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Fetch Results ───────────────────────────────────
  const fetchResults = useCallback(async () => {
    if (!courseId || !userId) return;
    setLoading(true);
    setError(null);
    try {
      if (isTeacher) {
        const res = await teacherAcademicService.getResults(userId, { course: courseId });
        const data = res?.data || res;
        setResults(data?.results || data || []);
      } else {
        const res = await studentPortalService.getCourseResults(courseId);
        const data = res?.data || res;
        setResults(data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [courseId, userId, isTeacher]);

  useEffect(() => { fetchResults(); }, [fetchResults, refreshKey]);

  // ─── Summary Stats ────────────────────────────────────
  const summaryStats = (() => {
    if (!results || results.length === 0) {
      return { total: 0, published: 0, avgPercentage: 0, highestScore: 0, overallGrade: '—' };
    }
    const published = results.filter(r => r.status === 'published');
    const percentages = results.map(r => calcPercentage(r.obtainedMarks, r.totalMarks));
    const avgPct = percentages.length > 0 ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) : 0;
    const highest = Math.max(...percentages, 0);
    const overallGrade = getGradeInfo(avgPct).grade;
    return {
      total: isTeacher ? results.length : published.length,
      published: published.length,
      avgPercentage: avgPct,
      highestScore: highest,
      overallGrade,
      highestPct: highest,
    };
  })();

  // ─── Handlers ─────────────────────────────────────────
  const handleOpenCreate = useCallback(() => { setEditResult(null); setShowForm(true); }, []);
  const handleOpenEdit = useCallback((result) => { setEditResult(result); setShowForm(true); }, []);
  const handleFormSave = useCallback(() => { fetchResults(); }, [fetchResults]);

  const handleOpenDelete = useCallback((result) => { setDeleteTarget(result); setShowDelete(true); }, []);
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await teacherAcademicService.deleteResult(deleteTarget._id || deleteTarget.id, userId);
      setShowDelete(false);
      setDeleteTarget(null);
      fetchResults();
    } catch (err) {
      setMutationError(err.message || 'Failed to delete result');
    } finally { setDeleting(false); }
  }, [deleteTarget, userId, fetchResults]);

  const handlePublishToggle = useCallback(async (result) => {
    try {
      if (result.status === 'published') {
        await teacherAcademicService.updateResult(result._id || result.id, { status: 'draft' });
      } else {
        await teacherAcademicService.publishResult(result._id || result.id, userId);
      }
      fetchResults();
    } catch (err) {
      setMutationError(err.message || 'Failed to update result status');
    }
  }, [userId, fetchResults]);

  const handleViewResult = useCallback((result) => { setSelectedResult(result); }, []);
  const handleBack = useCallback(() => { setSelectedResult(null); setRefreshKey(k => k + 1); }, []);

  // ─── Render ───────────────────────────────────────────
  if (selectedResult) {
    if (isTeacher) {
      return <TeacherResultDetail result={selectedResult} onBack={handleBack} />;
    }
    return <StudentResultDetail result={selectedResult} onBack={handleBack} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-xl font-bold text-text-dark flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiBarChart2 className="w-4 h-4 text-primary" />
            </div>
            Results
          </h3>
          <p className="text-sm text-text-light mt-1.5 ml-10">
            {isTeacher
              ? `${results.length} result${results.length !== 1 ? 's' : ''} · ${summaryStats.published} published · Avg ${summaryStats.avgPercentage}%`
              : `${summaryStats.total} result${summaryStats.total !== 1 ? 's' : ''} available`
            }
          </p>
        </div>
        {isTeacher && (
          <button onClick={handleOpenCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all text-sm shadow-sm hover:shadow-md">
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Result</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {results.length > 0 && (
        <div className={`grid grid-cols-2 ${isTeacher ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-3 sm:gap-4 mb-6`}>
          <SummaryCard icon={FiBarChart2} label={isTeacher ? 'Total Results' : 'My Results'} value={summaryStats.total} color="bg-primary/10 text-primary" />
          {isTeacher && (
            <SummaryCard icon={FiEye} label="Published" value={summaryStats.published} color="bg-green-50 text-green-600" sub={`of ${summaryStats.total} total`} />
          )}
          <SummaryCard icon={FiTrendingUp} label="Average Score" value={`${summaryStats.avgPercentage}%`} color="bg-blue-50 text-blue-600" />
          <SummaryCard icon={FiTarget} label="Highest Score" value={`${summaryStats.highestPct}%`} color="bg-green-50 text-green-600" />
          <SummaryCard icon={FiStar} label="Overall Grade" value={summaryStats.overallGrade} color="bg-amber-50 text-amber-600" />
        </div>
      )}

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
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchResults} />
      ) : results.length > 0 ? (
        <div className={`space-y-3 ${isTeacher ? '' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 space-y-0'}`}>
          {results.map((r, i) => (
            isTeacher ? (
              <TeacherResultCard
                key={r._id || r.id || i}
                result={r}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onPublish={handlePublishToggle}
                onView={handleViewResult}
              />
            ) : (
              <StudentResultCard
                key={r._id || r.id || i}
                result={r}
                onView={handleViewResult}
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
      <ResultFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleFormSave}
        editResult={editResult}
        courseId={courseId}
        teacherId={userId}
        students={students}
      />

      <DeleteConfirm
        isOpen={showDelete}
        onClose={() => { setShowDelete(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.examName || ''}
        deleting={deleting}
      />
    </div>
  );
}
