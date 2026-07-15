import SectionTitle from '../common/SectionTitle';

export default function ContactMap({ office }) {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Visit Us"
          title="Our Location"
          description="Find us on the map and visit our academy in person."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="relative rounded-3xl overflow-hidden shadow-xl h-[400px] bg-gradient-to-br from-accent-soft to-primary-light">
              {/* Placeholder Map */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light via-accent-soft to-gold-light">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-primary/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-text-body font-medium">Interactive Map - Embedded Map Placeholder</p>
                  <p className="text-text-light text-sm mt-2">Location: {office?.city || 'Gulshan-e-Maymar, Karachi'}</p>
                </div>
              </div>

              {/* Location Pin */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 w-4 h-4 bg-gold/30 rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-gold rounded-full shadow-lg" />
                </div>
              </div>
            </div>

            {/* Additional Info Below Map */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-primary-light rounded-2xl p-4">
                <p className="text-xs text-primary font-semibold uppercase mb-1">Hours</p>
                <p className="text-sm text-primary font-medium">{office?.hours?.weekday || '9:00 AM - 5:00 PM'}</p>
              </div>
              <div className="bg-gold-light rounded-2xl p-4">
                <p className="text-xs text-primary font-semibold uppercase mb-1">Friday</p>
                <p className="text-sm text-primary font-medium">{office?.hours?.friday || '9:00 AM - 12:30 PM'}</p>
              </div>
            </div>
          </div>

          {/* Office Info Card */}
          <div className="bg-gradient-to-br from-primary via-primary-dark to-primary rounded-3xl text-white p-8 shadow-xl">
            <h3 className="font-heading font-bold text-2xl mb-6">
              Academy Location
            </h3>

            {/* Address */}
            <div className="mb-6 pb-6 border-b border-white/20">
              <p className="text-white/70 text-sm font-medium mb-2">Address</p>
              <p className="font-semibold text-lg leading-relaxed">                  {office?.address || 'Jamia Masjid Road'}
                </p>
                <p className="text-white/80 text-sm mt-2">{office?.street || ''}</p>
              <p className="text-white/80 text-sm">{office?.city || ''}</p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-4 mb-6 pb-6 border-b border-white/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.146.479.457 1.01.972 1.524.516.515 1.045.826 1.524.972l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 4 14.18 4 9.5V5a1 1 0 011-1h2.153Z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-medium mb-1">Phone</p>
                  <a href="tel:+15551234567" className="text-white font-semibold break-all hover:text-gold transition-colors">
                    {office?.phone || '+92-300-1234567'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1.101.899a.5.5 0 0 0-.633.633l1.248 5.6a.5.5 0 0 0 .556.422h15.368a.5.5 0 0 1 .492.609l-1.233 5.942a.5.5 0 0 1-.492.408H2.507a.5.5 0 0 0-.492.608l1.1 5.291a.5.5 0 0 0 .491.408h14.168a.5.5 0 0 1 .491.609l-.669 3.213a.5.5 0 0 1-.491.408H4.01a.5.5 0 0 0-.491.608l.735 3.531a.5.5 0 0 0 .633.422l14.368-2.993a.5.5 0 0 0 .39-.633L16.234.899z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-medium mb-1">WhatsApp</p>
                  <a href="https://wa.me/15559876543" className="text-white font-semibold break-all hover:text-gold transition-colors">
                    {office?.whatsapp || '+92-300-1234567'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-medium mb-1">Email</p>
                  <a href="mailto:support@jamia.edu" className="text-white font-semibold break-all hover:text-gold transition-colors">
                    {office?.email || 'info@jamiatululoom.com'}
                  </a>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase mb-3">Office Hours</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Mon - Thu:</span>
                  <span className="font-semibold">{office?.hours?.weekday || '9:00 AM - 5:00 PM'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Friday:</span>
                  <span className="font-semibold">{office?.hours?.friday || '9:00 AM - 12:30 PM'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Saturday:</span>
                  <span className="font-semibold">{office?.hours?.saturday || 'Closed'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Sunday:</span>
                  <span className="font-semibold text-red-200">{office?.hours?.sunday || 'Closed'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
