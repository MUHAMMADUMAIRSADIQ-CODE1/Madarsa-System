import { useState, useEffect } from 'react';
import PageBanner from '../components/common/PageBanner';
import ContactCards from '../components/Contact/ContactCards';
import ContactForm from '../components/Contact/ContactForm';
import ContactMap from '../components/Contact/ContactMap';
import ContactFAQ from '../components/Contact/ContactFAQ';
import SocialMedia from '../components/Contact/SocialMedia';
import EmergencyContactBanner from '../components/Contact/EmergencyContactBanner';
import CTA from '../components/CTA/CTA';
import contactService from '../services/contactService';

export default function ContactPage() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await contactService.getPublicContact();
        setContact(res.data);
      } catch (err) {
        console.error('Failed to load contact:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const c = contact?.content || {};

  const contacts = [
    {
      id: 1,
      type: 'email',
      label: 'Email',
      value: c.email || 'info@jamiatululoom.com',
      href: `mailto:${c.email || 'info@jamiatululoom.com'}`,
    },
    {
      id: 2,
      type: 'phone',
      label: 'Phone',
      value: c.primaryPhone || '+92-300-1234567',
      href: `tel:${c.primaryPhone || '+92-300-1234567'}`,
    },
    {
      id: 3,
      type: 'whatsapp',
      label: 'WhatsApp',
      value: c.whatsapp || '+92-300-1234567',
      href: `https://wa.me/${(c.whatsapp || '+92-300-1234567').replace(/[^0-9]/g, '')}`,
    },
    {
      id: 4,
      type: 'address',
      label: 'Address',
      value: c.address || 'Jamia Masjid Road, Gulshan-e-Maymar, Karachi, Pakistan',
    },
  ];

  const office = {
    timing: c.officeTiming || 'Mon-Fri: 9:00 AM - 5:00 PM',
    emergency: c.emergencyContact || '+92-300-1234567',
    email: c.email || 'info@jamiatululoom.com',
    phone: c.phone || c.primaryPhone || '+92-300-1234567',
    whatsapp: c.whatsapp || '+92-300-1234567',
    address: c.address || 'Jamia Masjid Road, Gulshan-e-Maymar, Karachi, Pakistan',
    street: c.street || 'Adjacent to Jamia Masjid',
    city: c.city || 'Gulshan-e-Maymar, Karachi',
    mapUrl: c.mapUrl || 'https://maps.google.com',
    admissionContact: c.admissionContact || '+92-300-1234567',
    hours: {
      weekday: c.weekdayHours || c.hours?.weekday || '9:00 AM - 5:00 PM',
      friday: c.fridayHours || c.hours?.friday || '9:00 AM - 12:30 PM',
      saturday: c.saturdayHours || c.hours?.saturday || 'Closed',
      sunday: c.sundayHours || c.hours?.sunday || 'Closed',
    },
  };

  return (
    <div>
      <PageBanner
        title="Contact Us"
        description="Get in touch with us. We're here to answer any questions and help you get started on your Islamic learning journey."
        breadcrumbs={[{ label: 'Home', href: '#home' }, { label: 'Contact' }]}
      />

      <ContactCards contacts={contacts} />

      <ContactForm />

      <ContactMap office={office} />

      <ContactFAQ faqs={[]} />

      <SocialMedia social={[]} />

      <EmergencyContactBanner contact={office} />

      <CTA />
    </div>
  );
}
