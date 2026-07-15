import { useState, useEffect } from 'react';
import aboutService from '../../services/aboutService';

const defaultForm = {
  title: '',
  subtitle: '',
  description: '',
  content: {
    history: '',
    mission: '',
    vision: '',
    principalMessage: '',
    coreValues: [{ title: '', description: '' }],
  },
  status: 'draft',
};

export default function AdminAboutManagementSection() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState(defaultForm);

  useEffect(() => { loadAbout(); }, []);

  async function loadAbout() {
    try {
      setLoading(true);
      const res = await aboutService.getAdminAbout();
      const data = res.data;
      setAbout(data);
      if (data) {
        const c = data.content || {};
        setForm({
          title: data.title || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          content: {
            history: c.history || '',
            mission: c.mission || '',
            vision: c.vision || '',
            principalMessage: c.principalMessage || '',
            coreValues: c.coreValues?.length > 0 ? c.coreValues : defaultForm.content.coreValues,
          },
          status: data.status || 'draft',
        });
        if (data.images?.[0]?.url) {
          setImagePreview(data.images[0].url);
        }
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

  function handleContentChange(field, value) {
    setForm((prev) => ({
      ...prev,
      content: { ...prev.content, [field]: value },
    }));
  }

  function handleCVChange(idx, field, value) {
    setForm((prev) => {
      const coreValues = [...prev.content.coreValues];
      coreValues[idx] = { ...coreValues[idx], [field]: value };
      if (idx === coreValues.length - 1 && value.trim()) {
        coreValues.push({ title: '', description: '' });
      }
      return { ...prev, content: { ...prev.content, coreValues } };
    });
  }

  function removeCV(idx) {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        coreValues: prev.content.coreValues.filter((_, i) => i !== idx),
      },
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setSaving(true);

      const validCV = form.content.coreValues.filter((v) => v.title.trim());
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        content: {
          ...form.content,
          coreValues: validCV.length > 0 ? validCV : undefined,
        },
        status: form.status,
      };
      if (imageFile) payload.image = imageFile;

      if (about?._id) {
        await aboutService.updateAbout(about._id, payload);
        setSuccess('About content updated successfully');
      } else {
        await aboutService.createAbout(payload);
        setSuccess('About content created successfully');
      }
      loadAbout();
    } catch (err) {
      setError(err.message || 'Failed to save about content');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!about?._id) return;
    try {
      setSaving(true);
      await aboutService.publishAbout(about._id);
      setSuccess('About published successfully');
      loadAbout();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleUnpublish() {
    if (!about?._id) return;
    try {
      setSaving(true);
      await aboutService.unpublishAbout(about._id);
      setSuccess('About unpublished successfully');
      loadAbout();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const isPublished = about?.status === 'published';

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
          <h2 className="font-heading text-2xl font-bold text-text-dark">About Section</h2>
          <p className="text-sm text-text-light mt-1">Manage about page content</p>
        </div>
        {about?._id && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPublished ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="About Jamia Tul Uloom" className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">Subtitle / Tagline</label>
          <input type="text" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Preserving authentic Islamic knowledge" className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="About description..." className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-2">About Image</label>
          {imagePreview && (
            <div className="mb-2">
              <img src={imagePreview.startsWith('blob') ? imagePreview : (import.meta.env.VITE_API_URL || '') + imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">History</label>
          <textarea value={form.content.history} onChange={(e) => handleContentChange('history', e.target.value)} rows={4} placeholder="Academy history..." className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">Mission</label>
          <textarea value={form.content.mission} onChange={(e) => handleContentChange('mission', e.target.value)} rows={3} placeholder="Our mission..." className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">Vision</label>
          <textarea value={form.content.vision} onChange={(e) => handleContentChange('vision', e.target.value)} rows={3} placeholder="Our vision..." className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">Principal Message</label>
          <textarea value={form.content.principalMessage} onChange={(e) => handleContentChange('principalMessage', e.target.value)} rows={4} placeholder="Message from principal..." className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-2">Core Values</label>
          <div className="space-y-3">
            {form.content.coreValues.map((cv, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 border border-border-light rounded-xl">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" value={cv.title} onChange={(e) => handleCVChange(idx, 'title', e.target.value)} placeholder="Value title" className="px-3 py-2 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm" />
                  <input type="text" value={cv.description} onChange={(e) => handleCVChange(idx, 'description', e.target.value)} placeholder="Value description" className="px-3 py-2 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm" />
                </div>
                {form.content.coreValues.length > 1 && (
                  <button type="button" onClick={() => removeCV(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove value">
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
          {about?._id && (
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
