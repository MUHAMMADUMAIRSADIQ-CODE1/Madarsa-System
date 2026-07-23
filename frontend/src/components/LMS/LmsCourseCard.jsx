import { useNavigate } from 'react-router-dom';
import {
  FiBookOpen, FiClock, FiUser, FiGlobe, FiAward, FiBarChart2,
  FiTrendingUp, FiStar, FiZap, FiUsers,
} from 'react-icons/fi';

const levelConfig = {
  beginner: { label: 'Beginner', color: 'bg-green-100 text-green-800 border-green-200' },
  intermediate: { label: 'Intermediate', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  advanced: { label: 'Advanced', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  all: { label: 'All Levels', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
};

const statusConfig = {
  featured: { label: 'Featured', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: FiStar },
  popular: { label: 'Popular', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: FiZap },
  trending: { label: 'Trending', color: 'bg-sky-100 text-sky-800 border-sky-200', icon: FiTrendingUp },
};

export default function LmsCourseCard({ course, role = 'teacher', index = 0, teacherName }) {
  const navigate = useNavigate();
  const courseData = course.course || course;
  const courseId = courseData._id || courseData.id;
  const level = courseData.level || '';
  const levelInfo = levelConfig[level] || null;
  const basePath = role === 'teacher' ? '/teacher/my-courses' : '/student/my-courses';

  // Build badges array from course flags
  const badges = [];
  if (courseData.certificateAvailable) {
    badges.push({ label: 'Certificate', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: FiAward });
  }
  if (courseData.featured) badges.push(statusConfig.featured);
  if (courseData.popular) badges.push(statusConfig.popular);
  if (courseData.trending) badges.push(statusConfig.trending);

  // Determine teacher to display - from the assignment relationship
  const displayTeacher = teacherName
    || courseData.teacher
    || courseData.teacherName
    || courseData.instructor
    || '';

  const handleClick = () => {
    navigate(`${basePath}/${courseId}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group relative bg-white rounded-2xl border border-border-light overflow-hidden transition-all duration-500 cursor-pointer
        hover:shadow-[0_8px_40px_rgba(11,79,48,0.12)] hover:-translate-y-1.5 hover:border-primary/30
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* ─── Banner Image ─── */}
      <div className="relative h-44 sm:h-48 lg:h-52 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-primary-dark/10">
        {courseData.banner ? (
          <img
            src={courseData.banner}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary-dark/20">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,0 60,30 30,60 0,30' fill='none' stroke='rgba(11,79,48,0.3)' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
            }} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges row - top right */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 justify-end max-w-[calc(100%-1.5rem)]">
          {badges.slice(0, 2).map((badge) => {
            const BadgeIcon = badge.icon;
            return (
              <span
                key={badge.label}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border shadow-sm ${badge.color}`}
              >
                <BadgeIcon className="w-3 h-3" />
                {badge.label}
              </span>
            );
          })}
        </div>

        {/* Level badge - bottom left */}
        <div className="absolute bottom-3 left-3">
          {levelInfo && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-white/95 backdrop-blur-sm shadow-sm ${levelInfo.color}`}>
              <FiBarChart2 className="w-3 h-3" />
              {levelInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* ─── Card Content ─── */}
      <div className="p-4 sm:p-5 pt-5">
        {/* Category */}
        {courseData.categoryName && (
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
            {courseData.categoryName}
          </p>
        )}

        {/* Title */}
        <h3 className="font-heading text-lg sm:text-xl font-bold text-text-dark leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {courseData.title || courseData.name}
        </h3>

        {/* Short Description */}
        {courseData.shortDescription && (
          <p className="mt-2 text-xs sm:text-sm text-text-body/80 leading-relaxed line-clamp-2">
            {courseData.shortDescription}
          </p>
        )}

        {/* Meta row - only show fields with actual data */}
        {(courseData.duration || courseData.language || (courseData.totalLessons > 0) || (courseData.enrolledCount !== undefined && courseData.enrolledCount >= 0)) && (
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-light">
            {courseData.duration && (
              <span className="flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{courseData.duration}</span>
              </span>
            )}
            {courseData.language && (
              <span className="flex items-center gap-1.5">
                <FiGlobe className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{courseData.language}</span>
              </span>
            )}
            {courseData.totalLessons > 0 && (
              <span className="flex items-center gap-1.5">
                <FiBookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{courseData.totalLessons} {courseData.totalLessons === 1 ? 'Lesson' : 'Lessons'}</span>
              </span>
            )}
            {courseData.enrolledCount !== undefined && courseData.enrolledCount >= 0 && (
              <span className="flex items-center gap-1.5">
                <FiUsers className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{courseData.enrolledCount} Enrolled</span>
              </span>
            )}
          </div>
        )}

        {/* Certificate badge inline */}
        {courseData.certificateAvailable && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <FiAward className="w-3.5 h-3.5" />
            <span>Certificate Available</span>
          </div>
        )}

        {/* Divider + Teacher + Action */}
        <div className="mt-4 pt-3 border-t border-border-light">
          <div className="flex items-center justify-between gap-2">
            {/* Teacher - from assignment relationship */}
            {displayTeacher ? (
              <span className="flex items-center gap-1.5 text-xs text-text-light min-w-0">
                <FiUser className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{displayTeacher}</span>
              </span>
            ) : <div />}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all duration-300 flex-shrink-0">
              <span>Open Course</span>
              <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hover accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary-dark scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </article>
  );
}
