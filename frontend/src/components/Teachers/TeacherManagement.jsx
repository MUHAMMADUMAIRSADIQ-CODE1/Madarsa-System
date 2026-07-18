import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import teacherService from '../../services/teacherService';
import courseService from '../../services/courseService';
import assignmentService from '../../services/assignmentService';

import ActionDropdown from '../common/ActionDropdown';
import AdminDetailView from '../common/AdminDetailView';
import AdminAssignmentSection from '../Dashboard/AdminAssignmentSection';
import AdminTeacherCourseAssignment from '../Dashboard/AdminTeacherCourseAssignment';

import {
  FiEye,
  FiEdit2,
  FiUpload,
  FiDownload,
  FiLock,
  FiUnlock,
  FiToggleLeft,
  FiToggleRight,
  FiTrash2,
  FiUser,
  FiUsers,
  FiStar,
  FiBook,
  FiBookOpen,
} from 'react-icons/fi';

const USER_STATUS_MAP = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  blocked: { label: 'Blocked', color: 'bg-gray-100 text-gray-800' },
};

const VERIFICATION_STATUS_MAP = {
  not_submitted: { label: 'Not Submitted', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  changes_requested: { label: 'Changes Requested', color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

const defaultForm = {
  fullName: '', shortBio: '', biography: '', qualification: '', degree: '',
  experience: 0, specialization: '', subjects: [], teachingLanguages: [],
  country: '', city: '', address: '', postalCode: '',
  email: '', phone: '', whatsapp: '',
  gender: '', dateOfBirth: '', nationality: '',
  bloodGroup: '', religion: '', cnicPassport: '',
  emergencyContact: '', emergencyPhone: '',
  teachingMode: '', availability: '',
  linkedin: '', facebook: '', instagram: '', youtube: '', website: '',
};

function Badge({ children, variant = 'default' }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent';
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    blocked: 'bg-gray-100 text-gray-800 border-gray-200',
    published: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-orange-100 text-orange-800 border-orange-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    not_submitted: 'bg-gray-100 text-gray-800 border-gray-200',
    changes_requested: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return <span className={`${base} ${variants[variant] || variants.default}`}>{children}</span>;
}

export default function AdminTeacherManagementSection() {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionTarget, setActionTarget] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [assigningTeacher, setAssigningTeacher] = useState(null);
  const [assigningCoursesTo, setAssigningCoursesTo] = useState(null);
  const [assignedCounts, setAssignedCounts] = useState({});
  const [assignRefreshKey, setAssignRefreshKey] = useState(0);

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (userStatusFilter) params.userStatus = userStatusFilter;
      const res = await teacherService.getAdminTeachers(params);
      setTeachers(res.data?.data || res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [searchQuery, userStatusFilter]);

  const loadStats = useCallback(async () => {
    try { const res = await teacherService.getTeacherStats(); setStats(res.data); } catch (_) { }
  }, []);

  useEffect(() => { loadTeachers(); loadStats(); }, [loadTeachers, loadStats]);

  // Load assigned student counts for all teachers in a single batch request
  const loadAssignedCounts = useCallback(async () => {
    try {
      const teacherIds = teachers.map((t) => t._id);
      if (teacherIds.length === 0) return;
      const res = await assignmentService.getTeacherAssignmentCounts(teacherIds);
      if (res && res.data) {
        setAssignedCounts(res.data);
      }
    } catch (_) { }
  }, [teachers]);

  useEffect(() => {
    if (teachers.length > 0) {
      loadAssignedCounts();
    }
  }, [teachers, loadAssignedCounts, assignRefreshKey]);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null); setError(null); setSuccess(null);
  }

  function startEdit(teacher) {
    setForm({
      fullName: teacher.fullName || '',
      shortBio: teacher.shortBio || '',
      biography: teacher.biography || '',
      qualification: teacher.qualification || '',
      degree: teacher.degree || '',
      experience: teacher.experience || 0,
      specialization: teacher.specialization || '',
      subjects: teacher.subjects || [],
      teachingLanguages: teacher.teachingLanguages || [],
      country: teacher.country || '',
      city: teacher.city || '',
      address: teacher.address || '',
      postalCode: teacher.postalCode || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      whatsapp: teacher.whatsapp || '',
      gender: teacher.gender || '',
      dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split('T')[0] : '',
      nationality: teacher.nationality || '',
      bloodGroup: teacher.bloodGroup || '',
      religion: teacher.religion || '',
      cnicPassport: teacher.cnicPassport || '',
      emergencyContact: teacher.emergencyContact || '',
      emergencyPhone: teacher.emergencyPhone || '',
      teachingMode: teacher.teachingMode || '',
      availability: teacher.availability || '',
      linkedin: teacher.linkedin || '',
      facebook: teacher.facebook || '',
      instagram: teacher.instagram || '',
      youtube: teacher.youtube || '',
      website: teacher.website || '',
    });
    setEditingId(teacher._id);
    setShowEditModal(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      setSaving(true);
      await teacherService.updateTeacher(editingId, form);
      setSuccess('Teacher updated successfully');
      resetForm();
      setShowEditModal(false);
      loadTeachers(); loadStats();
    } catch (err) { setError(err.message || 'Failed to save teacher'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this teacher record? It will be soft-deleted.')) return;
    try { await teacherService.deleteTeacher(id); setSuccess('Teacher deleted'); loadTeachers(); loadStats(); }
    catch (err) { setError(err.message); }
  }

  async function handlePublish(id) {
    try { setSaving(true); await teacherService.publishTeacher(id); setSuccess('Teacher published'); loadTeachers(); loadStats(); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  async function handleUnpublish(id) {
    try { setSaving(true); await teacherService.unpublishTeacher(id); setSuccess('Teacher unpublished'); loadTeachers(); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  // User-level actions
  function confirmAction(user, action) {
    setActionTarget(user);
    setActionType(action);
    setActionReason('');
    setShowActionModal(true);
    setError(null);
  }

  async function executeAction() {
    if (!actionTarget || !actionType) return;
    setSaving(true);
    try {
      const userId = actionTarget.user?._id || actionTarget._id;
      if (!userId) throw new Error('User ID not available');

      if (actionType === 'block') {
        await teacherService.blockUser(userId, actionReason || 'Blocked by admin');
        setSuccess(`Teacher has been blocked`);
      } else if (actionType === 'unblock') {
        await teacherService.unblockUser(userId);
        setSuccess(`Teacher has been unblocked`);
      } else if (actionType === 'activate_user') {
        await teacherService.activateUser(userId);
        setSuccess(`Teacher has been activated`);
      } else if (actionType === 'deactivate_user') {
        await teacherService.deactivateUser(userId, actionReason || 'Deactivated by admin');
        setSuccess(`Teacher has been deactivated`);
      }
      setShowActionModal(false);
      setActionTarget(null);
      setActionReason('');
      loadTeachers(); loadStats();
    } catch (err) { setError(err.message || `Failed to ${actionType} user`); }
    finally { setSaving(false); }
  }

  async function openAssignModal(teacher) {
    setAssignTarget(teacher);
    setSelectedCourseId('');
    setError(null);
    try {
      const res = await courseService.getAdminCourses({ status: 'published' });
      setAvailableCourses(res.data?.data || res.data || []);
      setShowAssignModal(true);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    }
  }

  async function handleAssignCourse() {
    if (!assignTarget || !selectedCourseId) return;
    setAssigning(true);
    setError(null);
    try {
      await teacherService.assignCourse(assignTarget._id, selectedCourseId);
      setSuccess(`Course assigned to teacher successfully`);
      setShowAssignModal(false);
      setAssignTarget(null);
      setSelectedCourseId('');
      loadTeachers();
    } catch (err) {
      setError(err.message || 'Failed to assign course');
    } finally {
      setAssigning(false);
    }
  }

  const badgeVariant = (user) => {
    const status = user?.status || 'pending';
    const map = { pending: 'pending', active: 'active', rejected: 'rejected', blocked: 'blocked' };
    return map[status] || 'default';
  };

  const verifVariant = (status) => {
    const map = { not_submitted: 'not_submitted', pending: 'pending', verified: 'verified', rejected: 'rejected', changes_requested: 'changes_requested' };
    return map[status] || 'default';
  };

  const teacherStatusVariant = (status) => {
    const map = { published: 'published', draft: 'draft', archived: 'default' };
    return map[status] || 'default';
  };

  const StatCard = ({ label, value, color }) => (
    <div className="bg-white rounded-xl border border-border-light p-4 hover:shadow-md transition-shadow">
      <p className="text-sm text-text-light">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-text-dark'}`}>{value ?? '-'}</p>
    </div>
  );

  const teacherStatusMap = {
    userStatus: Object.fromEntries(
      Object.entries(USER_STATUS_MAP).map(([k, v]) => [k, { label: v.label, variant: k }])
    ),
    verification: Object.fromEntries(
      Object.entries(VERIFICATION_STATUS_MAP).map(([k, v]) => [k, { label: v.label, variant: k }])
    ),
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
        {error}
      </div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        {success}
      </div>}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total Teachers" value={stats.totalUsers || stats.total} color="text-text-dark" />
          <StatCard label="Active" value={stats.activeUsers} color="text-green-600" />
          <StatCard label="Pending" value={stats.pendingUsers} color="text-yellow-600" />
          <StatCard label="Rejected" value={stats.rejectedUsers} color="text-red-600" />
          <StatCard label="Blocked" value={stats.blockedUsers} color="text-gray-600" />
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark">Teacher Management</h2>
              <p className="text-sm text-text-light mt-1">Manage all teacher accounts on the platform</p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="px-6 sm:px-8 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, qualification, specialization..."
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
              />
            </div>
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Teacher Table */}
        {loading ? (
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-text-light mt-4 text-sm">Loading teachers...</p>
            </div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-bg-light rounded-full flex items-center justify-center">
                <FiUser size={28} className="text-text-light" />
              </div>
              <h3 className="text-lg font-bold text-text-dark mb-1">No teachers found</h3>
              <p className="text-sm text-text-light max-w-md mx-auto">Teachers will appear here after they sign up and register on the platform.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-t border-b-2 border-border-light">
                  <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Teacher</th>
                  <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden md:table-cell">Qualification</th>
                  <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden sm:table-cell">Specialization</th>
                  <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden lg:table-cell">Approval</th>
                  <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden lg:table-cell">Verified</th>
                  <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden lg:table-cell">Courses</th>
                  <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden xl:table-cell">Students</th>
                  <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {teachers.map((teacher) => {
                  const user = teacher.user || {};
                  const isBlocked = user.status === 'blocked';
                  const isActive = user.status === 'active';
                  const isPublished = teacher.status === 'published';

                  const dropdownActions = [
                    {
                      label: 'View Details',
                      icon: FiEye,
                      onClick: () => setViewingTeacher(teacher),
                    },
                    {
                      label: 'Edit Teacher',
                      icon: FiEdit2,
                      onClick: () => startEdit(teacher),
                    },
                    {
                      label: 'Assign Course',
                      icon: FiBook,
                      onClick: () => openAssignModal(teacher),
                    },
                    {
                      label: 'Assign Courses',
                      icon: FiBookOpen,
                      onClick: () => setAssigningCoursesTo(teacher),
                    },
                    { divider: true },
                    {
                      label: 'Assign Students',
                      icon: FiUsers,
                      onClick: () => setAssigningTeacher(teacher),
                    },
                    { divider: true },
                    ...(isPublished
                      ? [{
                        label: 'Unpublish',
                        icon: FiDownload,
                        warning: true,
                        onClick: () => handleUnpublish(teacher._id),
                      }]
                      : [{
                        label: 'Publish',
                        icon: FiUpload,
                        success: true,
                        onClick: () => handlePublish(teacher._id),
                      }]
                    ),
                    { divider: true },
                    ...(isActive
                      ? [{
                        label: 'Deactivate',
                        icon: FiToggleRight,
                        warning: true,
                        onClick: () => confirmAction(teacher, 'deactivate_user'),
                      }]
                      : [{
                        label: 'Activate',
                        icon: FiToggleLeft,
                        success: true,
                        onClick: () => confirmAction(teacher, 'activate_user'),
                      }]
                    ),
                    ...(isBlocked
                      ? [{
                        label: 'Unblock',
                        icon: FiUnlock,
                        success: true,
                        onClick: () => confirmAction(teacher, 'unblock'),
                      }]
                      : [{
                        label: 'Block',
                        icon: FiLock,
                        warning: true,
                        onClick: () => confirmAction(teacher, 'block'),
                      }]
                    ),
                    { divider: true },
                    {
                      label: 'Delete',
                      icon: FiTrash2,
                      danger: true,
                      onClick: () => handleDelete(teacher._id),
                    },
                  ];

                  return (
                    <tr key={teacher._id} className="hover:bg-bg-light/80 transition-colors duration-150">
                      <td className="px-4 sm:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {teacher.profilePhoto ? (
                            <img src={teacher.profilePhoto} alt="" className="w-9 h-9 rounded-full object-cover border border-border-light flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                              {teacher.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-text-dark text-sm truncate">
                              {teacher.fullName}
                              {teacher.featured && <FiStar className="ml-1 text-yellow-500 inline-block" size={12} />}
                            </p>
                            <p className="text-xs text-text-light truncate">{teacher.country || teacher.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-sm text-text-body hidden md:table-cell">{teacher.qualification || '-'}</td>
                      <td className="px-4 sm:px-6 py-3.5 text-sm text-text-body hidden sm:table-cell">{teacher.specialization || '-'}</td>
                      <td className="px-4 sm:px-6 py-3.5 text-center hidden lg:table-cell">
                        <Badge variant={badgeVariant(user)}>{USER_STATUS_MAP[user?.status]?.label || 'Pending'}</Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-center hidden lg:table-cell">
                        <Badge variant={verifVariant(user.profileVerificationStatus)}>{VERIFICATION_STATUS_MAP[user.profileVerificationStatus]?.label || 'Not Submitted'}</Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-center hidden lg:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${(teacher.assignedCourses?.length || 0) > 0
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          <FiBookOpen size={12} />
                          {teacher.assignedCourses?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-center hidden xl:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${(assignedCounts[teacher._id] || 0) > 0
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          <FiUsers size={12} />
                          {assignedCounts[teacher._id] || 0}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5">
                        <div className="flex items-center justify-center">
                          <ActionDropdown actions={dropdownActions} align="right" />
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

      {/* Teacher Detail Modal - rendered via Portal to escape admin layout stacking context */}
      {viewingTeacher && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 pt-6 sm:pt-10 pb-6 sm:pb-10 overflow-y-auto"
          onClick={() => setViewingTeacher(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 w-full max-w-4xl mx-3 sm:mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between  sm:mb-6 sticky -top-8 bg-white p-3 z-100 border-b border-border-light/50">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-text-dark">Teacher Details</h3>
              <button onClick={() => setViewingTeacher(null)}
                className="w-8 h-8 rounded-xl bg-bg-light hover:bg-border-light text-text-light hover:text-text-dark flex items-center justify-center transition-colors text-lg">&times;</button>
            </div>
            <AdminDetailView entity={viewingTeacher} type="teacher" statusMaps={teacherStatusMap} />
          </div>
        </div>,
        document.body
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 pb-10 overflow-y-auto"
          onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-3xl mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-dark">Edit Teacher</h3>
              <button onClick={() => { setShowEditModal(false); resetForm(); }}
                className="text-text-light hover:text-text-dark text-xl">&times;</button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-text-dark">Personal Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Full Name *</label>
                    <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Gender</label>
                      <select name="gender" value={form.gender} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Nationality</label>
                      <input type="text" name="nationality" value={form.nationality} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Religion</label>
                      <input type="text" name="religion" value={form.religion} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Blood Group</label>
                      <input type="text" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">CNIC/Passport</label>
                      <input type="text" name="cnicPassport" value={form.cnicPassport} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Country</label>
                      <input type="text" name="country" value={form.country} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">City</label>
                      <input type="text" name="city" value={form.city} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Address</label>
                    <textarea name="address" value={form.address} onChange={handleChange} rows={2}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Postal Code</label>
                    <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                  </div>

                  <h3 className="font-heading font-semibold text-text-dark pt-2">Contact</h3>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Phone</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">WhatsApp</label>
                      <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Emergency Contact</label>
                      <input type="text" name="emergencyContact" value={form.emergencyContact} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Emergency Phone</label>
                      <input type="tel" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>

                  <h3 className="font-heading font-semibold text-text-dark pt-2">Professional</h3>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Short Bio</label>
                    <textarea name="shortBio" value={form.shortBio} onChange={handleChange} rows={2}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Biography</label>
                    <textarea name="biography" value={form.biography} onChange={handleChange} rows={4}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-text-dark">Qualifications & Skills</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Qualification</label>
                      <input type="text" name="qualification" value={form.qualification} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Degree</label>
                      <input type="text" name="degree" value={form.degree} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Experience (Years)</label>
                      <input type="number" name="experience" value={form.experience} onChange={handleChange} min={0} max={70}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Specialization</label>
                      <input type="text" name="specialization" value={form.specialization} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Teaching Mode</label>
                    <select name="teachingMode" value={form.teachingMode} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                      <option value="">Select mode</option>
                      <option value="online">Online</option>
                      <option value="physical">Physical</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Availability</label>
                    <input type="text" name="availability" value={form.availability} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                  </div>

                  <h3 className="font-heading font-semibold text-text-dark pt-2">Social Links</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">LinkedIn</label>
                      <input type="url" name="linkedin" value={form.linkedin} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Facebook</label>
                      <input type="url" name="facebook" value={form.facebook} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Instagram</label>
                      <input type="url" name="instagram" value={form.instagram} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">YouTube</label>
                      <input type="url" name="youtube" value={form.youtube} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Website</label>
                    <input type="url" name="website" value={form.website} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-border-light">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Update Teacher'}
                </button>
                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="px-6 py-2.5 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Courses Modal */}
      {assigningCoursesTo && (
        <AdminTeacherCourseAssignment
          teacher={assigningCoursesTo}
          onClose={() => {
            setAssigningCoursesTo(null);
            loadTeachers();
          }}
          onSuccess={() => {
            setAssignRefreshKey(k => k + 1);
          }}
        />
      )}

      {/* Assign Students Modal */}
      {assigningTeacher && (
        <AdminAssignmentSection
          teacher={assigningTeacher}
          onClose={() => {
            setAssigningTeacher(null);
            loadTeachers();
            setAssignRefreshKey(k => k + 1);
            // Directly reload counts immediately instead of relying on useEffect chain
            const ids = teachers.map((t) => t._id);
            if (ids.length > 0) {
              assignmentService.getTeacherAssignmentCounts(ids)
                .then(res => { if (res && res.data) setAssignedCounts(res.data); })
                .catch(() => { });
            }
          }}
        />
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { setShowActionModal(false); setActionTarget(null); setError(null); }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-bold text-text-dark capitalize">
                {actionType === 'block' ? 'Block Teacher' :
                  actionType === 'unblock' ? 'Unblock Teacher' :
                    actionType === 'activate_user' ? 'Activate Teacher' :
                      actionType === 'deactivate_user' ? 'Deactivate Teacher' : ''}
              </h3>
              <button onClick={() => { setShowActionModal(false); setActionTarget(null); setError(null); }}
                className="text-text-light hover:text-text-dark text-xl">&times;</button>
            </div>
            <p className="text-sm text-text-body mb-4">
              {actionType === 'block' ? `Are you sure you want to block ${actionTarget?.fullName || 'this teacher'}? They will not be able to log in.` :
                actionType === 'unblock' ? `Are you sure you want to unblock ${actionTarget?.fullName || 'this teacher'}?` :
                  actionType === 'activate_user' ? `Are you sure you want to activate ${actionTarget?.fullName || 'this teacher'}?` :
                    actionType === 'deactivate_user' ? `Are you sure you want to deactivate ${actionTarget?.fullName || 'this teacher'}? They will not be able to access their account.` : ''}
            </p>
            {(actionType === 'block' || actionType === 'deactivate_user') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-dark mb-1">Reason (optional)</label>
                <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} rows={2}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder={`Reason for ${actionType}...`} />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={executeAction} disabled={saving}
                className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 ${actionType === 'block' || actionType === 'deactivate_user'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}>
                {saving ? 'Processing...' : 'Confirm'}
              </button>
              <button onClick={() => { setShowActionModal(false); setActionTarget(null); setError(null); }}
                className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Course Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { setShowAssignModal(false); setAssignTarget(null); setError(null); }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-bold text-text-dark">Assign Course</h3>
              <button onClick={() => { setShowAssignModal(false); setAssignTarget(null); setError(null); }}
                className="text-text-light hover:text-text-dark text-xl">&times;</button>
            </div>
            <p className="text-sm text-text-body mb-4">
              Assign a course to <strong>{assignTarget?.fullName || 'this teacher'}</strong>:
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-dark mb-1">Course</label>
              <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                <option value="">Select a course...</option>
                {availableCourses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAssignCourse} disabled={assigning || !selectedCourseId}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors">
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
              <button onClick={() => { setShowAssignModal(false); setAssignTarget(null); setError(null); }}
                className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
