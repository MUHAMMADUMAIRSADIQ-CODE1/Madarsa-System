import {
  FiPlay, FiFile, FiFileText, FiExternalLink, FiChevronDown,
  FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiChevronUp, FiClock, FiStar, FiArrowRight,
} from 'react-icons/fi';

const typeConfig = {
  video: { icon: FiPlay, color: 'text-red-500 bg-red-50 border-red-200' },
  pdf: { icon: FiFile, color: 'text-red-600 bg-red-50 border-red-200' },
  document: { icon: FiFileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  external_link: { icon: FiExternalLink, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  text: { icon: FiFileText, color: 'text-green-600 bg-green-50 border-green-200' },
};

export default function LessonCard({
  lesson,
  index,
  totalLessons,
  isTeacher,
  sortBy,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onMoveUp,
  onMoveDown,
}) {
  const lessonId = lesson._id || lesson.id;
  const isPublished = lesson.isPublished;
  const isPreview = lesson.isPreviewFree;
  const type = lesson.lessonType || 'text';
  const typeInfo = typeConfig[type] || typeConfig.text;
  const TypeIcon = typeInfo.icon;

  return (
    <div className="rounded-xl border border-border-light overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-sm">
      {/* Lesson Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onView(lesson)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(lesson); } }}
        className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-bg-light/50 transition-colors group cursor-pointer select-none"
      >
        {/* Type icon */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${typeInfo.color.split(' ').slice(1).join(' ')}`}>
          <TypeIcon className="w-3.5 h-3.5" />
        </div>

        {/* Lesson info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs font-semibold ${
              isPublished ? 'text-text-dark' : 'text-text-light'
            }`}>
              {index + 1}. {lesson.title}
            </span>

            {/* Badges */}
            {isPublished && isTeacher && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-green-100 text-green-700">
                Published
              </span>
            )}
            {!isPublished && isTeacher && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-yellow-100 text-yellow-700">
                Draft
              </span>
            )}
            {isPreview && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-700">
                <FiStar className="w-2.5 h-2.5" />
                Preview
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {lesson.duration && (
              <span className="flex items-center gap-1 text-[10px] text-text-light">
                <FiClock className="w-3 h-3" />
                {lesson.duration}
              </span>
            )}
            {lesson.shortDescription && (
              <span className="text-[10px] text-text-body/60 truncate max-w-[200px]">
                {lesson.shortDescription}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {isTeacher && (
            <>
              {/* Reorder up/down */}
              {sortBy === 'order' && (
                <div className="flex flex-col gap-0.5 mr-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
                    disabled={index === 0}
                    className="w-4 h-3.5 rounded flex items-center justify-center text-text-light/30 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <FiChevronUp className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
                    disabled={index === totalLessons - 1}
                    className="w-4 h-3.5 rounded flex items-center justify-center text-text-light/30 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <FiChevronDown className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {/* Publish toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); onPublish(lessonId, isPublished); }}
                className="w-6 h-6 rounded flex items-center justify-center text-text-light hover:text-primary hover:bg-primary/10 transition-colors"
                title={isPublished ? 'Unpublish' : 'Publish'}
              >
                {isPublished ? <FiEyeOff className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
              </button>

              {/* Edit */}
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(lesson); }}
                className="w-6 h-6 rounded flex items-center justify-center text-text-light hover:text-primary hover:bg-primary/10 transition-colors"
                title="Edit"
              >
                <FiEdit2 className="w-3 h-3" />
              </button>

              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(lesson); }}
                className="w-6 h-6 rounded flex items-center justify-center text-text-light hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <FiTrash2 className="w-3 h-3" />
              </button>
            </>
          )}
          <span className="text-text-light ml-0.5 transition-transform group-hover:translate-x-0.5">
            <FiArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
