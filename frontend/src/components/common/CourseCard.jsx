import { useState } from 'react';

export default function CourseCard({ course, actionText = 'Enroll Now', actionLink, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const descEl = course.description || '';
  const isLong = descEl.length > 80;
  const hasImage = course.image && !imgError;

  return (
    <article className="group relative bg-white rounded-2xl border border-border-light overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(11,79,48,0.12)] hover:-translate-y-1 flex flex-col h-full">
      {/* Course Image */}
      <div className={`relative h-36 overflow-hidden shrink-0 ${hasImage ? '' : `bg-gradient-to-br ${course.color}`}`}>
        {hasImage ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjMwLDAgNjAsMzAgMzAsNjAgMCwzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="#C9A84C" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.5l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1z" />
          </svg>
          <span className="text-[11px] font-bold text-text-dark">{course.rating}</span>
        </div>

        {/* Level Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-0.5 text-[11px] font-medium bg-white/90 backdrop-blur-sm text-text-dark rounded-lg">
            {course.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-5 flex flex-col flex-1 min-h-0">
        <h3 className="font-heading text-lg font-bold text-text-dark group-hover:text-primary transition-colors duration-300 leading-snug">
          {course.title}
        </h3>

        <div className="mt-2">
          <p className={`text-sm text-text-body/80 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
            {course.description}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors duration-200"
            >
              {expanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-text-light">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 5v5l3.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {course.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {course.teacher}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a6 6 0 00-6 6c0 3.5 3 5.5 6 9 3-3.5 6-5.5 6-9a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {course.students.toLocaleString()} students
          </span>
        </div>

        {/* CTA - pushed to bottom via mt-auto */}
        <div className="mt-auto pt-3 border-t border-border-light">
          {onAction ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction(course);
              }}
              className="group/btn inline-flex items-center justify-between w-full px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300 "
            >
              <span>{actionText}</span>
              <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <a
              href={actionLink || '/admissions'}
              className="group/btn inline-flex items-center justify-between w-full px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300 "
            >
              <span>{actionText}</span>
              <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}