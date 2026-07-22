import React, { useState, useMemo, useCallback } from 'react';
import PageBanner from '../components/common/PageBanner';
import SectionTitle from '../components/common/SectionTitle';
import Teachers from '../components/Teachers/Teachers';
import TeacherCard from '../components/common/TeacherCard';
import Testimonials from '../components/Testimonials/Testimonials';
import CTA from '../components/CTA/CTA';
import homeData from '../data/homeData';
import { getGalleryPlaceholderSVG } from '../components/Gallery/GalleryPlaceholderSVGs';

function SearchBar({ value, onChange }) {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder="Search teachers, subjects, qualifications, languages..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-border-light rounded-2xl text-sm text-text-dark placeholder:text-text-light/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300 shadow-sm"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M14 14l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function FilterButtons({ categories, active, onChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 mb-10">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
            active === cat.id
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-white text-text-body border border-border-light hover:border-primary hover:text-primary hover:bg-primary-light'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

export default function TeachersPage() {
  const { teachers } = homeData;
  const [featuredImgError, setFeaturedImgError] = useState(false);
  const handleFeaturedError = useCallback(() => setFeaturedImgError(true), []);
  const categories = [
    { id: 'all', label: 'All Teachers' },
    { id: 'male', label: 'Male Teachers' },
    { id: 'female', label: 'Female Teachers' },
    { id: 'quran', label: 'Quran' },
    { id: 'hifz', label: 'Hifz' },
    { id: 'tajweed', label: 'Tajweed' },
    { id: 'arabic', label: 'Arabic' },
    { id: 'islamic', label: 'Islamic Studies' },
  ];

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teachers.filter((t) => {
      if (activeCategory !== 'all') {
        if (activeCategory === 'male' || activeCategory === 'female') {
          // dummy gender filter based on name ending (real data will come from admin)
          const male = ['qari', 'sheikh', 'hafiz', 'dr', 'maulana', 'ustadh'].some((kw) => t.title.toLowerCase().includes(kw));
          if ((activeCategory === 'male' && !male) || (activeCategory === 'female' && male)) return false;
        } else if (!Array.isArray(t.subjects) || !t.subjects.map((s) => s.toLowerCase()).includes(activeCategory)) return false;
      }
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.qualification?.toLowerCase().includes(q) ||
        t.subjects.join(' ').toLowerCase().includes(q)
      );
    });
  }, [teachers, query, activeCategory]);

  return (
    <div>
      <PageBanner
        title="Meet Our Qualified Scholars"
        description="Learn from highly qualified Islamic scholars with decades of teaching experience. Choose a teacher who matches your goals and language preference."
        breadcrumbs={[{ label: 'Home', href: '#home' }, { label: 'Teachers' }]}
      />

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="Search Teachers" description="Find a scholar by name, subject, qualification or language." />
          <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} />
          <FilterButtons categories={categories} active={activeCategory} onChange={setActiveCategory} />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {filtered.map((teacher, i) => (
              <TeacherCard key={teacher.id} teacher={teacher} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-light">No teachers found. Try adjusting filters or search terms.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="Featured Scholar" description="A showcase of our most distinguished scholar." />
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="w-full rounded-2xl overflow-hidden shadow-lg">
              {featuredImgError ? (
                <div className="w-full h-96">
                  {getGalleryPlaceholderSVG('teachers')}
                </div>
              ) : (
                <img src="/assets/featured-scholar.jpg" alt="Featured Scholar" className="w-full h-96 object-cover" loading="lazy" decoding="async" onError={handleFeaturedError} />
              )}
            </div>
            <div>
              <h3 className="font-heading text-3xl lg:text-4xl font-bold text-text-dark">Sheikh Dr. Abdullah</h3>
              <p className="mt-4 text-text-light">Senior Scholar with Ijazah in Qirat and decades of teaching at international institutions. Founder of our online Ijazah program.</p>

              <ul className="mt-6 space-y-3 text-sm text-text-light">
                <li><strong>Achievements:</strong> Ijazah (Qirat), Award for Teaching Excellence, Published Tafseer papers.</li>
                <li><strong>Experience:</strong> 30+ years teaching Quran, Tajweed, and Tafseer.</li>
                <li><strong>Courses:</strong> Ijazah Program, Advanced Qirat, Tafseer Masterclass.</li>
              </ul>

              <blockquote className="mt-6 p-6 bg-primary-light rounded-xl text-primary italic">"Teaching is not just a profession; it is a trust. We strive for excellence with every student."</blockquote>

              <div className="mt-6">
                <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-2xl shadow-lg">View Profile</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="Our Teaching Process" description="A simple, student-friendly process to start learning." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {[
              { id: 1, title: 'Enroll', desc: 'Sign up and choose a course.' },
              { id: 2, title: 'Choose Teacher', desc: 'Pick a scholar that fits your needs.' },
              { id: 3, title: 'Schedule Class', desc: 'Pick a convenient time slot.' },
              { id: 4, title: 'Start Learning', desc: 'Begin structured lessons with progress tracking.' },
            ].map((step) => (
              <div key={step.id} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 mx-auto rounded-lg bg-primary text-white flex items-center justify-center font-bold mb-4">{step.id}</div>
                <h4 className="font-heading font-semibold text-lg text-text-dark">{step.title}</h4>
                <p className="text-sm text-text-light mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionTitle title="Student Reviews" description="Hear from our students around the world." />
          <Testimonials />
        </div>
      </section>

      <CTA />
    </div>
  );
}
