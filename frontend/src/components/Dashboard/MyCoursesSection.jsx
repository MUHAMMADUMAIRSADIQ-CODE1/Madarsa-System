import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentPortalService from '../../services/studentPortalService';
import courseService from '../../services/courseService';
import LmsCourseCard from '../LMS/LmsCourseCard';

export default function MyCoursesSection({ courses: propCourses }) {
  const { user } = useAuth();
  const [fetchedCourses, setFetchedCourses] = useState([]);
  const [assignedTeacherName, setAssignedTeacherName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const studentId = user?._id || user?.id;

  const fetchCourses = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      // STEP 1: Fetch dashboard to get student's enrolled courses and assigned teacher
      const res = await studentPortalService.getDashboard(studentId);
      const data = res?.data || res;
      const dashboardCourses = data?.courses || [];

      // Get assigned teacher name from the existing assignment relationship
      if (data?.assignedTeacher?.fullName) {
        setAssignedTeacherName(data.assignedTeacher.fullName);
      }

      // STEP 2: Enrich courses with full data from published courses
      // Dashboard only populates courses with minimal fields (title, slug)
      // Published courses API returns full fields via toPublicJSON()
      let enrichedCourses = dashboardCourses;
      try {
        const pubRes = await courseService.getPublishedCourses();
        const pubCourses = pubRes?.data?.data || [];

        enrichedCourses = dashboardCourses.map((enrollment) => {
          const ref = enrollment.course || enrollment;
          const refId = ref._id || ref.id;
          const fullCourse = pubCourses.find(c => (c._id === refId || c.id === refId));

          if (fullCourse) {
            return {
              ...enrollment,
              course: {
                ...fullCourse,
                // Preserve enrollment-specific data
                status: enrollment.status || fullCourse.status || 'active',
                progress: enrollment.progress || 0,
              },
            };
          }
          return enrollment;
        });
      } catch (_) {
        // Fallback: use dashboard data if enrichment fails
        console.warn('Could not enrich course data, using dashboard data');
      }

      setFetchedCourses(enrichedCourses);
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
  const teacherName = assignedTeacherName;

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
          {courses.map((course, i) => {
            const courseData = course.course || course;
            const enrichedCourse = {
              ...courseData,
              teacher: courseData.instructor || course.instructor || courseData.teacher || course.teacher || '',
            };
            return (
              <LmsCourseCard
                key={courseData._id || courseData.id || i}
                course={enrichedCourse}
                role="student"
                index={i}
                teacherName={teacherName}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
