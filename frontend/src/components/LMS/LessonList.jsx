import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus, FiLoader, FiAlertCircle, FiRefreshCw, FiX, FiFileText,
} from 'react-icons/fi';
import lessonService from '../../services/lessonService';
import LessonCard from './LessonCard';
import LessonForm from './LessonForm';

// ─── Confirm Delete Modal (reused for lessons) ───────────
function DeleteConfirm({ isOpen, onClose, onConfirm, lessonTitle, deleting }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-border-light p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FiX className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-heading font-bold text-text-dark text-lg mb-2">Delete Lesson</h3>
          <p className="text-sm text-text-body mb-1">Are you sure you want to delete:</p>
          <p className="text-sm font-semibold text-text-dark mb-4">&ldquo;{lessonTitle}&rdquo;</p>
          <p className="text-xs text-text-light mb-6">This action cannot be undone.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-dark font-semibold hover:bg-bg-light transition-colors text-sm disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {deleting ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiX className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonList({ module, isTeacher, onViewLesson }) {
  const moduleId = module._id || module.id;

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('order');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [mutationError, setMutationError] = useState(null);
  const [reordering, setReordering] = useState(false);

  // ─── Fetch lessons ────────────────────────────────────
  const fetchLessons = useCallback(async () => {
    if (!moduleId) return;
    setLoading(true);
    setError(null);
    try {
      if (isTeacher) {
        const res = await lessonService.getLessons(moduleId);
        const data = res?.data || res;
        setLessons(data?.data || data || []);
      } else {
        const res = await lessonService.getPublishedLessons(moduleId);
        const data = res?.data || res;
        setLessons(data?.data || data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [moduleId, isTeacher]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // ─── Sorted lessons ─────────────────────────────────────
  const sortedLessons = [...lessons].sort((a, b) => {
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });

  // ─── Handlers ───────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditLesson(null);
    setShowForm(true);
  }, []);

  const handleOpenEdit = useCallback((lesson) => {
    setEditLesson(lesson);
    setShowForm(true);
  }, []);

  const handleFormSave = useCallback(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleOpenDelete = useCallback((lesson) => {
    setDeleteTarget(lesson);
    setShowDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await lessonService.deleteLesson(deleteTarget._id || deleteTarget.id);
      setShowDelete(false);
      setDeleteTarget(null);
      fetchLessons();
    } catch (err) {
      setMutationError(err.message || 'Failed to delete lesson');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchLessons]);

  const handlePublishToggle = useCallback(async (lessonId, currentlyPublished) => {
    try {
      if (currentlyPublished) {
        await lessonService.unpublishLesson(lessonId);
      } else {
        await lessonService.publishLesson(lessonId);
      }
      fetchLessons();
    } catch (err) {
      setMutationError(err.message || 'Failed to update lesson status');
    }
  }, [fetchLessons]);

  const handleMoveUp = useCallback(async (index) => {
    if (index <= 0) return;
    const ids = sortedLessons.map((l) => l._id || l.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    setReordering(true);
    try {
      await lessonService.reorderLessons(moduleId, ids);
      fetchLessons();
    } catch (err) {
      setMutationError(err.message || 'Failed to reorder lessons');
    } finally {
      setReordering(false);
    }
  }, [sortedLessons, moduleId, fetchLessons]);

  const handleMoveDown = useCallback(async (index) => {
    if (index >= sortedLessons.length - 1) return;
    const ids = sortedLessons.map((l) => l._id || l.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    setReordering(true);
    try {
      await lessonService.reorderLessons(moduleId, ids);
      fetchLessons();
    } catch (err) {
      setMutationError(err.message || 'Failed to reorder lessons');
    } finally {
      setReordering(false);
    }
  }, [sortedLessons, moduleId, fetchLessons]);

  // ─── Render ─────────────────────────────────────────────
  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <FiLoader className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (error && lessons.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <FiAlertCircle className="w-5 h-5 text-red-400" />
        <p className="text-xs text-red-500">{error}</p>
        <button onClick={fetchLessons} className="text-xs text-primary font-medium hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-text-light" />
          <span className="text-sm font-semibold text-text-dark">Lessons</span>
          {sortedLessons.length > 0 && (
            <span className="text-xs text-text-light">({sortedLessons.length})</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isTeacher && sortedLessons.length > 0 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 rounded-lg border border-border-light bg-white text-[11px] text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="order">Order</option>
              <option value="title">A-Z</option>
              <option value="newest">Newest</option>
            </select>
          )}
          {isTeacher && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-[11px]"
            >
              <FiPlus className="w-3 h-3" />
              <span className="hidden sm:inline">Add Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* Mutation error */}
      {mutationError && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1">{mutationError}</span>
          <button onClick={() => setMutationError(null)} className="flex-shrink-0 hover:bg-red-100 rounded p-0.5">
            <FiX className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Reorder loading */}
      {reordering && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-primary">
          <FiLoader className="w-3.5 h-3.5 animate-spin" />
          <span>Reordering...</span>
        </div>
      )}

      {/* Lesson cards */}
      {sortedLessons.length > 0 ? (
        <div className="space-y-2">
          {sortedLessons.map((lesson, idx) => (
            <LessonCard
              key={lesson._id || lesson.id}
              lesson={lesson}
              index={idx}
              totalLessons={sortedLessons.length}
              isTeacher={isTeacher}
              sortBy={sortBy}
              onView={(lesson) => onViewLesson(lesson, module?.title || module?.name || 'Module', sortedLessons)}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onPublish={handlePublishToggle}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border-light p-4 text-center">
          <FiFileText className="w-6 h-6 text-border-light mx-auto mb-1.5" />
          <p className="text-xs text-text-light">
            {isTeacher
              ? 'No lessons in this module yet.'
              : 'No lessons in this module yet.'}
          </p>
          {isTeacher && (
            <button
              onClick={handleOpenCreate}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-[11px]"
            >
              <FiPlus className="w-3 h-3" />
              Add First Lesson
            </button>
          )}
        </div>
      )}

      {/* Forms & Modals */}
      <LessonForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleFormSave}
        editLesson={editLesson}
        moduleId={moduleId}
      />

      <DeleteConfirm
        isOpen={showDelete}
        onClose={() => { setShowDelete(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
        lessonTitle={deleteTarget?.title || ''}
        deleting={deleting}
      />

      {/* Refresh on module collapse */}

    </div>
  );
}
