import { useState, useEffect } from 'react';
import settingsService from '../../services/settingsService';

const defaultForm = {
  content: {
    academyName: '',
    shortName: '',
    primaryColor: '#0B4F30',
    secondaryColor: '#C9A84C',
    accentColor: '#E8D5A3',
    websiteEmail: '',
    websitePhone: '',
    timezone: 'Asia/Karachi',
    language: 'English',
    copyrightText: '',
    footerText: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: '',
      whatsapp: '',
      telegram: '',
      linkedin: '',
      tiktok: '',
    },
  },
  status: 'draft',
};

export default function AdminSettingsManagementSection() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const [form, setForm] = useState(defaultForm);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await settingsService.getAdminSettings();
      const data = res.data;
      setSettings(data);
      if (data) {
        const c = data.content || {};
        setForm({
          content: {
            academyName: c.academyName || '',
            shortName: c.shortName || '',
            primaryColor: c.primaryColor || '#0B4F30',
            secondaryColor: c.secondaryColor || '#C9A84C',
            accentColor: c.accentColor || '#E8D5A3',
            websiteEmail: c.websiteEmail || '',
            websitePhone: c.websitePhone || '',
            timezone: c.timezone || 'Asia/Karachi',
            language: c.language || 'English',
            copyrightText: c.copyrightText || '',
            footerText: c.footerText || '',
            socialLinks: {
              facebook: c.socialLinks?.facebook || '',
              instagram: c.socialLinks?.instagram || '',
              youtube: c.socialLinks?.youtube || '',
              twitter: c.socialLinks?.twitter || '',
              whatsapp: c.socialLinks?.whatsapp || '',
              telegram: c.socialLinks?.telegram || '',
              linkedin: c.socialLinks?.linkedin || '',
              tiktok: c.socialLinks?.tiktok || '',
            },
          },
          status: data.status || 'draft',
        });
        const imgs = data.images || [];
        if (imgs[0]?.url) setLogoPreview(imgs[0].url);
        if (imgs[1]?.url) setFaviconPreview(imgs[1].url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleContentChange(field, value) {
    setForm((prev) => ({
      ...prev,
      content: { ...prev.content, [field]: value },
    }));
  }

  function handleSocialChange(platform, value) {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        socialLinks: { ...prev.content.socialLinks, [platform]: value },
      },
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setSaving(true);
      const payload = { content: form.content, status: form.status };
      if (logoFile) payload.image = logoFile;

      if (settings?._id) {
        await settingsService.updateSettings(settings._id, payload);
        setSuccess('Settings updated successfully');
      } else {
        await settingsService.createSettings(payload);
        setSuccess('Settings created successfully');
      }
      loadSettings();
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!settings?._id) return;
    try {
      setSaving(true);
      await settingsService.publishSettings(settings._id);
      setSuccess('Settings published successfully');
      loadSettings();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleUnpublish() {
    if (!settings?._id) return;
    try {
      setSaving(true);
      await settingsService.unpublishSettings(settings._id);
      setSuccess('Settings unpublished successfully');
      loadSettings();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const isPublished = settings?.status === 'published';

  const textFields = [
    { key: 'academyName', label: 'Academy Name', type: 'text', placeholder: 'Jamia Tul Uloom Muhammadiya' },
    { key: 'shortName', label: 'Short Name', type: 'text', placeholder: 'JU' },
    { key: 'websiteEmail', label: 'Website Email', type: 'email', placeholder: 'info@jamiatululoom.com' },
    { key: 'websitePhone', label: 'Website Phone', type: 'tel', placeholder: '+92-300-1234567' },
    { key: 'timezone', label: 'Timezone', type: 'text', placeholder: 'Asia/Karachi' },
    { key: 'language', label: 'Language', type: 'text', placeholder: 'English' },
    { key: 'copyrightText', label: 'Copyright Text', type: 'text', placeholder: '© All rights reserved.' },
    { key: 'footerText', label: 'Footer Text', type: 'text', placeholder: 'Footer description...' },
  ];

  const colorFields = [
    { key: 'primaryColor', label: 'Primary Color', placeholder: '#0B4F30' },
    { key: 'secondaryColor', label: 'Secondary Color', placeholder: '#C9A84C' },
    { key: 'accentColor', label: 'Accent Color', placeholder: '#E8D5A3' },
  ];

  const socialFields = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'twitter', label: 'Twitter (X)' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'telegram', label: 'Telegram' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'tiktok', label: 'TikTok' },
  ];

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
          <h2 className="font-heading text-2xl font-bold text-text-dark">Website Settings</h2>
          <p className="text-sm text-text-light mt-1">Manage global website settings</p>
        </div>
        {settings?._id && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPublished ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textFields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-text-dark mb-1">{f.label}</label>
              <input type={f.type} value={form.content[f.key]} onChange={(e) => handleContentChange(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-2">Logo</label>
          {logoPreview && (
            <div className="mb-2"><img src={logoPreview.startsWith('blob') ? logoPreview : (import.meta.env.VITE_API_URL || '') + logoPreview} alt="Logo preview" className="w-24 h-24 object-contain rounded-xl border border-border-light" /></div>
          )}
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }}} className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-2">Favicon</label>
          {faviconPreview && (
            <div className="mb-2"><img src={faviconPreview.startsWith('blob') ? faviconPreview : (import.meta.env.VITE_API_URL || '') + faviconPreview} alt="Favicon preview" className="w-12 h-12 object-contain rounded-xl border border-border-light" /></div>
          )}
          <input type="file" accept="image/x-icon,image/png" onChange={(e) => { const f = e.target.files[0]; if (f) { setFaviconFile(f); setFaviconPreview(URL.createObjectURL(f)); }}} className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {colorFields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-text-dark mb-1">{f.label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.content[f.key]} onChange={(e) => handleContentChange(f.key, e.target.value)} className="w-10 h-10 rounded-lg border border-border-light cursor-pointer" />
                <input type="text" value={form.content[f.key]} onChange={(e) => handleContentChange(f.key, e.target.value)} placeholder={f.placeholder} className="flex-1 px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-2">Social Media Links</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socialFields.map((s) => (
              <div key={s.key}>
                <label className="block text-xs text-text-light mb-1">{s.label}</label>
                <input type="url" value={form.content.socialLinks[s.key]} onChange={(e) => handleSocialChange(s.key, e.target.value)} placeholder={`https://${s.key}.com/...`} className="w-full px-4 py-2 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border-light">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {settings?._id && (
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
