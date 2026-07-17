import { useState, useEffect, useCallback } from 'react';
import teacherAcademicService from '../../services/teacherAcademicService';
import { useAuth } from '../../context/AuthContext';
import {
  FiBell, FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight,
  FiSend, FiX, FiClock, FiTarget, FiPaperclip
} from 'react-icons/fi';

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function TeacherAnnouncementsSection() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    teacher: '', title: '', content: '', targetType: 'all',
    targetCourse: '', targetBatch: '', priority: 'normal', isPublished: true,
  });

  const teacherId = user?._id || user?.id;

  const fetchAnnouncements = useCallback(async (p = 1) => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      const res = await teacherAcademicService.getAnnouncements(teacherId, params);
      const data = res?.data || res;
      setAnnouncements(data?.announcements || []);
      setTotalPages(data?.totalPages || Math.ceil((data?.total || 0) / 20) || 1);
      setTotal(data?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }, [teacherId, searchQuery]);

  useEffect(() => { fetchAnnouncements(page); }, [page, fetchAnnouncements]);
  useEffect(() => { setPage(1); }, [searchQuery]);

  const openCreateModal = () => {
    setForm({ teacher: teacherId, title: '', content: '', targetType: 'all', targetCourse: '', targetBatch: '', priority: 'normal', isPublished: true });
    setEditingAnnouncement(null);
    setShowModal(true);
  };

  const openEditModal = (ann) => {
    setForm({
      teacher: teacherId,
      title: ann.title || '',
      content: ann.content || '',
      targetType: ann.targetType || 'all',
      targetCourse: ann.targetCourse?._id || ann.targetCourse || '',
      targetBatch: ann.targetBatch || '',
      priority: ann.priority || 'normal',
      isPublished: ann.isPublished !== false,
    });
    setEditingAnnouncement(ann);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingAnnouncement) {
        await teacherAcademicService.updateAnnouncement(editingAnnouncement._id, form);
        setSuccess('Announcement updated');
      } else {
        await teacherAcademicService.createAnnouncement(form);
        setSuccess('Announcement created');
      }
      setShowModal(false);
      fetchAnnouncements(page);
    } catch (err) {
      setError(err.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ann) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await teacherAcademicService.deleteAnnouncement(ann._id);
      setSuccess('Announcement deleted');
      fetchAnnouncements(page);
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-dark">Announcements</h2>
          <p className="text-sm text-text-light mt-1">{total > 0 ? `${total} announcement${total !== 1 ? 's' : ''}` : 'Create announcements for your courses'}</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm">
          <FiPlus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input type="text" placeholder="Search announcements..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <FiBell className="w-16 h-16 text-border-light mx-auto mb-4" />
          <p className="text-text-light font-medium">No announcements yet</p>
          <p className="text-sm text-text-light mt-2">Create your first announcement to notify students</p>
          <button onClick={openCreateModal} className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark text-sm">
            <FiPlus className="w-4 h-4 inline mr-1.5" /> Create Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <div key={ann._id} className="p-4 sm:p-5 rounded-xl border border-border-light hover:border-primary hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <h3 className="font-semibold text-text-dark text-lg">{ann.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${PRIORITY_COLORS[ann.priority] || 'bg-gray-100 text-gray-800'}`}>{ann.priority}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${ann.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {ann.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-text-body whitespace-pre-line line-clamp-2 mb-2">{ann.content}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-light">
                    <span className="flex items-center gap-1"><FiTarget className="w-3.5 h-3.5" /> {ann.targetType === 'all' ? 'All Students' : ann.targetType === 'course' ? `Course: ${ann.targetCourse?.title || ''}` : ann.targetType === 'batch' ? `Batch: ${ann.targetBatch}` : 'Class'}</span>
                    <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : ''}</span>
                    {ann.attachments?.length > 0 && <span className="flex items-center gap-1"><FiPaperclip className="w-3.5 h-3.5" /> {ann.attachments.length} file(s)</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEditModal(ann)} className="p-1.5 text-primary hover:bg-primary-light rounded-lg transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(ann)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-light">
          <p className="text-sm text-text-light">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50"><FiChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50"><FiChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-dark">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-light hover:text-text-dark"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={4}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Target</label>
                  <select value={form.targetType} onChange={e => setForm(f => ({ ...f, targetType: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                    <option value="all">All Students</option>
                    <option value="course">Specific Course</option>
                    <option value="batch">Specific Batch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              {form.targetType === 'course' && (
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Course ID</label>
                  <input type="text" value={form.targetCourse} onChange={e => setForm(f => ({ ...f, targetCourse: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="MongoDB Course ID" />
                </div>
              )}
              {form.targetType === 'batch' && (
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Batch Name</label>
                  <input type="text" value={form.targetBatch} onChange={e => setForm(f => ({ ...f, targetBatch: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 2026 Batch" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                    className="w-4 h-4 text-primary rounded focus:ring-primary" />
                  <span className="text-sm text-text-dark font-medium">Publish immediately</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50">
                  {saving ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
