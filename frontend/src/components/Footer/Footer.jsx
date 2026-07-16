import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import footerService from '../../services/footerService';
import logo from '../../assets/logo.png';

const socialIcons = {
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
  ),
  youtube: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98" fill="#fff" /></svg>
  ),
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
  ),
  twitter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
  ),
  whatsapp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /><path d="M15.5 14.5l-.5-1a4.5 4.5 0 01-2.5-2.5l-1-.5v1a6 6 0 005 5h1z" fill="#fff" /></svg>
  ),
};

const routeMap = {
  'Home': '/',
  'About': '/about',
  'Courses': '/courses',
  'Teachers': '/teachers',
  'Gallery': '/gallery',
  'Admissions': '/admissions',
  'News': '/news',
  'Contact': '/contact',
};

export default function Footer() {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await footerService.getPublicFooter();
        if (!cancelled) {
          setFooter(res?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Footer unavailable, using defaults');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const f = footer || {};
  const c = f.content || {};
  const quickLinks = c.quickLinks || [
    { label: 'Home', url: '#home' },
    { label: 'About', url: '#about' },
    { label: 'Courses', url: '#courses' },
    { label: 'Teachers', url: '#teachers' },
    { label: 'Gallery', url: '#gallery' },
  ];
  const usefulLinks = c.usefulLinks || [
    { label: 'Admissions', url: '#admissions' },
    { label: 'News', url: '#news' },
    { label: 'Contact', url: '#contact' },
  ];
  const supportLinks = c.supportLinks || [
    { label: 'FAQ', url: '#faq' },
    { label: 'Privacy Policy', url: '#privacy' },
    { label: 'Terms of Service', url: '#terms' },
  ];
  const contactBlock = c.contactBlock || {};
  const socials = c.socialLinks || [];
  const description = f.description || 'A prestigious online Islamic academy dedicated to authentic Quranic and Islamic education with qualified scholars from around the world.';
  const copyright = c.copyright || `© ${new Date().getFullYear()} Jamia Tul Uloom Muhammadiya. All rights reserved.`;
  const shortName = f.shortName || 'JU';

  const renderLink = (link) => {
    if (!link) return null;
    const routePath = routeMap[link.label];
    if (routePath) {
      return <Link to={routePath} className="text-sm text-white/60 hover:text-gold transition-colors duration-300">{link.label}</Link>;
    }
    return <a href={link.url || '#'} className="text-sm text-white/60 hover:text-gold transition-colors duration-300">{link.label}</a>;
  };

  return (
    <footer className="relative bg-text-dark text-white">
      <div className="h-1 bg-gradient-to-r from-primary via-gold to-primary" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-14 lg:pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <img src={logo} alt={`${f.title || 'Jamia Tul Uloom'} Logo`} className="w-full h-full object-contain" loading="lazy" decoding="async" />
              </div>
              <div>
                <span className="font-heading text-lg font-bold text-white">{f.title || 'Jamia Tul Uloom'}</span>
                <span className="block text-[10px] font-medium tracking-[0.2em] uppercase text-gold">{f.subtitle || 'Muhammadiya'}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm">{description}</p>

            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socials.map((link) => (
                  <a
                    key={link.platform || link.icon}
                    href={link.url || '#'}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-primary hover:text-white transition-all duration-300"
                    aria-label={link.platform || link.icon || 'social'}
                  >
                    {socialIcons[link.icon] || socialIcons[link.platform] || (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider mb-5">Useful Links</h3>
            <ul className="space-y-3">
              {usefulLinks.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider mb-5">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.url || '#'} className="text-sm text-white/60 hover:text-gold transition-colors duration-300">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p className="text-center sm:text-left">{copyright}</p>
          {contactBlock.email && (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              <a href={`mailto:${contactBlock.email}`} className="hover:text-gold transition-colors">{contactBlock.email}</a>
              {contactBlock.phone && <span className="text-white/30 sm:text-white/40">{contactBlock.phone}</span>}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
