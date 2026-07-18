import { useState, useEffect, useCallback } from 'react';
import newsService from '../../services/newsService';
import { useToast } from '../../context/ToastContext';

const defaultForm = {
  title: '',
  content: '',
  excerpt: '',
  category: '',
  tags: [],
  isPublished: false,
  isFeatured: false,
  coverImage: '',
};

export default function AdminNewsManagementSection() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [tagInput, setTagInput] = useState('');
  const { addToast } = useToast();

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.isPublished = statusFilter;
      const res = await newsService.getAll(params);
      setItems(res.data?.data || res.data || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, addToast]);

  const loadStats = useCallback(async () => {
    try {
      const res = await newsService.getStats();
      setStats(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => { loadItems(); loadStats(); }, [loadItems, loadStats]);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
    setTagInput('');
  }

  function startEdit(item) {
    setForm({
      title: item.title || '',
      content: item.content || '',
      excerpt: item.excerpt || '',
      category: item.category || '',
      tags: item.tags || [],
      isPublished: item.isPublished || false,
      isFeatured: item.isFeatured || false,
      coverImage: item.coverImage || '',
    });
    setEditingId(item._id);
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
      const payload = { ...form };
      if (editingId) {
        await newsService.update(editingId, payload);
        addToast('Article updated');
      } else {
        await newsService.create(payload);
        addToast('Article created');
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

  async function handlePublish(id) {
    try {
      await newsService.update(id, { isPublished: true });
      addToast('Article published');
      loadItems();
      loadStats();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleUnpublish(id) {
    try {
      await newsService.update(id, { isPublished: false });
      addToast('Article unpublished');
      loadItems();
      loadStats();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleToggleFeatured(id, current) {
    try {
      await newsService.update(id, { isFeatured: !current });
      addToast(current ? 'Removed from featured' : 'Marked as featured');
      loadItems();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this article?')) return;
    try {
      await newsService.delete(id);
      addToast('Article deleted');
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

  const statusBadge = (item) => {
    if (item.isPublished && item.isFeatured) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Featured</span>;
    if (item.isPublished) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">Published</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">Draft</span>;
  };

  if (view === 'form') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">
              {editingId ? 'Edit Article' : 'Create Article'}
            </h2>
            <p className="text-sm text-text-light mt-1">
              {editingId ? 'Update news/article details' : 'Add a new news article'}
            </p>
          </div>
          <button onClick={() => { resetForm(); setView('list'); }}
            className="px-4 py-2 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors text-sm">
            Back to List
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Title *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Article title (min 5 chars)" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Excerpt</label>
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={3}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Short summary (max 500 chars)" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Content *</label>
                <textarea name="content" value={form.content} onChange={handleChange} rows={10} required
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Full article content..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Category</label>
                  <input type="text" name="category" value={form.category} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. News, Events" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Cover Image URL</label>
                  <input type="url" name="coverImage" value={form.coverImage} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-text-dark">Flags</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange}
                    className="w-4 h-4 text-primary rounded border-border-light" />
                  <span className="text-sm text-text-dark font-medium">Published</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange}
                    className="w-4 h-4 text-primary rounded border-border-light" />
                  <span className="text-sm text-text-dark font-medium">Featured Article</span>
                </label>
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

              {form.coverImage && (
                <div>
                  <p className="text-sm font-medium text-text-dark mb-1">Cover Preview</p>
                  <img src={form.coverImage} alt="Cover preview" className="h-40 w-full object-cover rounded-lg border border-border-light"
                    onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-border-light">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update Article' : 'Create Article'}
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
          <StatCard label="Total Articles" value={stats.total || items.length} color="text-text-dark" />
          <StatCard label="Published" value={stats.published || items.filter(i => i.isPublished).length} color="text-green-600" />
          <StatCard label="Featured" value={stats.featured || items.filter(i => i.isFeatured).length} color="text-purple-600" />
          <StatCard label="Categories" value={stats.categories || new Set(items.map(i => i.category).filter(Boolean)).size} color="text-blue-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">News & Events Management</h2>
            <p className="text-sm text-text-light mt-1">Manage news articles, announcements, and events</p>
          </div>
          <button onClick={() => { resetForm(); setView('form'); }}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">
            + Create Article
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">No articles found</p>
            <button onClick={() => { resetForm(); setView('form'); }}
              className="mt-3 px-5 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark text-sm transition-colors">
              Create your first article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
            <table className="w-full min-w-[600px]">
              <thead className="border-b-2 border-border-light">
                <tr>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Title</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm hidden md:table-cell">Category</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm hidden sm:table-cell">Status</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm hidden lg:table-cell">Views</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-bg-light transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {item.coverImage && (
                          <img src={item.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover hidden sm:block" />
                        )}
                        <div>
                          <p className="font-semibold text-text-dark text-sm">{item.title}</p>
                          <p className="text-xs text-text-light mt-0.5">
                            {item.excerpt ? (item.excerpt.length > 60 ? item.excerpt.slice(0, 60) + '...' : item.excerpt) : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-text-body hidden md:table-cell">{item.category || '-'}</td>
                    <td className="p-3 text-center hidden sm:table-cell">{statusBadge(item)}</td>
                    <td className="p-3 text-center text-sm text-text-body hidden lg:table-cell">{item.viewCount || 0}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => startEdit(item)} className="text-primary text-xs hover:underline font-medium">Edit</button>
                        {item.isPublished ? (
                          <button onClick={() => handleUnpublish(item._id)} className="text-orange-500 text-xs hover:underline font-medium">Unpublish</button>
                        ) : (
                          <button onClick={() => handlePublish(item._id)} className="text-green-600 text-xs hover:underline font-medium">Publish</button>
                        )}
                        <button onClick={() => handleToggleFeatured(item._id, item.isFeatured)}
                          className={`text-xs hover:underline font-medium ${item.isFeatured ? 'text-purple-500' : 'text-gray-500'}`}>
                          {item.isFeatured ? 'Unfeature' : 'Feature'}
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
