import { useState } from 'react';

const fallbackImages = [
  'https://images.unsplash.com/photo-1583408835381-8f004a88d09a?w=600&q=80',
  'https://images.unsplash.com/photo-1609186987056-e0b6532af9e8?w=600&q=80',
  'https://images.unsplash.com/photo-1604480132715-57c9b3f37fef?w=600&q=80',
  'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80',
];

export default function TeacherCard({ teacher, index = 0 }) {
  const t = teacher || {};
  const [imgError, setImgError] = useState(false);
  const initial = t.name ? t.name.charAt(0) : '?';
  const subjects = Array.isArray(t.subjects) ? t.subjects : [];
  const studentCount = typeof t.students === 'number' ? t.students.toLocaleString() : (t.students || '0');
  const imageSrc = t.image || fallbackImages[index % fallbackImages.length];

  return (
    <article
      className="group relative bg-white rounded-2xl border border-border-light overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(11,79,48,0.15)] hover:-translate-y-2 animate-fade-in-up flex flex-col"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden bg-gradient-to-br from-primary/10 to-gold/10">
        {!imgError ? (
          <>
            <img
              src={imageSrc}
              alt={t.name || 'Scholar'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg animate-bounce-in">
              <span className="font-heading text-3xl font-bold text-white">{initial}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 lg:p-7 flex flex-col flex-1">
        <h3 className="font-heading text-xl font-bold text-text-dark group-hover:text-primary transition-colors duration-300">
          {t.name || 'Teacher'}
        </h3>
        <p className="text-sm text-gold font-medium mt-0.5">{t.title || 'Islamic Scholar'}</p>

        <p className="text-xs text-text-light mt-2">{t.qualification || ''}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-text-light">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a6 6 0 00-6 6c0 3.5 3 5.5 6 9 3-3.5 6-5.5 6-9a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {t.experience || ''}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 14c.5 1.5 1.5 2 3 2s2.5-.5 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {studentCount} students
          </span>
        </div>

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <span
                key={subject}
                className="px-2.5 py-1 text-xs font-medium bg-primary-light text-primary rounded-lg"
              >
                {subject}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {t.rating != null && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="13" height="13" viewBox="0 0 14 14" fill={star <= Math.round(t.rating) ? '#C9A84C' : '#E8EDEA'} xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.5l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1z" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-medium text-text-light">{t.rating}</span>
          </div>
        )}

        {/* View Profile - pushes to bottom with mt-auto */}
        <div className="mt-auto pt-5">
          <a
            href={`#teacher-${t.id || 0}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors duration-300"
          >
            View Profile
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
