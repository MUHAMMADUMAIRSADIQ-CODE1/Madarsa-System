import SectionTitle from '../common/SectionTitle';

function SocialMediaIcon({ social, index }) {
  const s = social || {};

  const iconMap = {
    facebook: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    instagram: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.6c-.79.263-1.473.557-2.115 1.194-.645.642-.943 1.33-1.206 2.115-.266.79-.468 1.66-.527 2.937C.039 8.328 0 8.74 0 12s.015 3.672.072 4.947c.06 1.277.261 2.148.527 2.938.264.79.558 1.473 1.194 2.115.645.645 1.33.943 2.115 1.206.79.266 1.66.466 2.937.527 1.275.057 1.689.072 4.947.072s3.672-.015 4.947-.072c1.277-.06 2.148-.261 2.938-.527.79-.264 1.473-.559 2.115-1.194.645-.645.943-1.33 1.206-2.115.266-.79.466-1.66.527-2.937.057-1.276.072-1.689.072-4.947s-.015-3.672-.072-4.947c-.06-1.277-.261-2.148-.527-2.938-.264-.79-.559-1.473-1.194-2.115-.645-.645-1.33-.943-2.115-1.206-.79-.266-1.66-.466-2.937-.527-1.276-.057-1.689-.072-4.947-.072zm0 2.163c3.204 0 3.584.012 4.849.07 1.171.054 1.806.25 2.228.415.56.217.96.477 1.382.896.42.42.679.822.896 1.381.165.423.361 1.057.416 2.228.058 1.265.07 1.645.07 4.849 0 3.204-.012 3.584-.07 4.849-.054 1.171-.25 1.806-.415 2.228-.217.56-.477.96-.896 1.382-.42.42-.822.679-1.381.896-.423.165-1.057.361-2.228.416-1.265.058-1.645.07-4.849.07-3.204 0-3.584-.012-4.849-.07-1.171-.054-1.806-.25-2.228-.415-.56-.217-.96-.477-1.382-.896-.42-.42-.679-.822-.896-1.381-.165-.423-.361-1.057-.416-2.228-.058-1.265-.07-1.645-.07-4.849 0-3.204.012-3.584.07-4.849.054-1.171.25-1.806.415-2.228.217-.56.477-.96.896-1.382.42-.42.822-.679 1.381-.896.423-.165 1.057-.361 2.228-.416 1.265-.058 1.645-.07 4.849-.07z" />
        <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 11-2.881 0 1.44 1.44 0 012.881 0z" />
      </svg>
    ),
    youtube: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
    ),
  };

  return (
    <a
      href={s.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
      title={s.name || ''}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
        {iconMap[s.icon] || iconMap.facebook}
      </div>
    </a>
  );
}

export default function SocialMedia({ social }) {
  const items = Array.isArray(social) ? social : [];

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <SectionTitle
          subtitle="Connect With Us"
          title="Follow Our Academy"
          description="Stay connected on social media for daily updates, inspirational content, and community events."
        />

        <div className="flex justify-center gap-6 mt-10 flex-wrap">
          {items.map((s, i) => (
            <SocialMediaIcon key={s.id || i} social={s} index={i} />
          ))}
        </div>

        <p className="text-text-light text-sm mt-8">
          Join our community and be part of the Jamia Tul Uloom family
        </p>
      </div>
    </section>
  );
}
