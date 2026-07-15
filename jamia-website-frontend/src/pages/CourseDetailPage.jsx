import { useParams, useNavigate, Link } from 'react-router-dom';
import coursesData from '../data/coursesData';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Find course by slug or id
  const course = coursesData.courses.find(c => {
    const courseSlug = c.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return courseSlug === slug || c.id.toString() === slug;
  });

  if (!course) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-text-dark mb-4">
            Course Not Found
          </h1>
          <p className="text-text-body mb-8">
            The course you're looking for doesn't exist.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-bg-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-primary hover:underline">Home</Link>
          <span className="text-text-light">/</span>
          <Link to="/courses" className="text-primary hover:underline">Courses</Link>
          <span className="text-text-light">/</span>
          <span className="text-text-body">{course.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className={`h-96 rounded-3xl bg-gradient-to-br ${course.color} relative overflow-hidden shadow-lg`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-2 bg-white/95 rounded-lg text-sm font-semibold text-text-dark">
                    {course.level}
                  </span>
                  <span className="px-4 py-2 bg-primary/95 rounded-lg text-sm font-semibold text-white">
                    {course.mode}
                  </span>
                </div>
              </div>
            </div>

            {/* Course Title & Meta */}
            <div>
              <h1 className="font-heading text-4xl font-bold text-text-dark mb-4">
                {course.title}
              </h1>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-text-dark">{course.rating}/5.0</span>
                </div>
                <div className="flex items-center gap-2 text-text-body">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-text-body">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{course.students} Students</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">
                About This Course
              </h2>
              <p className="text-text-body text-lg leading-relaxed mb-6">
                {course.description}
              </p>
            </div>

            {/* Course Details Grid */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">
                Course Details
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-border-light">
                  <p className="text-xs text-text-light font-medium mb-2">Instructor</p>
                  <p className="font-semibold text-text-dark">{course.teacher}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-border-light">
                  <p className="text-xs text-text-light font-medium mb-2">Duration</p>
                  <p className="font-semibold text-text-dark">{course.duration}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-border-light">
                  <p className="text-xs text-text-light font-medium mb-2">Level</p>
                  <p className="font-semibold text-text-dark">{course.level}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-border-light">
                  <p className="text-xs text-text-light font-medium mb-2">Mode</p>
                  <p className="font-semibold text-text-dark">{course.mode}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-border-light">
                  <p className="text-xs text-text-light font-medium mb-2">Schedule</p>
                  <p className="font-semibold text-text-dark">{course.schedule}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-border-light">
                  <p className="text-xs text-text-light font-medium mb-2">Certificate</p>
                  <p className="font-semibold text-green-600">{course.certificate ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">
                Languages
              </h2>
              <div className="flex flex-wrap gap-3">
                {course.language.map(lang => (
                  <span key={lang} className="px-4 py-2 bg-primary-light text-primary font-semibold rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* What You'll Learn */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">
                What You'll Learn
              </h2>
              <ul className="space-y-3">
                {[
                  'Comprehensive understanding of course material',
                  'Practical skills applicable in real-world scenarios',
                  'Certification upon successful completion',
                  'Access to course materials and resources',
                  'One-on-one guidance from qualified instructors',
                  'Community support and peer learning',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-text-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Enrollment Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28 space-y-6">
              <div>
                <p className="text-3xl font-heading font-bold text-text-dark mb-2">
                  {course.price}
                </p>
                <p className="text-sm text-text-light">
                  All courses are donation-based to ensure accessibility for all
                </p>
              </div>

              <button className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 hover:shadow-xl">
                Enroll Now
              </button>

              <button className="w-full py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary-light transition-all">
                Add to Wishlist
              </button>

              {/* Course Stats */}
              <div className="space-y-4 pt-4 border-t border-border-light">
                <div className="flex items-center justify-between">
                  <span className="text-text-light text-sm">Students Enrolled</span>
                  <span className="font-bold text-text-dark">{course.students}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-light text-sm">Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-text-dark">{course.rating}</span>
                    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="space-y-3 pt-4 border-t border-border-light">
                <p className="text-sm font-semibold text-text-dark">Share This Course</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    Facebook
                  </button>
                  <button className="flex-1 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition text-sm font-medium">
                    Twitter
                  </button>
                  <button className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium">
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Courses */}
        <div className="mt-16">
          <h2 className="font-heading text-3xl font-bold text-text-dark mb-8">
            Related Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesData.courses
              .filter(c => c.category === course.category && c.id !== course.id)
              .slice(0, 3)
              .map(relatedCourse => (
                <Link
                  key={relatedCourse.id}
                  to={`/course/${relatedCourse.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`h-40 bg-gradient-to-br ${relatedCourse.color}`} />
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-text-dark group-hover:text-primary transition-colors">
                      {relatedCourse.title}
                    </h3>
                    <p className="text-sm text-text-light mt-2">By {relatedCourse.teacher}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light">
                      <span className="text-xs font-semibold text-text-light">{relatedCourse.duration}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-bold text-text-dark">{relatedCourse.rating}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
