import { useState, useEffect } from 'react';
import heroService from '../../services/heroService';

const defaultForm = {
  badge: '',
  title: '',
  description: '',
  features: [''],
  buttons: [{ label: '', url: '', variant: 'primary', isPrimary: true }],
  status: 'draft',
};

export default function AdminHeroManagementSection() {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    loadHero();
  }, []);

  async function loadHero() {
    try {
      setLoading(true);
      const res = await heroService.getAdminHero();
      const data = res.data;
      setHero(data);
      if (data) {
        setForm({
          badge: data.subtitle || data.badge || '',
          title: data.title || '',
          description: data.description || '',
          features: data.features || data.content?.features || [''],
          buttons: data.buttons?.length > 0
            ? data.buttons.map((b) => ({
                label: b.label || '',
                url: b.url || '',
                variant: b.variant || 'primary',
                isPrimary: b.isPrimary ?? false,
              }))
            : defaultForm.buttons,
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

  function handleFeatureChange(idx, value) {
    setForm((prev) => {
      const features = [...prev.features];
      features[idx] = value;
      if (idx === features.length - 1 && value.trim()) {
        features.push('');
      }
      return { ...prev, features };
    });
  }

  function removeFeature(idx) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  }

  function handleButtonChange(idx, field, value) {
    setForm((prev) => {
      const buttons = [...prev.buttons];
      buttons[idx] = { ...buttons[idx], [field]: value };
      return { ...prev, buttons };
    });
  }

  function addButton() {
    setForm((prev) => ({
      ...prev,
      buttons: [...prev.buttons, { label: '', url: '', variant: 'primary', isPrimary: false }],
    }));
  }

  function removeButton(idx) {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== idx),
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);

      const validFeatures = form.features.filter((f) => f.trim());
      const validButtons = form.buttons.filter((b) => b.label.trim() && b.url.trim());

      const payload = {
        title: form.title.trim(),
        subtitle: form.badge.trim(),
        description: form.description.trim(),
        status: form.status,
      };

      if (validFeatures.length > 0) {
        payload.features = validFeatures;
      }
      if (validButtons.length > 0) {
        payload.buttons = validButtons;
      }
      if (imageFile) {
        payload.image = imageFile;
      }

      if (hero?._id) {
        payload.id = hero._id;
        await heroService.updateHero(hero._id, payload);
        setSuccess('Hero content updated successfully');
      } else {
        await heroService.createHero(payload);
        setSuccess('Hero content created successfully');
      }

      loadHero();
    } catch (err) {
      setError(err.message || 'Failed to save hero content');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!hero?._id) return;
    try {
      setSaving(true);
      await heroService.publishHero(hero._id);
      setSuccess('Hero published successfully');
      loadHero();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    if (!hero?._id) return;
    try {
      setSaving(true);
      await heroService.unpublishHero(hero._id);
      setSuccess('Hero unpublished successfully');
      loadHero();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const isPublished = hero?.status === 'published';

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-dark">Hero Section</h2>
          <p className="text-sm text-text-light mt-1">Manage the hero banner content</p>
        </div>
        <div className="flex items-center gap-3">
          {hero?._id && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isPublished ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">
            Badge / Tagline
          </label>
          <input
            type="text"
            name="badge"
            value={form.badge}
            onChange={handleChange}
            placeholder="Admissions Open for 2026"
            className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">
            Heading
          </label>
          <textarea
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Learn Quran & Islamic Education..."
            rows={2}
            className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Join a prestigious online academy..."
            rows={3}
            className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-2">
            Hero Image
          </label>
          {imagePreview && (
            <div className="mb-2">
              <img
                src={imagePreview.startsWith('blob') ? imagePreview : (import.meta.env.VITE_API_URL || '') + imagePreview}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-xl"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-dark mb-2">
            Features
          </label>
          <div className="space-y-2">
            {form.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(idx, e.target.value)}
                  placeholder={idx === 0 ? 'Certified Islamic Scholars' : `Feature ${idx + 1}`}
                  className="flex-1 px-4 py-2 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
                {form.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove feature"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-text-dark">
              Buttons
            </label>
            <button
              type="button"
              onClick={addButton}
              className="text-xs text-primary font-semibold hover:underline"
            >
              + Add Button
            </button>
          </div>
          <div className="space-y-3">
            {form.buttons.map((btn, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 border border-border-light rounded-xl">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={btn.label}
                    onChange={(e) => handleButtonChange(idx, 'label', e.target.value)}
                    placeholder="Button label"
                    className="px-3 py-2 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm"
                  />
                  <input
                    type="text"
                    value={btn.url}
                    onChange={(e) => handleButtonChange(idx, 'url', e.target.value)}
                    placeholder="#apply"
                    className="px-3 py-2 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm"
                  />
                  <select
                    value={btn.variant}
                    onChange={(e) => handleButtonChange(idx, 'variant', e.target.value)}
                    className="px-3 py-2 border-2 border-border-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm"
                  >
                    <option value="primary">Primary</option>
                    <option value="outline">Outline</option>
                    <option value="secondary">Secondary</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
                {form.buttons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeButton(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                    title="Remove button"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border-light">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {hero?._id && (
            <>
              {isPublished ? (
                <button
                  type="button"
                  onClick={handleUnpublish}
                  disabled={saving}
                  className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={saving}
                  className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Publish
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
