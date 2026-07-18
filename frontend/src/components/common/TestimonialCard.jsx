export default function TestimonialCard({ testimonial, index = 0 }) {
  const initial = testimonial.name.charAt(0);

  return (
    <div
      className="flex-shrink-0 w-[85vw] max-w-[20rem] sm:max-w-none sm:w-[20rem] md:w-[24rem] lg:w-[26rem] animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="bg-white rounded-2xl border border-border-light p-7 lg:p-8 h-full transition-all duration-500 hover:shadow-[0_8px_40px_rgba(11,79,48,0.1)] hover:-translate-y-1 flex flex-col">
        <div className="flex-1 flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} width="16" height="16" viewBox="0 0 14 14" fill={star <= testimonial.rating ? '#C9A84C' : '#E8EDEA'} xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.5l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1z" />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <p className="text-text-body/85 leading-relaxed text-sm lg:text-base">
          "{testimonial.text}"
        </p>

        {/* Author */}
        <div className="mt-6 pt-5 border-t border-border-light flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{initial}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-text-dark">{testimonial.name}</p>
            <p className="text-xs text-text-light">{testimonial.location}</p>
          </div>
        </div>

        {/* Course Badge */}
        <div className="mt-3">
          <span className="text-[11px] font-medium text-gold uppercase tracking-wider">
            {testimonial.course}
          </span>
        </div>
      </div>
    </div>
    </div>
  );
}