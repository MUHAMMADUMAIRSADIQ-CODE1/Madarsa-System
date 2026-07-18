import { useState, useEffect, useCallback } from 'react';
import courseService from '../../services/courseService';
import { FiBook, FiUser, FiUsers } from 'react-icons/fi';

const defaultForm = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  categoryName: '',
  level: 'all',
  language: 'English',
  duration: '',
  totalLessons: 0,
  certificateAvailable: false,
  featured: false,
  popular: false,
  trending: false,
  maxStudents: 50,
  displayOrder: 0,
  introVideoUrl: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: [],
  status: 'draft',
};

const levelOptions = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function AdminCourseManagementSection() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const [form, setForm] = useState(defaultForm);
  const [keywordInput, setKeywordInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [perCourseStats, setPerCourseStats] = useState({});

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      const res = await courseService.getAdminCourses(params);
      setCourses(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const res = await courseService.getCourseStats();
      const s = res.data;
      setStats(s);
      // Build a map of courseId -> { teachers, students }
      if (s?.perCourse) {
        const map = {};
        s.perCourse.forEach((c) => {
          map[c._id] = { teachers: c.teachers || 0, students: c.students || 0 };
        });
        setPerCourseStats(map);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadCourses();
    loadStats();
  }, [loadCourses, loadStats]);

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      const res = await courseService.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      if (editingCategory) {
        await courseService.updateCategory(editingCategory._id, { name });
      } else {
        await courseService.createCategory({ name });
      }
      setNewCategoryName('');
      setEditingCategory(null);
      await loadCategories();
      await loadStats();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    try {
      await courseService.deleteCategory(id);
      await loadCategories();
      await loadStats();
    } catch (err) {
      setError(err.message);
    }
  }

  function openCategoryModal() {
    setShowCategoryModal(true);
    setNewCategoryName('');
    setEditingCategory(null);
    loadCategories();
  }

  function resetForm() {
    setForm(defaultForm);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setBannerFile(null);
    setBannerPreview(null);
    setKeywordInput('');
    setEditingId(null);
    setError(null);
    setSuccess(null);
  }

  function startEdit(course) {
    setForm({
      title: course.title || '',
      shortDescription: course.shortDescription || '',
      fullDescription: course.fullDescription || '',
      categoryName: course.categoryName || '',
      level: course.level || 'all',
      language: course.language || 'English',
      duration: course.duration || '',
      totalLessons: course.totalLessons || 0,
      certificateAvailable: course.certificateAvailable || false,
      featured: course.featured || false,
      popular: course.popular || false,
      trending: course.trending || false,
      maxStudents: course.maxStudents ?? 50,
      displayOrder: course.displayOrder ?? 0,
      introVideoUrl: course.introVideoUrl || '',
      seoTitle: course.seoTitle || '',
      seoDescription: course.seoDescription || '',
      seoKeywords: course.seoKeywords || [],
      status: course.status || 'draft',
    });
    setEditingId(course._id);
    setThumbnailPreview(course.thumbnail || null);
    setBannerPreview(course.banner || null);
    setThumbnailFile(null);
    setBannerFile(null);
    setView('form');
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleAddKeyword() {
    const kw = keywordInput.trim();
    if (kw && !form.seoKeywords.includes(kw)) {
      setForm((prev) => ({ ...prev, seoKeywords: [...prev.seoKeywords, kw] }));
    }
    setKeywordInput('');
  }

  function handleRemoveKeyword(kw) {
    setForm((prev) => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter((k) => k !== kw),
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setSaving(true);
      const payload = { ...form };
      if (thumbnailFile) payload.thumbnail = thumbnailFile;
      if (bannerFile) payload.banner = bannerFile;
      if (editingId) {
        await courseService.updateCourse(editingId, payload);
        setSuccess('Course updated successfully');
      } else {
        await courseService.createCourse(payload);
        setSuccess('Course created successfully');
      }
      resetForm();
      setView('list');
      loadCourses();
      loadStats();
    } catch (err) {
      setError(err.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(id) {
    try {
      setSaving(true);
      await courseService.publishCourse(id);
      setSuccess('Course published');
      loadCourses();
      loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish(id) {
    try {
      setSaving(true);
      await courseService.unpublishCourse(id);
      setSuccess('Course unpublished');
      loadCourses();
      loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id) {
    if (!confirm('Archive this course?')) return;
    try {
      await courseService.archiveCourse(id);
      setSuccess('Course archived');
      loadCourses();
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRestore(id) {
    try {
      await courseService.restoreCourse(id);
      setSuccess('Course restored');
      loadCourses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDuplicate(id) {
    try {
      await courseService.duplicateCourse(id);
      setSuccess('Course duplicated');
      loadCourses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this course? It will be soft-deleted.')) return;
    try {
      await courseService.deleteCourse(id);
      setSuccess('Course deleted');
      loadCourses();
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  }

  const StatCard = ({ label, value, color }) => (
    <div className="bg-white rounded-xl border border-border-light p-4">
      <p className="text-sm text-text-light">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-text-dark'}`}>{value}</p>
    </div>
  );

  const statusBadge = (status) => {
    const map = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-orange-100 text-orange-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (view === 'form') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">
              {editingId ? 'Edit Course' : 'Create Course'}
            </h2>
            <p className="text-sm text-text-light mt-1">
              {editingId ? 'Update course details' : 'Add a new course'}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setView('list'); }}
            className="px-4 py-2 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors text-sm"
          >
            Back to List
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-text-dark">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Short Description</label>
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Brief description (max 300 chars)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Full Description</label>
                <textarea
                  name="fullDescription"
                  value={form.fullDescription}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Detailed course description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Category</label>
                  <input
                    type="text"
                    name="categoryName"
                    value={form.categoryName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. Quran, Arabic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Level</label>
                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    {levelOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. 12 weeks"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Total Lessons</label>
                  <input
                    type="number"
                    name="totalLessons"
                    value={form.totalLessons}
                    onChange={handleChange}
                    min={0}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Max Students</label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={form.maxStudents}
                    onChange={handleChange}
                    min={0}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Intro Video URL</label>
                <input
                  type="url"
                  name="introVideoUrl"
                  value={form.introVideoUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={form.displayOrder}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-text-dark">Media & Flags</h3>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setThumbnailFile(file);
                      setThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                />
                {thumbnailPreview && (
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="mt-2 h-32 w-56 object-cover rounded-lg border border-border-light" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setBannerFile(file);
                      setBannerPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                />
                {bannerPreview && (
                  <img src={bannerPreview} alt="Banner preview" className="mt-2 h-24 w-full object-cover rounded-lg border border-border-light" />
                )}
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 text-primary rounded border-border-light" />
                  <span className="text-sm text-text-dark font-medium">Featured Course</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="popular" checked={form.popular} onChange={handleChange} className="w-4 h-4 text-primary rounded border-border-light" />
                  <span className="text-sm text-text-dark font-medium">Popular Course</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="trending" checked={form.trending} onChange={handleChange} className="w-4 h-4 text-primary rounded border-border-light" />
                  <span className="text-sm text-text-dark font-medium">Trending Course</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="certificateAvailable" checked={form.certificateAvailable} onChange={handleChange} className="w-4 h-4 text-primary rounded border-border-light" />
                  <span className="text-sm text-text-dark font-medium">Certificate Available</span>
                </label>
              </div>

              <h3 className="font-heading font-semibold text-text-dark pt-2">SEO</h3>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">SEO Title</label>
                <input
                  type="text"
                  name="seoTitle"
                  value={form.seoTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">SEO Description</label>
                <textarea
                  name="seoDescription"
                  value={form.seoDescription}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">SEO Keywords</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    placeholder="Type keyword and press Enter"
                  />
                  <button type="button" onClick={handleAddKeyword} className="px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-dark">
                    Add
                  </button>
                </div>
                {form.seoKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.seoKeywords.map((kw) => (
                      <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 bg-bg-light rounded-full text-xs font-medium text-text-dark">
                        {kw}
                        <button type="button" onClick={() => handleRemoveKeyword(kw)} className="text-red-500 hover:text-red-700">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-border-light">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); setView('list'); }}
              className="px-6 py-2.5 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Courses" value={stats.total} color="text-text-dark" />
          <StatCard label="Published" value={stats.published} color="text-green-600" />
          <StatCard label="Draft" value={stats.draft} color="text-orange-600" />
          <StatCard label="Archived" value={stats.archived} color="text-gray-600" />
          <StatCard label="Featured" value={stats.featured} color="text-primary" />
          <StatCard label="Categories" value={stats.categoryDistribution?.length || 0} color="text-blue-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">Course Management</h2>
            <p className="text-sm text-text-light mt-1">Manage all courses on the platform</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCategoryModal}
              className="px-5 py-2.5 border border-primary text-primary font-semibold rounded-xl hover:bg-primary-light transition-colors text-sm"
            >
              Categories
            </button>
            <button
              onClick={() => { resetForm(); setView('form'); }}
              className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm"
            >
              + Add Course
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">No courses found</p>
            <button
              onClick={() => { resetForm(); setView('form'); }}
              className="mt-3 px-5 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark text-sm transition-colors"
            >
              Create your first course
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
            <table className="w-full min-w-[900px]">
              <thead className="border-b-2 border-border-light">
                <tr>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Course</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm hidden md:table-cell">Category</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm hidden sm:table-cell">Level</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm hidden lg:table-cell">Teachers</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm hidden lg:table-cell">Students</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Duration</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Status</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {courses.map((course) => {
                  const stats = perCourseStats[course._id] || {};
                  return (
                    <tr key={course._id} className="hover:bg-bg-light transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover hidden sm:block border border-border-light"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hidden sm:flex">
                              <FiBook size={16} className="text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-text-dark text-sm">{course.title}</p>
                            <p className="text-xs text-text-light mt-0.5">
                              {course.language} {course.duration ? ` - ${course.duration}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-text-body hidden md:table-cell">{course.categoryName || '-'}</td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        <span className="text-xs capitalize text-text-body">{course.level}</span>
                      </td>
                      <td className="p-3 text-center hidden lg:table-cell">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                          <FiUser size={12} />
                          {stats.teachers ?? '-'}
                        </span>
                      </td>
                      <td className="p-3 text-center hidden lg:table-cell">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-purple-600">
                          <FiUsers size={12} />
                          {stats.students ?? '-'}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm text-text-body">{course.duration || '-'}</td>
                      <td className="p-3 text-center">{statusBadge(course.status)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => startEdit(course)} className="text-primary text-xs hover:underline font-medium">Edit</button>
                          {course.status === 'published' ? (
                            <button onClick={() => handleUnpublish(course._id)} className="text-orange-500 text-xs hover:underline font-medium">Unpublish</button>
                          ) : course.status === 'archived' ? (
                            <button onClick={() => handleRestore(course._id)} className="text-blue-500 text-xs hover:underline font-medium">Restore</button>
                          ) : (
                            <button onClick={() => handlePublish(course._id)} className="text-green-600 text-xs hover:underline font-medium">Publish</button>
                          )}
                          <button onClick={() => handleDuplicate(course._id)} className="text-gray-500 text-xs hover:underline font-medium">Copy</button>
                          {course.status !== 'archived' && (
                            <button onClick={() => handleArchive(course._id)} className="text-gray-500 text-xs hover:underline font-medium">Archive</button>
                          )}
                          <button onClick={() => handleDelete(course._id)} className="text-red-500 text-xs hover:underline font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 pb-10 overflow-y-auto"
          onClick={() => setShowCategoryModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-dark">Manage Categories</h3>
              <button onClick={() => setShowCategoryModal(false)}
                className="text-text-light hover:text-text-dark text-xl">&times;</button>
            </div>

            <div className="flex gap-2 mb-4">
              <input type="text" value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                placeholder={editingCategory ? 'Edit category name...' : 'New category name...'}
                className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
              <button onClick={handleAddCategory}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-dark transition-colors whitespace-nowrap">
                {editingCategory ? 'Update' : 'Add'}
              </button>
              {editingCategory && (
                <button onClick={() => { setEditingCategory(null); setNewCategoryName(''); }}
                  className="px-4 py-2 border border-border-light text-text-light rounded-xl text-sm hover:bg-bg-light transition-colors">
                  Cancel
                </button>
              )}
            </div>

            {loadingCategories ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-center py-8 text-text-light text-sm">No categories yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map(cat => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-bg-light rounded-lg">
                    <span className="text-sm font-medium text-text-dark">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingCategory(cat); setNewCategoryName(cat.name); }}
                        className="text-primary text-xs hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDeleteCategory(cat._id)}
                        className="text-red-500 text-xs hover:underline font-medium">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
