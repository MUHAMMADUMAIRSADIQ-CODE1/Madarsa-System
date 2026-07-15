export default function CourseDetailCard({ course, index = 0 }) {
  return (
    <article
      className="group relative bg-white rounded-2xl border border-border-light overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(11,79,48,0.12)] hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${course.color}`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjMwLDAgNjAsMzAgMzAsNjAgMCwzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="#C9A84C" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.5l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1z" />
          </svg>
          <span className="text-xs font-bold text-text-dark">{course.rating}</span>
        </div>

        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="px-3 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-text-dark rounded-lg">{course.level}</span>
          <span className="px-3 py-1 text-xs font-medium bg-primary/90 backdrop-blur-sm text-white rounded-lg">{course.mode}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-7">
        <h3 className="font-heading text-xl font-bold text-text-dark group-hover:text-primary transition-colors duration-300">
          {course.title}
        </h3>
        <p className="mt-2 text-sm text-text-body/80 leading-relaxed line-clamp-2">{course.description}</p>

        {/* Meta Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2 text-xs text-text-light">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 5v5l3.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-light">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 14c.5 1.5 1.5 2 3 2s2.5-.5 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{course.teacher}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-light">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a6 6 0 00-6 6c0 3.5 3 5.5 6 9 3-3.5 6-5.5 6-9a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>{course.students.toLocaleString()} students</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-light">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Certificate {course.certificate ? 'Available' : 'N/A'}</span>
          </div>
        </div>

        {/* Languages */}
        <div className="mt-4 flex flex-wrap gap-2">
          {course.language.map((lang) => (
            <span key={lang} className="px-2.5 py-1 text-[11px] font-medium bg-primary-light text-primary rounded-lg">{lang}</span>
          ))}
        </div>

        {/* Schedule & Price */}
        <div className="mt-4 pt-4 border-t border-border-light space-y-1.5 text-xs text-text-light">
          <p className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {course.schedule}
          </p>
          <p className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {course.price}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-border-light flex gap-3">
          <a
            href={`#enroll-${course.id}`}
            className="flex-1 text-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl"
          >
            Enroll Now
          </a>
          <a
            href={`#details-${course.id}`}
            className="flex-1 text-center px-4 py-2.5 border-2 border-primary/30 text-primary text-sm font-semibold rounded-xl hover:bg-primary-light hover:border-primary transition-all duration-300"
          >
            View Details
          </a>
        </div>
      </div>
    </article>
  );
}