export default function TestimonialCard({ testimonial }) {
  const initial = testimonial.name.charAt(0);

  return (
    <div
      className="flex-shrink-0 w-[18rem] xs:w-[20rem] sm:w-[24rem] lg:w-[26rem]"
    >
      <div className="bg-white rounded-2xl border border-border-light p-7 lg:p-8 h-full flex flex-col transition-all duration-500 hover:shadow-[0_8px_40px_rgba(11,79,48,0.08)]">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} width="16" height="16" viewBox="0 0 14 14" fill={star <= testimonial.rating ? '#C9A84C' : '#E8EDEA'} xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.5l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1z" />
            </svg>
          ))}
        </div>

        {/* Quote - with line clamp to ensure equal height */}
        <p className="text-text-body/85 leading-relaxed text-sm lg:text-base line-clamp-4 flex-1">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        {/* Author */}
        <div className="mt-6 pt-5 border-t border-border-light flex items-center gap-4 flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{initial}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-text-dark">{testimonial.name}</p>
            <p className="text-xs text-text-light">{testimonial.location}</p>
          </div>
        </div>

        {/* Course Badge */}
        <div className="mt-3 flex-shrink-0">
          <span className="text-[11px] font-medium text-gold uppercase tracking-wider">
            {testimonial.course}
          </span>
        </div>
      </div>
    </div>
  );
}