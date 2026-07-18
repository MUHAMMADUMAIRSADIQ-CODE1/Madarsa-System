import { useState, useEffect, useCallback } from 'react';
import galleryService from '../../services/galleryService';
import { useToast } from '../../context/ToastContext';

const defaultForm = {
  title: '',
  description: '',
  category: '',
  tags: [],
  isPublished: true,
  order: 0,
};

export default function AdminGalleryManagementSection() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { addToast } = useToast();

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const res = await galleryService.getAll(params);
      setItems(res.data?.data || res.data || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, addToast]);

  const loadStats = useCallback(async () => {
    try {
      const res = await galleryService.getStats();
      setStats(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => { loadItems(); loadStats(); }, [loadItems, loadStats]);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setTagInput('');
  }

  function startEdit(item) {
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      tags: item.tags || [],
      isPublished: item.isPublished !== undefined ? item.isPublished : true,
      order: item.order || 0,
    });
    setEditingId(item._id);
    setImagePreview(item.imageUrl || null);
    setImageFile(null);
    setView('form');
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleAddTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  }

  function handleRemoveTag(tag) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append('title', form.title);
      if (form.description) payload.append('description', form.description);
      if (form.category) payload.append('category', form.category);
      if (form.tags.length) payload.append('tags', JSON.stringify(form.tags));
      payload.append('isPublished', form.isPublished);
      payload.append('order', form.order);
      if (imageFile) payload.append('image', imageFile);

      if (editingId) {
        await galleryService.update(editingId, payload);
        addToast('Gallery item updated');
      } else {
        await galleryService.upload(payload);
        addToast('Image uploaded successfully');
      }
      resetForm();
      setView('list');
      loadItems();
      loadStats();
    } catch (err) {
      addToast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(item) {
    try {
      await galleryService.update(item._id, { isPublished: !item.isPublished });
      addToast(item.isPublished ? 'Item unpublished' : 'Item published');
      loadItems();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this gallery item?')) return;
    try {
      await galleryService.delete(id);
      addToast('Gallery item deleted');
      loadItems();
      loadStats();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  const StatCard = ({ label, value, color }) => (
    <div className="bg-white rounded-xl border border-border-light p-4">
      <p className="text-sm text-text-light">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-text-dark'}`}>{value}</p>
    </div>
  );

  if (view === 'form') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">
              {editingId ? 'Edit Gallery Item' : 'Upload Image'}
            </h2>
            <p className="text-sm text-text-light mt-1">
              {editingId ? 'Update gallery item details' : 'Add a new image to gallery'}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setView('list'); }}
            className="px-4 py-2 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors text-sm"
          >
            Back to Gallery
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Title *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Image title" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Image description" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Category</label>
                  <input type="text" name="category" value={form.category} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. Events, Campus" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Display Order</label>
                  <input type="number" name="order" value={form.order} onChange={handleChange} min={0}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    placeholder="Type tag and press Enter" />
                  <button type="button" onClick={handleAddTag}
                    className="px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-dark">Add</button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-bg-light rounded-full text-xs font-medium text-text-dark">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-red-500 hover:text-red-700">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange}
                  className="w-4 h-4 text-primary rounded border-border-light" />
                <span className="text-sm text-text-dark font-medium">Published</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Image *</label>
                <input type="file" accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 h-48 w-full object-cover rounded-lg border border-border-light" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-border-light">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Upload'}
            </button>
            <button type="button" onClick={() => { resetForm(); setView('list'); }}
              className="px-6 py-2.5 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Images" value={stats.total || items.length} color="text-text-dark" />
          <StatCard label="Published" value={stats.published || items.filter(i => i.isPublished).length} color="text-green-600" />
          <StatCard label="Unpublished" value={stats.unpublished || items.filter(i => !i.isPublished).length} color="text-orange-600" />
          <StatCard label="Categories" value={stats.categories || new Set(items.map(i => i.category).filter(Boolean)).size} color="text-blue-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">Gallery Management</h2>
            <p className="text-sm text-text-light mt-1">Manage gallery images and media</p>
          </div>
          <button onClick={() => { resetForm(); setView('form'); }}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">
            + Upload Image
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search gallery..."
            className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">No gallery items found</p>
            <button onClick={() => { resetForm(); setView('form'); }}
              className="mt-3 px-5 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark text-sm transition-colors">
              Upload your first image
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
            <table className="w-full min-w-[600px]">
              <thead className="border-b-2 border-border-light">
                <tr>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Image</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Title</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm hidden md:table-cell">Category</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm hidden sm:table-cell">Status</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-bg-light transition-colors">
                    <td className="p-3">
                      <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-lg object-cover" />
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-text-dark text-sm">{item.title}</p>
                      {item.description && <p className="text-xs text-text-light mt-0.5 line-clamp-1">{item.description}</p>}
                    </td>
                    <td className="p-3 text-sm text-text-body hidden md:table-cell">{item.category || '-'}</td>
                    <td className="p-3 text-center hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.isPublished ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => startEdit(item)} className="text-primary text-xs hover:underline font-medium">Edit</button>
                        <button onClick={() => handleTogglePublish(item)}
                          className={`text-xs hover:underline font-medium ${item.isPublished ? 'text-orange-500' : 'text-green-600'}`}>
                          {item.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="text-red-500 text-xs hover:underline font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
