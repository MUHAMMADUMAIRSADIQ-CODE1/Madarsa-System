import SectionTitle from '../common/SectionTitle';

function EventTimelineItem({ event, isOdd, index }) {
  const registrationFill = (event.registered / event.capacity) * 100;

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`grid grid-cols-1 ${isOdd ? 'lg:grid-cols-[1fr_auto_1fr]' : 'lg:grid-cols-[1fr_auto_1fr]'} gap-6 items-center`}>
        {/* Left Content (alternates) */}
        <div className={isOdd ? 'lg:text-right order-1' : 'order-2'}>
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <h3 className="font-heading font-semibold text-lg text-text-dark mb-2">
              {event.title}
            </h3>
            <p className="text-text-body text-sm mb-4">
              {event.topic}
            </p>
            
            <div className="space-y-2 text-sm text-text-light mb-4">
              <div className="flex items-center gap-2 justify-start lg:justify-end">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h12a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 justify-start lg:justify-end">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 justify-start lg:justify-end">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{event.location}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-text-body">Registration</span>
                <span className="text-text-light">{event.registered}/{event.capacity}</span>
              </div>
              <div className="w-full bg-accent-soft rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-primary transition-all duration-500"
                  style={{ width: `${Math.min(registrationFill, 100)}%` }}
                />
              </div>
            </div>

            <button className="w-full px-4 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300 text-sm">
              Register Now
            </button>
          </div>
        </div>

        {/* Center Timeline Dot */}
        <div className="flex justify-center order-2 lg:order-2">
          <div className="relative flex flex-col items-center">
            <div className="w-4 h-4 bg-gradient-to-br from-gold to-primary rounded-full border-4 border-white shadow-lg" />
            <div className="absolute w-1 h-12 bg-gradient-to-b from-primary/50 to-transparent top-4 hidden lg:block" />
          </div>
        </div>

        {/* Right Content (alternates) */}
        <div className={isOdd ? 'lg:text-left order-3' : 'lg:text-right order-1'}>
          <div className="text-sm text-text-light">
            <p className="font-semibold text-text-dark mb-1">Speaker</p>
            <p>{event.speaker}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpcomingEventsTimeline({ events }) {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="What's Happening"
          title="Upcoming Events"
          description="Mark your calendar for our upcoming lectures, seminars, and community gatherings."
        />

        <div className="mt-12 space-y-8 relative">
          {/* Vertical line (hidden on mobile) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-primary to-gold/30 hidden lg:block -translate-x-1/2" />

          {events.map((event, i) => (
            <EventTimelineItem
              key={event.id}
              event={event}
              isOdd={i % 2 === 0}
              index={i}
            />
          ))}
        </div>

        {/* View All Events */}
        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20"
          >
            View All Events
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
