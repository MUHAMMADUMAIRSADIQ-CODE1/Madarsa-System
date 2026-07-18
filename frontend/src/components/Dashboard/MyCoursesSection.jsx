import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentPortalService from '../../services/studentPortalService';

export default function MyCoursesSection({ courses: propCourses }) {
  const { user } = useAuth();
  const [fetchedCourses, setFetchedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const studentId = user?._id || user?.id;

  const fetchCourses = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await studentPortalService.getDashboard(studentId);
      const data = res?.data || res;
      setFetchedCourses(data?.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (propCourses === undefined) {
      fetchCourses();
    }
  }, [propCourses, fetchCourses]);

  const courses = propCourses !== undefined ? propCourses : fetchedCourses;
  const isEmpty = !loading && !error && courses.length === 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">My Courses</h2>
        <a href="#" className="text-primary font-semibold text-sm hover:underline">View All</a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-md border border-border-light animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-200 rounded w-full mt-4" />
                <div className="h-10 bg-gray-200 rounded w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-12">
          <p className="text-text-light font-medium">No courses enrolled yet</p>
          <p className="text-sm text-text-light mt-2">Courses will appear here once you are enrolled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const courseData = course.course || course;
            const courseId = courseData._id || course.id;
            const progress = course.progress || 0;
            return (
              <div
                key={courseId}
                className="group rounded-xl overflow-hidden shadow-md border border-border-light hover:shadow-xl hover:border-primary transition-all duration-300"
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary-dark/20 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-primary opacity-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25m20-11c5.5 0 10 4.745 10 11m-15-6.25c0-4.418-3.582-8-8-8" />
                    </svg>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full">
                    <p className="text-xs font-bold text-primary">{progress}%</p>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-text-dark text-lg group-hover:text-primary transition-colors">
                    {courseData.title || courseData.name || 'Course'}
                  </h3>
                  <p className="text-sm text-text-light mt-1">
                    {courseData.instructor || course.instructor || courseData.level || ''}
                  </p>

                  {progress > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-text-light">Progress</p>
                        <p className="text-xs font-semibold text-primary">{progress}%</p>
                      </div>
                      <div className="h-2 bg-bg-light rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                      (course.status || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                      (course.status || 'active') === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      (course.status || 'active') === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status || 'active'}
                    </span>
                    {courseData.level && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize bg-primary/10 text-primary">
                        {courseData.level}
                      </span>
                    )}
                  </div>

                  <button className="w-full mt-3 py-2 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm">
                    Continue Learning
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
