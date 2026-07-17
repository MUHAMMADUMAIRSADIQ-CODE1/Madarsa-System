import { useState, useEffect, useCallback } from 'react';
import teacherAcademicService from '../../services/teacherAcademicService';
import { useAuth } from '../../context/AuthContext';
import {
  FiUsers, FiBook, FiCalendar, FiClock, FiSearch,
  FiChevronLeft, FiChevronRight, FiExternalLink
} from 'react-icons/fi';

export default function TeacherCoursesSection({ onViewCourse }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const teacherId = user?._id || user?.id;

  const fetchCourses = useCallback(async (p = 1) => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (levelFilter) params.level = levelFilter;

      const res = await teacherAcademicService.getMyCourses(teacherId, params);
      const responseData = res?.data || res;
      setCourses(responseData?.courses || []);
      setTotalPages(responseData?.totalPages || Math.ceil((responseData?.total || 0) / 10) || 1);
      setTotal(responseData?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [teacherId, searchQuery, levelFilter]);

  useEffect(() => {
    fetchCourses(page);
  }, [page, fetchCourses]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, levelFilter]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-dark">My Courses</h2>
          <p className="text-sm text-text-light mt-1">
            {total > 0 ? `${total} course${total !== 1 ? 's' : ''} assigned to you` : 'Courses assigned to you by admin'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            placeholder="Search courses by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
          />
        </div>
        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
          className="px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="all">All Levels</option>
        </select>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <FiBook className="w-16 h-16 text-border-light mx-auto mb-4" />
          <p className="text-text-light font-medium">No courses assigned yet</p>
          <p className="text-sm text-text-light mt-2">
            Courses will appear here once the admin assigns them to you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-border-light hover:border-primary hover:shadow-md transition-all cursor-pointer"
              onClick={() => onViewCourse && onViewCourse(course)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-text-dark text-lg truncate">
                    {course.title}
                  </h3>
                  {course.code && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono font-bold">
                      {course.code}
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-light">
                  {course.shortDescription && (
                    <p className="w-full text-text-body text-xs mb-1 line-clamp-1">
                      {course.shortDescription}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {course.batch && (
                      <span className="flex items-center gap-1">
                        <FiUsers className="w-4 h-4" />
                        Batch: {course.batch}
                      </span>
                    )}
                    {course.section && (
                      <span className="flex items-center gap-1">
                        <FiBook className="w-4 h-4" />
                        Section: {course.section}
                      </span>
                    )}
                    {course.academicYear && (
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {course.academicYear}
                      </span>
                    )}
                    {course.enrolledCount > 0 && (
                      <span className="flex items-center gap-1">
                        <FiUsers className="w-4 h-4" />
                        {course.enrolledCount} Students
                      </span>
                    )}
                    {course.createdAt && (
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {formatDate(course.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onViewCourse && onViewCourse(course); }}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm whitespace-nowrap"
                >
                  <FiExternalLink className="w-4 h-4 inline mr-1.5" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-light">
          <p className="text-sm text-text-light">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50 transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50 transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
