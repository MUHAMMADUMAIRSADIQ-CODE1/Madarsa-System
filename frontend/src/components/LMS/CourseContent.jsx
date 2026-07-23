import { useState, useEffect, useCallback } from 'react';
import {
  FiLayers, FiPlus, FiTrash2, FiEdit2, FiChevronDown,
  FiChevronRight, FiFileText, FiX, FiCheck,
  FiMove, FiEye, FiEyeOff, FiRefreshCw,
  FiAlertCircle, FiLoader, FiChevronUp,
} from 'react-icons/fi';
import moduleService from '../../services/moduleService';
import lessonService from '../../services/lessonService';
import LessonList from './LessonList';
import LessonViewerPage from './LessonViewerPage';

// ─── Module Form Modal (Create / Edit) ────────────────────
function ModuleFormModal({ isOpen, onClose, onSave, editModule, courseId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!editModule;

  useEffect(() => {
    if (isOpen) {
      if (editModule) {
        setTitle(editModule.title || '');
        setDescription(editModule.description || '');
      } else {
        setTitle('');
        setDescription('');
      }
      setError(null);
      setSaving(false);
    }
  }, [isOpen, editModule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        const res = await moduleService.updateModule(editModule._id || editModule.id, {
          title: title.trim(),
          description: description.trim(),
        });
        const updated = res?.data || res;
        onSave(updated);
      } else {
        const res = await moduleService.createModule({
          title: title.trim(),
          description: description.trim(),
          course: courseId,
        });
        const created = res?.data || res;
        onSave(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save module');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-border-light">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiLayers className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-text-dark text-lg">
                {isEditing ? 'Edit Module' : 'Create Module'}
              </h3>
              <p className="text-xs text-text-light">
                {isEditing ? 'Update module details' : 'Add a new section to this course'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1.5">
              Module Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Quran Recitation"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
              autoFocus
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1.5">
              Description <span className="text-text-light font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of what this module covers..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-text-dark placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none"
              disabled={saving}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
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
              disabled={saving || !title.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheck className="w-4 h-4" />
              )}
              {isEditing ? 'Update Module' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────
function ConfirmDeleteModal({ isOpen, onClose, onConfirm, moduleTitle, deleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-border-light p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FiTrash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-heading font-bold text-text-dark text-lg mb-2">Delete Module</h3>
          <p className="text-sm text-text-body mb-1">
            Are you sure you want to delete:
          </p>
          <p className="text-sm font-semibold text-text-dark mb-4">
            &ldquo;{moduleTitle}&rdquo;
          </p>
          <p className="text-xs text-text-light mb-6">This action cannot be undone.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-dark font-semibold hover:bg-bg-light transition-colors text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deleting ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiTrash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────
function ModuleCard({ module, index, totalModules, isTeacher, onEdit, onDelete, onPublish, onUnpublish, onMoveUp, onMoveDown, sortBy, onViewLesson }) {
  const [expanded, setExpanded] = useState(false);

  const moduleId = module._id || module.id;
  const isPublished = module.isPublished;

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Module Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
        className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-left hover:bg-bg-light/50 transition-colors cursor-pointer select-none"
      >
        {/* Drag handle (teacher only) */}
        {isTeacher && (
          <span className="flex-shrink-0 text-text-light/30 hover:text-text-light cursor-grab active:cursor-grabbing">
            <FiMove className="w-4 h-4" />
          </span>
        )}

        {/* Module number + icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isPublished ? 'bg-primary/10' : 'bg-gray-100'
        }`}>
          <FiLayers className={`w-4 h-4 ${isPublished ? 'text-primary' : 'text-gray-400'}`} />
        </div>

        {/* Module info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isPublished ? 'text-primary/60' : 'text-gray-400'
            }`}>
              Module {index + 1}
            </span>

            {/* Published / Draft badge */}
            {isTeacher && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                isPublished
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
            )}
          </div>
          <h4 className={`font-bold text-sm sm:text-base truncate mt-0.5 ${
            isPublished ? 'text-text-dark' : 'text-text-light'
          }`}>
            {module.title}
          </h4>
          {module.description && !expanded && (
            <p className="text-xs text-text-body/70 mt-0.5 line-clamp-1">
              {module.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isTeacher && (
            <>
              {/* Reorder up/down (only in default order mode) */}
              {sortBy === 'order' && (
                <div className="flex flex-col gap-0.5 mr-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(index);
                    }}
                    disabled={index === 0}
                    className="w-5 h-4 rounded flex items-center justify-center text-text-light/30 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <FiChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    onMoveDown(index);
                    }}
                    disabled={index === totalModules - 1}
                    className="w-5 h-4 rounded flex items-center justify-center text-text-light/30 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <FiChevronDown className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Publish / Unpublish toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPublished) {
                    onUnpublish(moduleId);
                  } else {
                    onPublish(moduleId);
                  }
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light hover:text-primary hover:bg-primary/10 transition-colors"
                title={isPublished ? 'Unpublish module' : 'Publish module'}
              >
                {isPublished ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
              </button>

              {/* Edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(module);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light hover:text-primary hover:bg-primary/10 transition-colors"
                title="Edit module"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(module);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete module"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <span className="text-text-light ml-1">
            {expanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 border-t border-border-light/50">
          {/* Description */}
          {module.description && (
            <div className="py-3 border-b border-border-light/30">
              <p className="text-sm text-text-body leading-relaxed">{module.description}</p>
            </div>
          )}

          {/* Lesson List */}
          <div className="py-3">
            <LessonList module={module} isTeacher={isTeacher} onViewLesson={onViewLesson} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty States ─────────────────────────────────────────
function TeacherEmptyState({ onCreateModule }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <FiLayers className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
      </div>
      <h3 className="font-heading text-lg sm:text-xl font-bold text-text-dark mb-2">
        No Modules Yet
      </h3>
      <p className="text-sm text-text-body/70 text-center max-w-md mb-6">
        Start building your course by creating modules. Each module can contain
        lessons, assignments, and learning materials.
      </p>
      <button
        onClick={onCreateModule}
        className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm sm:text-base shadow-sm hover:shadow-md"
      >
        <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
        Create Module
      </button>
    </div>
  );
}

function StudentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
        <FiLayers className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
      </div>
      <h3 className="font-heading text-lg sm:text-xl font-bold text-text-dark mb-2">
        No Content Available
      </h3>
      <p className="text-sm text-text-body/70 text-center max-w-md">
        No course content has been published yet. Check back later when the
        instructor adds modules and lessons.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <FiLoader className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-sm text-text-light">Loading modules...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <FiAlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="font-heading text-lg font-bold text-text-dark mb-1">Failed to Load Modules</h3>
      <p className="text-sm text-text-body/70 text-center max-w-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light transition-colors text-sm"
      >
        <FiRefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}

// ─── Course Content (Teacher/Student) ──────────────────────
export default function CourseContent({ course, role }) {
  const isTeacher = role === 'teacher';
  const courseId = course?._id || course?.id || course?.course?._id;

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('order');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editModule, setEditModule] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  // Lesson viewer state
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedModuleName, setSelectedModuleName] = useState('');
  const [selectedModuleLessons, setSelectedModuleLessons] = useState([]);
  const [viewerLessonIndex, setViewerLessonIndex] = useState(0);

  // ─── Fetch Modules ─────────────────────────────────────
  const fetchModules = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      if (isTeacher) {
        const res = await moduleService.getModules(courseId);
        const data = res?.data || res;
        setModules(data?.data || data || []);
      } else {
        const res = await moduleService.getPublishedModules(courseId);
        const data = res?.data || res;
        setModules(data?.data || data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  }, [courseId, isTeacher]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // ─── Lesson Viewer Handlers ────────────────────────────
  const handleBackToContent = useCallback(() => {
    setSelectedLesson(null);
    setSelectedModuleName('');
    setSelectedModuleLessons([]);
    setViewerLessonIndex(0);
  }, []);

  const handleNavigateLesson = useCallback((lesson, index) => {
    setSelectedLesson(lesson);
    setViewerLessonIndex(index);
  }, []);

  const handleViewLesson = useCallback((lesson, moduleName, moduleLessons) => {
    if (!lesson) {
      handleBackToContent();
      return;
    }
    const lessonArray = Array.isArray(moduleLessons) ? moduleLessons : [];
    const index = lessonArray.findIndex(l => (l._id || l.id) === (lesson._id || lesson.id));
    setSelectedLesson(lesson);
    setSelectedModuleName(moduleName || '');
    setSelectedModuleLessons(lessonArray);
    setViewerLessonIndex(index >= 0 ? index : 0);
  }, [handleBackToContent]);

  const handleViewerEdit = useCallback(() => {
    handleBackToContent();
  }, [handleBackToContent]);

  const handleViewerDelete = useCallback(() => {
    handleBackToContent();
  }, [handleBackToContent]);

  const handleViewerPublish = useCallback(async (lessonId, currentlyPublished) => {
    try {
      if (currentlyPublished) {
        await lessonService.unpublishLesson(lessonId);
      } else {
        await lessonService.publishLesson(lessonId);
      }
      // Update the selected lesson in the viewer optimistically
      if (selectedLesson && (selectedLesson._id === lessonId || selectedLesson.id === lessonId)) {
        setSelectedLesson(prev => ({
          ...prev,
          isPublished: !currentlyPublished,
        }));
      }
    } catch (err) {
      setMutationError(err.message || 'Failed to update lesson status');
    }
  }, [selectedLesson]);

  // ─── Create / Edit Handlers ─────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditModule(null);
    setShowFormModal(true);
  }, []);

  const handleOpenEdit = useCallback((module) => {
    setEditModule(module);
    setShowFormModal(true);
  }, []);

  const handleFormSave = useCallback((savedModule) => {
    fetchModules(); // Refresh the list
  }, [fetchModules]);

  // ─── Delete Handler ─────────────────────────────────────
  const handleOpenDelete = useCallback((module) => {
    setDeleteTarget(module);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const id = deleteTarget._id || deleteTarget.id;
      await moduleService.deleteModule(id);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchModules();
    } catch (err) {
      setMutationError(err.message || 'Failed to delete module');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchModules]);

  // ─── Publish / Unpublish Handler ────────────────────────
  const handlePublishToggle = useCallback(async (moduleId, currentlyPublished) => {
    setTogglingPublish(moduleId);
    try {
      if (currentlyPublished) {
        await moduleService.unpublishModule(moduleId);
      } else {
        await moduleService.publishModule(moduleId);
      }
      fetchModules();
    } catch (err) {
      setMutationError(err.message || 'Failed to update module status');
    } finally {
      setTogglingPublish(null);
    }
  }, [fetchModules]);

  // ─── Sorting ────────────────────────────────────────────
  const sortedModules = [...modules].sort((a, b) => {
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });

  // ─── Reorder Handler ─────────────────────────────────────
  const handleMoveUp = useCallback(async (index) => {
    if (index <= 0) return;
    const ids = sortedModules.map(m => m._id || m.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    setReordering(true);
    try {
      await moduleService.reorderModules(courseId, ids);
      fetchModules();
    } catch (err) {
      setMutationError(err.message || 'Failed to reorder modules');
    } finally {
      setReordering(false);
    }
  }, [sortedModules, courseId, fetchModules]);

  const handleMoveDown = useCallback(async (index) => {
    if (index >= sortedModules.length - 1) return;
    const ids = sortedModules.map(m => m._id || m.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    setReordering(true);
    try {
      await moduleService.reorderModules(courseId, ids);
      fetchModules();
    } catch (err) {
      setMutationError(err.message || 'Failed to reorder modules');
    } finally {
      setReordering(false);
    }
  }, [sortedModules, courseId, fetchModules]);

  // ─── Header ─────────────────────────────────────────────
  const showHeader = modules.length > 0;
  const renderHeader = () =>
    showHeader ? (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-lg font-bold text-text-dark flex items-center gap-2">
            <FiLayers className="w-5 h-5 text-primary" />
            Course Content
          </h3>
          <p className="text-sm text-text-light mt-0.5">
            {isTeacher
              ? `${sortedModules.length} module${sortedModules.length !== 1 ? 's' : ''} · ${sortedModules.filter(m => m.isPublished).length} published`
              : `${sortedModules.length} module${sortedModules.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border-light bg-white text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="order">Default Order</option>
            <option value="title">Alphabetical</option>
            <option value="newest">Newest First</option>
          </select>
          {isTeacher && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm shadow-sm hover:shadow-md"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Module</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>
    ) : null;

  // ─── Render ─────────────────────────────────────────────
  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error && modules.length === 0) return <ErrorState message={error} onRetry={fetchModules} />;

    return (
      <>
        {renderHeader()}

        {/* Mutation error banner */}
        {mutationError && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{mutationError}</span>
            <button
              onClick={() => setMutationError(null)}
              className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center hover:bg-red-100 transition-colors"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {sortedModules.length > 0 ? (
          <div className="space-y-3">
            {reordering && (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-primary">
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Reordering modules...</span>
              </div>
            )}
            {sortedModules.map((module, idx) => (
              <ModuleCard
                key={module._id || module.id}
                module={module}
                index={idx}
                totalModules={sortedModules.length}
                isTeacher={isTeacher}
                sortBy={sortBy}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onViewLesson={handleViewLesson}
                onPublish={(id) => handlePublishToggle(id, false)}
                onUnpublish={(id) => handlePublishToggle(id, true)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}
          </div>
        ) : isTeacher ? (
          <TeacherEmptyState onCreateModule={handleOpenCreate} />
        ) : (
          <StudentEmptyState />
        )}

        {/* Module Stats Footer */}
        {isTeacher && sortedModules.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-4 px-4 sm:px-5 py-3 bg-bg-light/50 rounded-xl text-xs text-text-light">
            <span className="flex items-center gap-1.5">
              <FiLayers className="w-3.5 h-3.5" />
              {sortedModules.length} module{sortedModules.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <FiEye className="w-3.5 h-3.5" />
              {sortedModules.filter(m => m.isPublished).length} published
            </span>
            <span className="flex items-center gap-1.5">
              <FiFileText className="w-3.5 h-3.5" />
              Lessons coming in next phase
            </span>
          </div>
        )}
      </>
    );
  };

  // ─── If a lesson is selected, show the Lesson Viewer ───
  if (selectedLesson) {
    return (
      <>
        <LessonViewerPage
          lesson={selectedLesson}
          moduleName={selectedModuleName}
          lessons={selectedModuleLessons}
          lessonIndex={viewerLessonIndex}
          isTeacher={isTeacher}
          onBack={handleBackToContent}
          onEdit={handleViewerEdit}
          onDelete={handleViewerDelete}
          onPublish={handleViewerPublish}
          onNavigate={handleNavigateLesson}
        />
      </>
    );
  }

  return (
    <div>
      {renderContent()}

      {/* Module Form Modal (Create / Edit) */}
      <ModuleFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleFormSave}
        editModule={editModule}
        courseId={courseId}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
        moduleTitle={deleteTarget?.title || ''}
        deleting={deleting}
      />
    </div>
  );
}
