import { useParams, Link } from 'react-router-dom';
import { authData } from '../data/authData';

// Sample teachers data - expanded from authData
const teachersDirectory = [
  {
    id: 'teacher-001',
    name: 'Sheikh Muhammad Ali',
    slug: 'sheikh-muhammad-ali',
    email: 'teacher@example.com',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    bio: 'With over 10 years of experience in Islamic education, Sheikh Muhammad Ali is dedicated to teaching the Quran and Islamic studies with authentic methodologies.',
    qualification: 'MA Islamic Studies',
    specialization: 'Quranic Sciences',
    experience: '10 years',
    students: 150,
    courses: ['Quran Recitation', 'Tafseer', 'Islamic Studies'],
    rating: 4.9,
    reviews: 45,
    languages: ['Urdu', 'English', 'Arabic'],
    availability: 'Available for online sessions',
    phone: '+1-555-987-6543',
    country: 'Pakistan',
    city: 'Islamabad',
  },
  {
    id: 'teacher-002',
    name: 'Qari Abdul Rahman',
    slug: 'qari-abdul-rahman',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Certified Qari with expertise in Tajweed and Quranic recitation. Passionate about teaching proper pronunciation and articulation points.',
    qualification: 'Ijazah (Certification)',
    specialization: 'Tajweed & Quranic Recitation',
    experience: '8 years',
    students: 120,
    courses: ['Quran Reading with Tajweed'],
    rating: 4.8,
    reviews: 38,
    languages: ['Urdu', 'English'],
    availability: 'Available for online sessions',
  },
  {
    id: 'teacher-003',
    name: 'Dr. Syed Hassan',
    slug: 'dr-syed-hassan',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    bio: 'PhD in Islamic Studies with specialization in Quranic interpretation. Author of several books on Tafseer methodology.',
    qualification: 'PhD Islamic Studies',
    specialization: 'Tafseer & Islamic Jurisprudence',
    experience: '15 years',
    students: 200,
    courses: ['Tafseer-ul-Quran', 'Islamic Law'],
    rating: 4.9,
    reviews: 62,
    languages: ['Urdu', 'English', 'Arabic'],
    availability: 'Available for online sessions',
  },
];

