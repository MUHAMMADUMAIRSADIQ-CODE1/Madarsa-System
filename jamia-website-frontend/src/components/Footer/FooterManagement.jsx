import { useState, useEffect } from 'react';
import footerService from '../../services/footerService';

const defaultForm = {
  description: '',
  content: {
    quickLinks: [{ label: '', url: '' }],
    usefulLinks: [{ label: '', url: '' }],
    supportLinks: [{ label: '', url: '' }],
    contactBlock: { email: '', phone: '', address: '' },
    socialLinks: [{ platform: '', url: '', icon: '' }],
    copyright: '',
  },
  status: 'draft',
};

export default function AdminFooterManagementSection() {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState(defaultForm);

  useEffect(() => { loadFooter(); }, []);

  async function loadFooter() {
    try {
      setLoading(true);
      const res = await footerService.getAdminFooter();
      const data = res.data;
      setFooter(data);
      if (data) {
        const c = data.content || {};
        setForm({
          description: data.description || '',
          content: {
            quickLinks: c.quickLinks?.length > 0 ? c.quickLinks : defaultForm.content.quickLinks,
            usefulLinks: c.usefulLinks?.length > 0 ? c.usefulLinks : defaultForm.content.usefulLinks,
            supportLinks: c.supportLinks?.length > 0 ? c.supportLinks : defaultForm.content.supportLinks,
            contactBlock: {
              email: c.contactBlock?.email || '',
              phone: c.contactBlock?.phone || '',
              address: c.contactBlock?.address || '',
            },
            socialLinks: c.socialLinks?.length > 0 ? c.socialLinks : defaultForm.content.socialLinks,
            copyright: c.copyright || '',
          },
          status: data.status || 'draft',
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleContactChange(field, value) {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        contactBlock: { ...prev.content.contactBlock, [field]: value },
      },
    }));
  }

  function handleLinkChange(group, idx, field, value) {
    setForm((prev) => {
      const links = [...prev.content[group]];
      links[idx] = { ...links[idx], [field]: value };
      if (idx === links.length - 1 && value.trim() && field === 'label') {
        links.push(field === 'url' ? { label: '', url: '' } : { label: '', url: '' });
      }
      return { ...prev, content: { ...prev.content, [group]: links } };
    });
  }

  function removeLink(group, idx) {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [group]: prev.content[group].filter((_, i) => i !== idx),
      },
    }));
  }

  function handleSocialChange(idx, field, value) {
    setForm((prev) => {
      const links = [...prev.content.socialLinks];
      links[idx] = { ...links[idx], [field]: value };
      if (idx === links.length - 1 && value.trim() && field === 'platform') {
        links.push({ platform: '', url: '', icon: '' });
      }
      return { ...prev, content: { ...prev.content, socialLinks: links } };
    });
  }

  function removeSocial(idx) {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        socialLinks: prev.content.socialLinks.filter((_, i) => i !== idx),
      },
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setSaving(true);

      const validQuick = form.content.quickLinks.filter((l) => l.label.trim());
      const validUseful = form.content.usefulLinks.filter((l) => l.label.trim());
      const validSupport = form.content.supportLinks.filter((l) => l.label.trim());
      const validSocial = form.content.socialLinks.filter((s) => s.platform.trim());

      const payload = {
        description: form.description.trim(),
        content: {
          quickLinks: validQuick.length > 0 ? validQuick : undefined,
          usefulLinks: validUseful.length > 0 ? validUseful : undefined,
          supportLinks: validSupport.length > 0 ? validSupport : undefined,
          contactBlock: form.content.contactBlock,
          socialLinks: validSocial.length > 0 ? validSocial : undefined,
          copyright: form.content.copyright.trim(),
        },
        status: form.status,
      };

      if (footer?._id) {
        await footerService.updateFooter(footer._id, payload);
        setSuccess('Footer content updated successfully');
      } else {
        await footerService.createFooter(payload);
        setSuccess('Footer content created successfully');
      }
      loadFooter();
    } catch (err) {
      setError(err.message || 'Failed to save footer content');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!footer?._id) return;
    try {
      setSaving(true);
      await footerService.publishFooter(footer._id);
      setSuccess('Footer published successfully');
      loadFooter();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleUnpublish() {
    if (!footer?._id) return;
    try {
      setSaving(true);
      await footerService.unpublishFooter(footer._id);
      setSuccess('Footer unpublished successfully');
      loadFooter();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const isPublished = footer?.status === 'published';

  const linkGroups = ['quickLinks', 'usefulLinks', 'supportLinks'];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-4 bg-gray-200 rounded w-2/3" /><div className="h-40 bg-gray-200 rounded" /></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-dark">Footer Content</h2>
          <p className="text-sm text-text-light mt-1">Manage footer links, contact info, and social icons</p>
        </div>
        {footer?._id && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPublished ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">Footer Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Footer description..." className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">Copyright Text</label>
          <input type="text" value={form.content.copyright} onChange={(e) => setForm((prev) => ({ ...prev, content: { ...prev.content, copyright: e.target.value } }))} placeholder="© 2026 Jamia Tul Uloom Muhammadiya. All rights reserved." className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {linkGroups.map((group) => (
            <div key={group}>
              <label className="block text-sm font-semibold text-text-dark mb-2 capitalize">{group.replace(/([A-Z])/g, ' $1').trim()}</label>
              <div className="space-y-2">
                {form.content[group].map((link, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="flex-1 space-y-1">
                      <input type="text" value={link.label} onChange={(e) => handleLinkChange(group, idx, 'label', e.target.value)} placeholder="Label" className="w-full px-3 py-1.5 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm" />
                      <input type="text" value={link.url} onChange={(e) => handleLinkChange(group, idx, 'url', e.target.value)} placeholder="#url" className="w-full px-3 py-1.5 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm" />
                    </div>
                    {form.content[group].length > 1 && (
                      <button type="button" onClick={() => removeLink(group, idx)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1">Contact Email</label>
            <input type="email" value={form.content.contactBlock.email} onChange={(e) => handleContactChange('email', e.target.value)} placeholder="info@jamiatululoom.com" className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1">Contact Phone</label>
            <input type="tel" value={form.content.contactBlock.phone} onChange={(e) => handleContactChange('phone', e.target.value)} placeholder="+92-300-1234567" className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1">Address</label>
            <input type="text" value={form.content.contactBlock.address} onChange={(e) => handleContactChange('address', e.target.value)} placeholder="Jamia Masjid Road, Karachi" className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-2">Social Icons</label>
          <div className="space-y-2">
            {form.content.socialLinks.map((s, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 border border-border-light rounded-xl">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="text" value={s.platform} onChange={(e) => handleSocialChange(idx, 'platform', e.target.value)} placeholder="Platform (facebook)" className="px-3 py-2 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm" />
                  <input type="url" value={s.url} onChange={(e) => handleSocialChange(idx, 'url', e.target.value)} placeholder="https://facebook.com/..." className="px-3 py-2 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm" />
                  <input type="text" value={s.icon} onChange={(e) => handleSocialChange(idx, 'icon', e.target.value)} placeholder="Icon name (facebook)" className="px-3 py-2 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm" />
                </div>
                {form.content.socialLinks.length > 1 && (
                  <button type="button" onClick={() => removeSocial(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border-light">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {footer?._id && (
            isPublished ? (
              <button type="button" onClick={handleUnpublish} disabled={saving} className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50">Unpublish</button>
            ) : (
              <button type="button" onClick={handlePublish} disabled={saving} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">Publish</button>
            )
          )}
        </div>
      </form>
    </div>
  );
}
