import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import courseService from '../services/courseService';
import {
  FiBook, FiClock, FiUser, FiUsers, FiStar,
  FiCheckCircle, FiCalendar, FiAward, FiBarChart2,
  FiRefreshCw,
} from 'react-icons/fi';
import { getGalleryPlaceholderSVG } from '../components/Gallery/GalleryPlaceholderSVGs';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-bg-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-4 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-bg-light flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <FiRefreshCw size={28} className="text-red-500" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-text-dark mb-2">Failed to Load Course</h1>
        <p className="text-text-body mb-6">{message || 'Please try again later.'}</p>
        {onRetry && (
          <button onClick={onRetry} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
            <FiRefreshCw size={16} />
            Retry
          </button>
        )}
        <Link to="/courses" className="block mt-4 text-primary hover:underline font-medium">
          Back to Courses
        </Link>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerError, setBannerError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const handleBannerError = useCallback(() => setBannerError(true), []);
  const handleThumbnailError = useCallback(() => setThumbnailError(true), []);

  const fetchCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try fetching by slug from public endpoint first
      const publicRes = await courseService.getPublishedCourses({ limit: 100 });
      const allCourses = publicRes?.data?.data || publicRes?.data || [];
      const found = allCourses.find(c => {
        const cSlug = c.slug || c.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return cSlug === slug || c._id === slug || c.id?.toString() === slug;
      });
      if (found) {
        // Fetch full detail including stats
        try {
          const detailRes = await courseService.getCourseDetailWithStats(found._id);
          if (detailRes?.data) {
            setCourseDetail(detailRes.data);
          } else {
            setCourseDetail({ course: found, teachers: { count: 0, list: [] }, students: { interestedCount: 0, assignedCount: 0, interested: [], assigned: [] } });
          }
        } catch {
          setCourseDetail({ course: found, teachers: { count: 0, list: [] }, students: { interestedCount: 0, assignedCount: 0, interested: [], assigned: [] } });
        }
      } else {
        setError('Course not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchCourse} />;
  if (!courseDetail) return <ErrorState message="Course not found" />;

  const course = courseDetail.course;
  const teachers = courseDetail.teachers || { count: 0, list: [] };
  const students = courseDetail.students || { interestedCount: 0, assignedCount: 0 };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const levelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-bg-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 sm:mb-8">
          <Link to="/" className="text-primary hover:underline">Home</Link>
          <span className="text-text-light">/</span>
          <Link to="/courses" className="text-primary hover:underline">Courses</Link>
          <span className="text-text-light">/</span>
          <span className="text-text-body truncate max-w-[200px]">{course.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Banner */}
            <div className="relative h-56 sm:h-72 md:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/20 to-primary-dark/20">
              {bannerError ? (
                <div className="w-full h-full">
                  {getGalleryPlaceholderSVG('course')}
                </div>
              ) : course.banner ? (
                <img
                  src={course.banner}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={handleBannerError}
                />
              ) : thumbnailError ? (
                <div className="w-full h-full">
                  {getGalleryPlaceholderSVG('course')}
                </div>
              ) : course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={handleThumbnailError}
                />
              ) : (
                <div className="w-full h-full">
                  {getGalleryPlaceholderSVG('course')}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {course.level && (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${levelColor(course.level)}`}>
                      {course.level}
                    </span>
                  )}
                  {course.status === 'published' && (
                    <span className="px-3 py-1.5 bg-green-500/90 rounded-lg text-xs font-bold text-white">
                      Published
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Title & Meta */}
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-3 sm:mb-4">
                {course.title}
              </h1>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                {course.duration && (
                  <span className="flex items-center gap-1.5 text-text-body">
                    <FiClock size={16} className="text-text-light" />
                    {course.duration}
                  </span>
                )}
                {course.totalLessons > 0 && (
                  <span className="flex items-center gap-1.5 text-text-body">
                    <FiBook size={16} className="text-text-light" />
                    {course.totalLessons} Lessons
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-text-body">
                  <FiUser size={16} className="text-text-light" />
                  {teachers.count} Teacher{teachers.count !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5 text-text-body">
                  <FiUsers size={16} className="text-text-light" />
                  {students.interestedCount} Interested
                </span>
                {course.language && (
                  <span className="flex items-center gap-1.5 text-text-body">
                    <FiStar size={16} className="text-text-light" />
                    {course.language}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {(course.shortDescription || course.fullDescription) && (
              <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-border-light">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-4">
                  About This Course
                </h2>
                {course.shortDescription && (
                  <p className="text-text-body text-base sm:text-lg leading-relaxed mb-4">
                    {course.shortDescription}
                  </p>
                )}
                {course.fullDescription && (
                  <div className="text-text-body leading-relaxed whitespace-pre-line">
                    {course.fullDescription}
                  </div>
                )}
              </div>
            )}

            {/* Course Info Grid */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-border-light">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-6">
                Course Details
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {course.categoryName && (
                  <div className="bg-bg-light rounded-xl p-4">
                    <p className="text-xs text-text-light font-medium mb-1">Category</p>
                    <p className="font-semibold text-text-dark">{course.categoryName}</p>
                  </div>
                )}
                {course.duration && (
                  <div className="bg-bg-light rounded-xl p-4">
                    <p className="text-xs text-text-light font-medium mb-1">Duration</p>
                    <p className="font-semibold text-text-dark">{course.duration}</p>
                  </div>
                )}
                {course.level && (
                  <div className="bg-bg-light rounded-xl p-4">
                    <p className="text-xs text-text-light font-medium mb-1">Level</p>
                    <p className="font-semibold text-text-dark capitalize">{course.level}</p>
                  </div>
                )}
                {course.language && (
                  <div className="bg-bg-light rounded-xl p-4">
                    <p className="text-xs text-text-light font-medium mb-1">Language</p>
                    <p className="font-semibold text-text-dark">{course.language}</p>
                  </div>
                )}
                {course.totalLessons > 0 && (
                  <div className="bg-bg-light rounded-xl p-4">
                    <p className="text-xs text-text-light font-medium mb-1">Total Lessons</p>
                    <p className="font-semibold text-text-dark">{course.totalLessons}</p>
                  </div>
                )}
                <div className="bg-bg-light rounded-xl p-4">
                  <p className="text-xs text-text-light font-medium mb-1">Certificate</p>
                  <p className={`font-semibold ${course.certificateAvailable ? 'text-green-600' : 'text-text-light'}`}>
                    {course.certificateAvailable ? 'Yes' : 'No'}
                  </p>
                </div>
                {course.maxStudents && (
                  <div className="bg-bg-light rounded-xl p-4">
                    <p className="text-xs text-text-light font-medium mb-1">Max Students</p>
                    <p className="font-semibold text-text-dark">{course.maxStudents}</p>
                  </div>
                )}
                {course.createdAt && (
                  <div className="bg-bg-light rounded-xl p-4">
                    <p className="text-xs text-text-light font-medium mb-1">Created</p>
                    <p className="font-semibold text-text-dark text-sm">{formatDate(course.createdAt)}</p>
                  </div>
                )}
                {course.updatedAt && (
                  <div className="bg-bg-light rounded-xl p-4">
                    <p className="text-xs text-text-light font-medium mb-1">Last Updated</p>
                    <p className="font-semibold text-text-dark text-sm">{formatDate(course.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Teachers */}
            {teachers.list && teachers.list.length > 0 && (
              <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-border-light">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-4 flex items-center gap-2">
                  <FiUser size={22} className="text-primary" />
                  Assigned Teachers ({teachers.count})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {teachers.list.map((t) => (
                    <div key={t._id} className="flex items-start gap-3 p-4 bg-bg-light rounded-xl hover:shadow-sm transition-shadow">
                      {t.profilePhoto ? (
                        <img src={t.profilePhoto} alt={t.fullName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FiUser size={18} className="text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-text-dark text-sm truncate">{t.fullName}</p>
                        {t.qualification && (
                          <p className="text-xs text-text-light truncate">{t.qualification}</p>
                        )}
                        {t.specialization && (
                          <p className="text-xs text-text-light truncate">{t.specialization}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-border-light">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-4">
                Course Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Certificate Available', active: course.certificateAvailable },
                  { label: 'Featured Course', active: course.featured },
                  { label: 'Popular Course', active: course.popular },
                  { label: 'Trending', active: course.trending },
                ].map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-bg-light">
                    <FiCheckCircle size={18} className={f.active ? 'text-green-500' : 'text-gray-300'} />
                    <span className={`text-sm font-medium ${f.active ? 'text-text-dark' : 'text-text-light'}`}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 sticky top-28 space-y-5 border border-border-light">
              {/* Course Image */}
              {course.thumbnail && !thumbnailError ? (
                <div className="rounded-xl overflow-hidden border border-border-light">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                    onError={handleThumbnailError}
                  />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-border-light h-40">
                  {getGalleryPlaceholderSVG('course')}
                </div>
              )}

              {/* Quick Stats */}
              <div className="space-y-4">
                <h3 className="font-heading text-base font-bold text-text-dark">Quick Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Teachers', value: teachers.count, icon: FiUser, color: 'text-blue-600' },
                    { label: 'Interested Students', value: students.interestedCount, icon: FiUsers, color: 'text-purple-600' },
                    { label: 'Assigned Students', value: students.assignedCount, icon: FiAward, color: 'text-green-600' },
                    { label: 'Duration', value: course.duration || '-', icon: FiClock, color: 'text-orange-600' },
                    { label: 'Level', value: course.level || '-', icon: FiBarChart2, color: 'text-primary' },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                      <div className="flex items-center gap-2">
                        <stat.icon size={14} className={stat.color} />
                        <span className="text-xs sm:text-sm text-text-light">{stat.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3 pt-4 border-t border-border-light text-xs text-text-light">
                {course.createdAt && (
                  <div className="flex items-center gap-2">
                    <FiCalendar size={12} />
                    Created: {formatDate(course.createdAt)}
                  </div>
                )}
                {course.updatedAt && (
                  <div className="flex items-center gap-2">
                    <FiCalendar size={12} />
                    Updated: {formatDate(course.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
