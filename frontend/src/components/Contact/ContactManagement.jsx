import { useState, useEffect } from 'react';
import contactService from '../../services/contactService';

const defaultForm = {
  content: {
    email: '',
    primaryPhone: '',
    secondaryPhone: '',
    whatsapp: '',
    address: '',
    mapUrl: '',
    officeTiming: '',
    emergencyContact: '',
    admissionContact: '',
  },
  status: 'draft',
};

export default function AdminContactManagementSection() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState(defaultForm);

  useEffect(() => { loadContact(); }, []);

  async function loadContact() {
    try {
      setLoading(true);
      const res = await contactService.getAdminContact();
      const data = res.data;
      setContact(data);
      if (data) {
        const c = data.content || {};
        setForm({
          content: {
            email: c.email || '',
            primaryPhone: c.primaryPhone || '',
            secondaryPhone: c.secondaryPhone || '',
            whatsapp: c.whatsapp || '',
            address: c.address || '',
            mapUrl: c.mapUrl || '',
            officeTiming: c.officeTiming || '',
            emergencyContact: c.emergencyContact || '',
            admissionContact: c.admissionContact || '',
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

  function handleContentChange(field, value) {
    setForm((prev) => ({
      ...prev,
      content: { ...prev.content, [field]: value },
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setSaving(true);
      const payload = {
        content: form.content,
        status: form.status,
      };
      if (contact?._id) {
        await contactService.updateContact(contact._id, payload);
        setSuccess('Contact content updated successfully');
      } else {
        await contactService.createContact(payload);
        setSuccess('Contact content created successfully');
      }
      loadContact();
    } catch (err) {
      setError(err.message || 'Failed to save contact content');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!contact?._id) return;
    try {
      setSaving(true);
      await contactService.publishContact(contact._id);
      setSuccess('Contact published successfully');
      loadContact();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleUnpublish() {
    if (!contact?._id) return;
    try {
      setSaving(true);
      await contactService.unpublishContact(contact._id);
      setSuccess('Contact unpublished successfully');
      loadContact();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const isPublished = contact?.status === 'published';

  const fields = [
    { key: 'email', label: 'Academy Email', type: 'email', placeholder: 'info@jamiatululoom.com' },
    { key: 'primaryPhone', label: 'Primary Phone', type: 'tel', placeholder: '+92-300-1234567' },
    { key: 'secondaryPhone', label: 'Secondary Phone', type: 'tel', placeholder: '+92-300-1234567' },
    { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', placeholder: '+92-300-1234567' },
    { key: 'address', label: 'Address', type: 'text', placeholder: 'Jamia Masjid Road, Karachi' },
    { key: 'mapUrl', label: 'Google Maps URL', type: 'url', placeholder: 'https://maps.google.com/...' },
    { key: 'officeTiming', label: 'Office Timing', type: 'text', placeholder: 'Mon-Fri: 9:00 AM - 5:00 PM' },
    { key: 'emergencyContact', label: 'Emergency Contact', type: 'tel', placeholder: '+92-300-1234567' },
    { key: 'admissionContact', label: 'Admission Contact', type: 'tel', placeholder: '+92-300-1234567' },
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
          <h2 className="font-heading text-2xl font-bold text-text-dark">Contact Information</h2>
          <p className="text-sm text-text-light mt-1">Manage academy contact details</p>
        </div>
        {contact?._id && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPublished ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-text-dark mb-1">{f.label}</label>
              <input
                type={f.type}
                value={form.content[f.key]}
                onChange={(e) => handleContentChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 border-2 border-border-light rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border-light">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {contact?._id && (
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
