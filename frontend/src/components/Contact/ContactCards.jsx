import SectionTitle from '../common/SectionTitle';

function ContactCardItem({ contact, index }) {
  const c = contact || {};
  const iconType = c.icon || c.type || 'location';

  const iconMap = {
    phone: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.146.479.457 1.01.972 1.524.516.515 1.045.826 1.524.972l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 4 14.18 4 9.5V5a1 1 0 011-1h2.153Z" />
      </svg>
    ),
    whatsapp: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.767 1.17c-1.434.797-2.623 1.917-3.502 3.231-1.147 1.772-1.682 3.72-1.682 5.957 0 5.471 4.486 9.922 9.996 9.922 1.331 0 2.633-.176 3.898-.508 1.33-.344 2.562-.847 3.642-1.507.516-.315 1.01-.66 1.476-1.035.229-.184.454-.378.666-.586.247-.265.41-.58.41-.923 0-.433-.268-.8-.617-.974-.349-.174-.75-.152-1.08.053-.33.205-.633.42-.934.62-.301.2-.603.378-.915.517-.631.28-1.3.523-1.978.71-.678.19-1.37.282-2.065.282-3.516 0-6.375-2.829-6.375-6.313 0-1.205.236-2.376.684-3.471.448-1.095 1.088-2.064 1.906-2.89.818-.825 1.789-1.463 2.89-1.908 1.1-.445 2.275-.68 3.47-.68 3.516 0 6.375 2.828 6.375 6.312 0 .822-.138 1.627-.4 2.402-.261.775-.636 1.506-1.115 2.172-.479.666-1.057 1.266-1.72 1.782-.662.516-1.414.953-2.238 1.295-.825.343-1.725.608-2.687.789-.962.181-1.982.272-3.049.272" />
      </svg>
    ),
    email: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
      </svg>
    ),
    location: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {iconMap[iconType] || iconMap.location}
      </div>

      <h3 className="font-heading font-semibold text-lg text-text-dark mb-2">
        {c.label || c.type || 'Contact'}
      </h3>

      <p className="text-gold font-semibold text-lg mb-2 break-all">
        {c.value || ''}
      </p>

      <p className="text-text-body text-sm mb-3">
        {c.description || ''}
      </p>

      <p className="text-text-light text-xs">
        {c.hours || ''}
      </p>
    </div>
  );
}

export default function ContactCards({ contacts }) {
  const items = Array.isArray(contacts) ? contacts : [];

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Get in Touch"
          title="Contact Information"
          description="Reach out to us through any of these channels. We're here to help!"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {items.map((contact, i) => (
            <ContactCardItem key={contact.id || i} contact={contact} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
