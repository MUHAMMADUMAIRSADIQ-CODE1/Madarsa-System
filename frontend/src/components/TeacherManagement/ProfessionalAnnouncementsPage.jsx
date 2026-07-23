import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import teacherAcademicService from '../../services/teacherAcademicService';
import teacherPortalService from '../../services/teacherPortalService';
import { AnnouncementFormModal, ResourceCard, InfoCard, PublishedBadge, PinnedBadge, ResourceBadge, formatFullDate, formatDateTime } from '../LMS/CourseAnnouncementTab';
import { toast } from 'react-toastify';
import {
  FiBell, FiSearch, FiPlus, FiLoader, FiAlertCircle, FiRefreshCw,
  FiCheck, FiClock, FiMapPin, FiEye, FiEyeOff, FiTrash2, FiLink, FiEdit2,
  FiUser, FiCalendar, FiX,
} from 'react-icons/fi';

// ─── Helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return dateStr; }
}

// ─── Stat Card ───────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 sm:p-5 hover:shadow-md transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl ${color || 'bg-primary/10'} flex items-center justify-center mb-2`}>
        <Icon className={`w-5 h-5 ${color ? color.split(' ')[0] || 'text-primary' : 'text-primary'}`} />
      </div>
      <p className="text-2xl font-bold text-text-dark">{value}</p>
      <p className="text-xs text-text-light font-medium mt-0.5">{label}</p>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-xl w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-12 bg-gray-100 rounded-xl w-full" />
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function ProfessionalAnnouncementsPage() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courses, setCourses] = useState([]);

  // Create/Edit modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [createCourseId, setCreateCourseId] = useState('');
  const [mutationError, setMutationError] = useState(null);

  // View detail state
  const [viewAnnouncement, setViewAnnouncement] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [profileRes, coursesRes] = await Promise.allSettled([
        teacherPortalService.getProfile(),
        teacherPortalService.getCourses(userId, { limit: 50 }),
      ]);
      let teacherId = null;
      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value?.data || profileRes.value;
        setProfile(p);
        teacherId = p?._id;
      }
      if (coursesRes.status === 'fulfilled') {
        const d = coursesRes.value?.data || coursesRes.value;
        setCourses(d?.courses || []);
      }
      if (userId) {
        const params = { limit: 100 };
        if (courseFilter !== 'all') params.course = courseFilter;
        const res = await teacherAcademicService.getAnnouncements(userId, params);
        const d = res?.data || res;
        setAnnouncements(d?.announcements || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [userId, courseFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    let list = [...announcements];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => (a.title || '').toLowerCase().includes(q) || (a.content || '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter(a => {
        const pub = a.isPublished || a.status === 'published';
        return statusFilter === 'published' ? pub : !pub;
      });
    }
    // Sort: pinned first, then newest
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return list;
  }, [announcements, search, statusFilter]);

  const stats = useMemo(() => {
    const published = filtered.filter(a => a.isPublished || a.status === 'published').length;
    const draft = filtered.filter(a => !a.isPublished && a.status !== 'published').length;
    const pinned = filtered.filter(a => a.isPinned).length;
    return { total: filtered.length, published, draft, pinned };
  }, [filtered]);

  const handleEdit = (announcement) => {
    setEditAnnouncement(announcement);
    setCreateCourseId(announcement.targetCourse?._id || announcement.targetCourse?.id || announcement.targetCourse || '');
    setShowCreate(true);
  };

  // Handler for AnnouncementFormModal — it calls onSave(form, announcement) on submit
  const handleCreateAnnouncement = async (form, announcement) => {
    setMutationError(null);
    try {
      const selectedCourseId = createCourseId || form.targetCourse || undefined;
      const payload = {
        teacher: userId,
        title: form.title,
        content: form.content,
        targetType: selectedCourseId ? 'course' : (form.targetType || 'all'),
        targetCourse: selectedCourseId,
        priority: form.priority || 'normal',
        isPublished: form.isPublished !== false,
        isPinned: form.isPinned || false,
        resourceLink: form.resourceLink || undefined,
      };
      if (announcement) {
        // Editing
        await teacherAcademicService.updateAnnouncement(
          announcement._id || announcement.id,
          payload
        );
      } else {
        // Creating
        await teacherAcademicService.createAnnouncement(payload);
      }
      toast.success(`Announcement ${announcement ? 'updated' : 'created'} successfully`);
      setCreateCourseId('');
      fetchAll();
    } catch (err) {
      setMutationError(err.message || 'Failed to save announcement');
      throw err; // Let the modal handle the error
    }
  };

  const handleTogglePublish = async (id, isPublished) => {
    try {
      if (isPublished) {
        await teacherAcademicService.updateAnnouncement(id, { isPublished: false });
      } else {
        await teacherAcademicService.publishAnnouncement(id);
      }
      toast.success(`Announcement ${isPublished ? 'unpublished' : 'published'}`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await teacherAcademicService.pinAnnouncement(id);
      toast.success('Pin status toggled');
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await teacherAcademicService.deleteAnnouncement(id);
      toast.success('Announcement deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  if (loading) return <Skeleton />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <button onClick={fetchAll} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 border border-border-light text-text-dark rounded-xl font-semibold hover:bg-bg-light transition-all text-sm">
          <FiRefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark">Announcements</h1>
          <p className="text-text-light text-sm mt-1">Manage announcements across all courses</p>
        </div>
        <button onClick={() => {
          if (courseFilter !== 'all') {
            setCreateCourseId(courseFilter);
            setShowCreate(true);
          } else {
            setCreateCourseId('');
            setShowCoursePicker(true);
          }
        }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
          <FiPlus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FiBell} label="Total" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={FiCheck} label="Published" value={stats.published} color="bg-green-50 text-green-600" />
        <StatCard icon={FiClock} label="Drafts" value={stats.draft} color="bg-amber-50 text-amber-600" />
        <StatCard icon={FiMapPin} label="Pinned" value={stats.pinned} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/50" />
          <input type="text" placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
          <option value="all">All Courses</option>
          {courses.map(c => {
            const cd = c.course || c;
            return <option key={cd._id || cd.id} value={cd._id || cd.id}>{cd.title || 'Untitled'}</option>;
          })}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Announcements List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((announcement) => {
            const isPublished = announcement.isPublished || announcement.status === 'published';
            const isPinned = announcement.isPinned;
            const courseTitle = announcement.targetCourse?.title || '—';
            const teacherName = announcement.teacher?.fullName || user?.fullName || user?.name || '';
            const aId = announcement._id || announcement.id;

            return (
              <div key={aId} className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all duration-200 ${isPinned ? 'border-primary/30 bg-primary/[0.02]' : 'border-border-light'}`}>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            <FiMapPin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                        {announcement.resourceLink && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                            <FiLink className="w-3 h-3" /> Resource
                          </span>
                        )}
                      </div>
                      {/* Title */}
                      <h3 className="font-bold text-text-dark text-base leading-snug line-clamp-2">{announcement.title || 'Untitled'}</h3>
                      {/* Preview */}
                      {announcement.content && (
                        <p className="text-sm text-text-body/70 mt-1 line-clamp-2">{announcement.content}</p>
                      )}
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-text-light/60">
                        <span>{courseTitle}</span>
                        <span>{formatDate(announcement.publishedAt || announcement.createdAt)}</span>
                        {teacherName && <span>{teacherName}</span>}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => setViewAnnouncement(announcement)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" title="View">
                        <FiEye className="w-4 h-4 text-text-light/60" />
                      </button>
                      <button onClick={() => handleEdit(announcement)} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors" title="Edit">
                        <FiEdit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => handleTogglePublish(aId, isPublished)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" title={isPublished ? 'Unpublish' : 'Publish'}>
                        {isPublished ? <FiEyeOff className="w-4 h-4 text-amber-500" /> : <FiEye className="w-4 h-4 text-green-500" />}
                      </button>
                      <button onClick={() => handleTogglePin(aId)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" title={isPinned ? 'Unpin' : 'Pin'}>
                        <FiMapPin className={`w-4 h-4 ${isPinned ? 'text-primary' : 'text-text-light/40'}`} />
                      </button>
                      <button onClick={() => handleDelete(aId)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors" title="Delete">
                        <FiTrash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-border-light p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <FiBell className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="font-heading text-lg font-bold text-text-dark mb-1">No announcements yet</h3>
          <button onClick={() => {
            if (courseFilter !== 'all') {
              setCreateCourseId(courseFilter);
              setShowCreate(true);
            } else {
              setCreateCourseId('');
              setShowCoursePicker(true);
            }
          }} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
            <FiPlus className="w-4 h-4" /> Create Announcement
          </button>
        </div>
      )}

      {/* ─── View Detail Modal ─────────────────────────── */}
      {viewAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setViewAnnouncement(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <h3 className="font-heading font-bold text-text-dark text-lg">{viewAnnouncement.title || 'Announcement'}</h3>
              <button onClick={() => setViewAnnouncement(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-light hover:text-text-dark hover:bg-bg-light transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="flex flex-wrap gap-2 mb-4">
                <PublishedBadge published={viewAnnouncement.isPublished} />
                {viewAnnouncement.isPinned && <PinnedBadge />}
                {viewAnnouncement.resourceLink && <ResourceBadge />}
              </div>
              <div className="text-sm text-text-body leading-relaxed whitespace-pre-line mb-6 bg-bg-light rounded-xl p-4">
                {viewAnnouncement.content || (
                  <span className="text-text-light/60 italic">No content provided.</span>
                )}
              </div>
              {viewAnnouncement.resourceLink && (
                <div className="mb-6">
                  <ResourceCard resourceLink={viewAnnouncement.resourceLink} />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard icon={FiUser} iconBg="bg-blue-50" iconColor="text-blue-500" label="Teacher" value={viewAnnouncement.teacher?.fullName || user?.fullName || user?.name || '—'} />
                <InfoCard icon={viewAnnouncement.isPublished ? FiEye : FiEyeOff} iconBg={viewAnnouncement.isPublished ? 'bg-green-50' : 'bg-yellow-50'} iconColor={viewAnnouncement.isPublished ? 'text-green-500' : 'text-yellow-500'} label="Status" value={viewAnnouncement.isPublished ? 'Published' : 'Draft'} />
                <InfoCard icon={FiCalendar} iconBg="bg-blue-50" iconColor="text-blue-500" label="Published Date" value={formatFullDate(viewAnnouncement.publishedAt) || '—'} />
                <InfoCard icon={FiCalendar} iconBg="bg-indigo-50" iconColor="text-indigo-500" label="Created" value={formatFullDate(viewAnnouncement.createdAt) || '—'} />
                {viewAnnouncement.updatedAt && (
                  <InfoCard icon={FiCalendar} iconBg="bg-amber-50" iconColor="text-amber-500" label="Last Updated" value={formatFullDate(viewAnnouncement.updatedAt) || '—'} />
                )}
                <InfoCard icon={FiLink} iconBg="bg-purple-50" iconColor="text-purple-500" label="Resource" value={viewAnnouncement.resourceLink ? 'Attached' : 'None'} />
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-border-light">
              <button onClick={() => setViewAnnouncement(null)} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Course Picker Modal ──────────────────────── */}
      {showCoursePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCoursePicker(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-text-dark mb-4">Select Course</h3>
            <p className="text-sm text-text-light mb-4">Choose which course this announcement is for:</p>
            <select value={createCourseId} onChange={e => setCreateCourseId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-4">
              <option value="">— Select Course —</option>
              {courses.map(c => {
                const cd = c.course || c;
                return <option key={cd._id || cd.id} value={cd._id || cd.id}>{cd.title || 'Untitled'}</option>;
              })}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCoursePicker(false)} className="px-5 py-2.5 rounded-xl border border-border-light text-text-dark text-sm font-semibold hover:bg-bg-light transition-all">Cancel</button>
              <button onClick={() => {
                if (!createCourseId) { toast.error('Please select a course'); return; }
                setShowCoursePicker(false);
                setShowCreate(true);
              }} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reuse existing AnnouncementFormModal ─────── */}
      <AnnouncementFormModal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setCreateCourseId(''); setEditAnnouncement(null); }}
        onSave={handleCreateAnnouncement}
        announcement={editAnnouncement}
      />
    </div>
  );
}
