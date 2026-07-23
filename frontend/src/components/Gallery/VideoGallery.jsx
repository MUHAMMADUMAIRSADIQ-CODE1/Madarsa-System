import { useState } from 'react';
import SectionTitle from '../common/SectionTitle';
import { getGalleryPlaceholderSVG } from './GalleryPlaceholderSVGs';
import ScrollReveal from '../common/ScrollReveal';

// Map video categories to contextual SVG scenes
const videoCategoryToSvg = {
  'Tutorial': 'online-classes',
  'Lecture': 'classrooms',
  'Testimonial': 'international',
  'Tour': 'campus',
  'Course': 'studying',
};

function VideoCard({ video, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const svgCategory = videoCategoryToSvg[video.category] || 'library';

  return (
    <ScrollReveal delay={index * 50}>
      <div className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className="relative overflow-hidden rounded-2xl bg-black h-[280px] sm:h-[300px]">
        {/* SVG Thumbnail */}
        <div className="w-full h-full">
          {getGalleryPlaceholderSVG(svgCategory)}
        </div>

        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-70'
        }`} />

        {/* Play Button */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}>
          <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold hover:bg-gold-dark text-white flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {/* Info Bar - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-semibold bg-gold/20 px-2.5 py-1 rounded-full">
              {video.category}
            </span>
            <span className="text-xs font-medium">{video.duration}</span>
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 rounded-lg backdrop-blur-sm text-white text-xs font-medium">
          {video.duration}
        </div>
      </div>

      {/* Title & Views */}
      <div className="mt-3 sm:mt-4">
        <h3 className="font-semibold text-text-dark text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center justify-between mt-2 text-xs text-text-light">
          <span className="font-medium">{video.category}</span>
          <span>{video.views} views</span>
        </div>
      </div>
      </div>
      </ScrollReveal>
  );
}

export default function VideoGallery({ videos }) {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Video Library"
          title="Educational Content"
          description="Browse our collection of Quran recitations, lectures, and Islamic education videos."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {videos.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
        </div>

        {/* View All Videos CTA */}
        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl"
          >
            Browse All Videos
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}