export default function TeacherDetailPage() {
  const { slug } = useParams();
  
  // Find teacher by slug
  const teacher = teachersDirectory.find(t => t.slug === slug);

  if (!teacher) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-text-dark mb-4">
            Teacher Not Found
          </h1>
          <p className="text-text-body mb-8">
            The teacher profile you're looking for doesn't exist.
          </p>
          <Link
            to="/teachers"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all"
          >
            Back to Teachers
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
          <Link to="/teachers" className="text-primary hover:underline">Teachers</Link>
          <span className="text-text-light">/</span>
          <span className="text-text-body">{teacher.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Card */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-primary to-gold" />
              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-24 mb-6">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
                  />
                  <div className="flex-1">
                    <h1 className="font-heading text-3xl font-bold text-text-dark mb-2">
                      {teacher.name}
                    </h1>
                    <p className="text-primary font-semibold mb-3">
                      {teacher.specialization}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-text-dark">{teacher.rating}/5.0</span>
                        <span className="text-sm text-text-light">({teacher.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-body">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{teacher.students} Students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">
                About
              </h2>
              <p className="text-text-body text-lg leading-relaxed mb-6">
                {teacher.bio}
              </p>
            </div>

            {/* Qualifications & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-border-light">
                <h3 className="font-heading font-bold text-text-dark mb-3">
                  Qualification
                </h3>
                <p className="text-text-body font-semibold">
                  {teacher.qualification}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-border-light">
                <h3 className="font-heading font-bold text-text-dark mb-3">
                  Experience
                </h3>
                <p className="text-text-body font-semibold">
                  {teacher.experience}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-border-light">
                <h3 className="font-heading font-bold text-text-dark mb-3">
                  Specialization
                </h3>
                <p className="text-text-body font-semibold">
                  {teacher.specialization}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-border-light">
                <h3 className="font-heading font-bold text-text-dark mb-3">
                  Availability
                </h3>
                <p className="text-text-body font-semibold">
                  {teacher.availability}
                </p>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">
                Languages
              </h2>
              <div className="flex flex-wrap gap-3">
                {teacher.languages.map(lang => (
                  <span key={lang} className="px-4 py-2 bg-primary-light text-primary font-semibold rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Teaching Courses */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">
                Courses Taught
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacher.courses.map(course => (
                  <div key={course} className="bg-white rounded-xl p-4 shadow-md border-l-4 border-primary">
                    <h3 className="font-semibold text-text-dark">
                      {course}
                    </h3>
                    <p className="text-xs text-text-light mt-1">
                      Led by {teacher.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expertise */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">
                Expertise Areas
              </h2>
              <ul className="space-y-3">
                {[
                  'Authentic Islamic Education',
                  'Student-Centered Teaching',
                  'Modern Learning Technologies',
                  'Individual & Group Sessions',
                  'Personalized Learning Plans',
                  'Progress Tracking & Assessment',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-text-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonials */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">
                Student Reviews
              </h2>
              <div className="space-y-4">
                {[
                  {
                    name: 'Ahmed Hassan',
                    rating: 5,
                    comment: 'Sheikh Muhammad Ali is an excellent teacher. His teaching style is clear and easy to understand. Highly recommended!',
                    course: 'Quran Recitation',
                  },
                  {
                    name: 'Fatima Khan',
                    rating: 5,
                    comment: 'Very professional and dedicated to his students. I have learned a lot from his courses.',
                    course: 'Islamic Studies',
                  },
                  {
                    name: 'Omar Ibrahim',
                    rating: 4,
                    comment: 'Great teacher with deep knowledge. Very helpful and patient with students.',
                    course: 'Tafseer',
                  },
                ].map((review, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-md border border-border-light">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-text-dark">{review.name}</p>
                        <p className="text-xs text-text-light">{review.course}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array(5).fill(0).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-gold' : 'text-text-light'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-text-body text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28 space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-text-dark mb-4">
                  Get in Touch
                </h3>
              </div>

              <button className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 hover:shadow-xl">
                Book Session
              </button>

              <button className="w-full py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary-light transition-all">
                Send Message
              </button>

              {/* Stats */}
              <div className="space-y-4 pt-4 border-t border-border-light">
                <div className="flex items-center justify-between">
                  <span className="text-text-light text-sm">Students</span>
                  <span className="font-bold text-text-dark">{teacher.students}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-light text-sm">Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-text-dark">{teacher.rating}</span>
                    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-light text-sm">Experience</span>
                  <span className="font-bold text-text-dark">{teacher.experience}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-4 border-t border-border-light">
                {teacher.phone && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 4.493a1 1 0 00.502 1.21l2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493-1.498a1 1 0 00.684-.949V7a2 2 0 00-2-2h-2.28a1 1 0 00-.948.684l-1.498 4.493a1 1 0 00-.502 1.21l2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493-1.498a1 1 0 00.684-.949V7a2 2 0 00-2-2h-.28a1 1 0 00-.948.684l-1.498 4.493a1 1 0 00-.502 1.21l2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493-1.498a1 1 0 00.684-.949V7a2 2 0 00-2-2h-2.28a1 1 0 00-.948.684l-1.498 4.493a1 1 0 00-.502 1.21l2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493-1.498a1 1 0 00.684-.949V7a2 2 0 00-2-2h-.28a1 1 0 00-.948.684l-1.498 4.493a1 1 0 00-.502 1.21l2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493-1.498a1 1 0 00.684-.949V7a2 2 0 00-2-2h-.28a1 1 0 00-.948.684l-1.498 4.493a1 1 0 00-.502 1.21l2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493-1.498a1 1 0 00.684-.949V7a2 2 0 00-2-2h-.28a1 1 0 00-.948.684l-1.498 4.493a1 1 0 00-.502 1.21l2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493-1.498a1 1 0 00.684-.949V7a2 2 0 00-2-2h-.28a1 1 0 00-.948.684l-1.498 4.493a1 1 0 00-.502 1.21l2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493-1.498a1 1 0 00.684-.949V7a2 2 0 00-2-2h-.28a1 1 0 00-.948.684l-1.498 4.493a1 1 0 00-.502 1.21l2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493-1.498a1 1 0 00.684-.949V7a2 2 0 00-2-2h-.28" />
                    </svg>
                    <span className="text-sm text-text-body">{teacher.phone}</span>
                  </div>
                )}
                {teacher.email && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-text-body">{teacher.email}</span>
                  </div>
                )}
                {teacher.city && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-text-body">{teacher.city}, {teacher.country}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-3 pt-4 border-t border-border-light">
                <p className="text-sm font-semibold text-text-dark">Follow</p>
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
      </div>
    </div>
  );
}
