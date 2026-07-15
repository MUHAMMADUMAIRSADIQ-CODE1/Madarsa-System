export default function EmergencyContactBanner({ contact }) {
  const c = contact || {};
  const whatsapp = c.whatsapp || '+92-300-1234567';
  const emergency = c.emergency || c.emergencyContact || '+92-300-1234567';

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-r from-red-500 via-red-600 to-red-700 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="emergency-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <polygon points="60,0 120,60 60,120 0,60" fill="none" stroke="#ffffff" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#emergency-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <span className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Urgent Support
            </span>
          </div>

          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">
            Need Immediate Assistance?
          </h2>

          <p className="text-white/90 text-lg mb-8">
            Our support team is available 24/7 to help you. Reach out via WhatsApp or call us directly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.767 1.17c-1.434.797-2.623 1.917-3.502 3.231-1.147 1.772-1.682 3.72-1.682 5.957 0 5.471 4.486 9.922 9.996 9.922 1.331 0 2.633-.176 3.898-.508 1.33-.344 2.562-.847 3.642-1.507.516-.315 1.01-.66 1.476-1.035.229-.184.454-.378.666-.586.247-.265.41-.58.41-.923 0-.433-.268-.8-.617-.974-.349-.174-.75-.152-1.08.053-.33.205-.633.42-.934.62-.301.2-.603.378-.915.517-.631.28-1.3.523-1.978.71-.678.19-1.37.282-2.065.282-3.516 0-6.375-2.829-6.375-6.313 0-1.205.236-2.376.684-3.471.448-1.095 1.088-2.064 1.906-2.89.818-.825 1.789-1.463 2.89-1.908 1.1-.445 2.275-.68 3.47-.68 3.516 0 6.375 2.828 6.375 6.312 0 .822-.138 1.627-.4 2.402-.261.775-.636 1.506-1.115 2.172-.479.666-1.057 1.266-1.72 1.782-.662.516-1.414.953-2.238 1.295-.825.343-1.725.608-2.687.789-.962.181-1.982.272-3.049.272" />
            </svg>
            WhatsApp Us Now
          </a>

          <a
            href={`tel:${emergency.replace(/[^0-9]/g, '')}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white text-white font-bold rounded-2xl hover:bg-white/30 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.146.479.457 1.01.972 1.524.516.515 1.045.826 1.524.972l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 4 14.18 4 9.5V5a1 1 0 011-1h2.153Z" />
            </svg>
            Call Us
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-white/80 text-sm">
            📞 Available 24/7 • Response Time: Under 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
}
