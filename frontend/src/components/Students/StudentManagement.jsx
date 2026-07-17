import { useState, useEffect, useCallback } from 'react';
import studentService from '../../services/studentService';
import ActionDropdown from '../common/ActionDropdown';
import AdminDetailView from '../common/AdminDetailView';
import { FiEye, FiEdit2, FiLock, FiUnlock, FiToggleLeft, FiToggleRight, FiTrash2, FiUser } from 'react-icons/fi';

const USER_STATUS_MAP = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  blocked: { label: 'Blocked', color: 'bg-gray-100 text-gray-800' },
};

const STUDENT_STATUS_MAP = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactive', color: 'bg-orange-100 text-orange-800' },
  graduated: { label: 'Graduated', color: 'bg-blue-100 text-blue-800' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-800' },
  transferred: { label: 'Transferred', color: 'bg-purple-100 text-purple-800' },
};

const VERIFICATION_STATUS_MAP = {
  not_submitted: { label: 'Not Submitted', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  changes_requested: { label: 'Changes Requested', color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

const defaultForm = {
  studentName: '', fatherName: '', motherName: '', guardianName: '',
  guardianRelation: '', gender: '', dateOfBirth: '',
  email: '', phone: '', whatsapp: '',
  country: '', city: '', address: '', postalCode: '',
  nationality: '', religion: '', bloodGroup: '',
  cnicPassport: '', emergencyContact: '', emergencyPhone: '',
  guardianPhone: '', guardianEmail: '',
  previousEducation: '', currentQualification: '',
  bio: '', languages: [], skills: [],
};

function Badge({ children, variant = 'default' }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent';
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    blocked: 'bg-gray-100 text-gray-800 border-gray-200',
    inactive: 'bg-orange-100 text-orange-800 border-orange-200',
    graduated: 'bg-blue-100 text-blue-800 border-blue-200',
    suspended: 'bg-red-100 text-red-800 border-red-200',
    transferred: 'bg-purple-100 text-purple-800 border-purple-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    not_submitted: 'bg-gray-100 text-gray-800 border-gray-200',
    changes_requested: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return <span className={`${base} ${variants[variant] || variants.default}`}>{children}</span>;
}

export default function AdminStudentManagementSection() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [viewingStudent, setViewingStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionTarget, setActionTarget] = useState(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (userStatusFilter) params.userStatus = userStatusFilter;
      const res = await studentService.getAdminStudents(params);
      setStudents(res.data?.data || res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [searchQuery, userStatusFilter]);

  const loadStats = useCallback(async () => {
    try { const res = await studentService.getStudentStats(); setStats(res.data); } catch (_) {}
  }, []);

  useEffect(() => { loadStudents(); loadStats(); }, [loadStudents, loadStats]);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null); setError(null); setSuccess(null);
  }

  function startEdit(student) {
    setForm({
      studentName: student.studentName || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      guardianName: student.guardianName || '',
      guardianRelation: student.guardianRelation || '',
      gender: student.gender || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      email: student.email || '',
      phone: student.phone || '',
      whatsapp: student.whatsapp || '',
      country: student.country || '',
      city: student.city || '',
      address: student.address || '',
      postalCode: student.postalCode || '',
      nationality: student.nationality || '',
      religion: student.religion || '',
      bloodGroup: student.bloodGroup || '',
      cnicPassport: student.cnicPassport || '',
      emergencyContact: student.emergencyContact || '',
      emergencyPhone: student.emergencyPhone || '',
      guardianPhone: student.guardianPhone || '',
      guardianEmail: student.guardianEmail || '',
      previousEducation: student.previousEducation || '',
      currentQualification: student.currentQualification || '',
      bio: student.bio || '',
      languages: student.languages || [],
      skills: student.skills || [],
    });
    setEditingId(student._id);
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
      await studentService.updateStudent(editingId, form);
      setSuccess('Student updated successfully');
      resetForm();
      setShowEditModal(false);
      loadStudents(); loadStats();
    } catch (err) { setError(err.message || 'Failed to save student'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this student record? This will soft-delete the profile.')) return;
    try { await studentService.deleteStudent(id); setSuccess('Student deleted'); loadStudents(); loadStats(); }
    catch (err) { setError(err.message); }
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
        await studentService.blockUser(userId, actionReason || 'Blocked by admin');
        setSuccess(`Student has been blocked`);
      } else if (actionType === 'unblock') {
        await studentService.unblockUser(userId);
        setSuccess(`Student has been unblocked`);
      } else if (actionType === 'activate_user') {
        await studentService.activateUser(userId);
        setSuccess(`Student has been activated`);
      } else if (actionType === 'deactivate_user') {
        await studentService.deactivateUser(userId, actionReason || 'Deactivated by admin');
        setSuccess(`Student has been deactivated`);
      }
      setShowActionModal(false);
      setActionTarget(null);
      setActionReason('');
      loadStudents(); loadStats();
    } catch (err) { setError(err.message || `Failed to ${actionType} user`); }
    finally { setSaving(false); }
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

  const studentBadgeVariant = (status) => {
    const map = { active: 'active', inactive: 'inactive', graduated: 'graduated', suspended: 'suspended', transferred: 'transferred' };
    return map[status] || 'default';
  };

  const StatCard = ({ label, value, color }) => (
    <div className="bg-white rounded-xl border border-border-light p-4 hover:shadow-md transition-shadow">
      <p className="text-sm text-text-light">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-text-dark'}`}>{value ?? '-'}</p>
    </div>
  );

  const studentStatusMap = {
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
          <StatCard label="Total Students" value={stats.totalUsers || stats.total} color="text-text-dark" />
          <StatCard label="Active" value={stats.activeUsers ?? stats.active} color="text-green-600" />
          <StatCard label="Pending" value={stats.pendingUsers ?? 0} color="text-yellow-600" />
          <StatCard label="Rejected" value={stats.rejectedUsers ?? 0} color="text-red-600" />
          <StatCard label="Blocked" value={stats.blockedUsers ?? 0} color="text-gray-600" />
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-dark">Student Management</h2>
              <p className="text-sm text-text-light mt-1">Manage all student accounts on the platform</p>
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
                placeholder="Search by name, ID, email, phone..."
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

        {/* Student Table */}
        {loading ? (
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-text-light mt-4 text-sm">Loading students...</p>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-bg-light rounded-full flex items-center justify-center">
                <FiUser size={28} className="text-text-light" />
              </div>
              <h3 className="text-lg font-bold text-text-dark mb-1">No students found</h3>
              <p className="text-sm text-text-light max-w-md mx-auto">Students will appear here after they sign up and register on the platform.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-t border-b-2 border-border-light">
                  <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden lg:table-cell">Approval</th>
                  <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden lg:table-cell">Verified</th>
                  <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider hidden sm:table-cell">Profile</th>
                  <th className="text-center px-4 sm:px-6 py-3.5 font-semibold text-text-dark text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {students.map((student) => {
                  const user = student.user || {};
                  const isBlocked = user.status === 'blocked';
                  const isActive = user.status === 'active';

                  const dropdownActions = [
                    {
                      label: 'View Details',
                      icon: FiEye,
                      onClick: () => setViewingStudent(student),
                    },
                    {
                      label: 'Edit Student',
                      icon: FiEdit2,
                      onClick: () => startEdit(student),
                    },
                    { divider: true },
                    ...(isActive
                      ? [{
                          label: 'Deactivate',
                          icon: FiToggleRight,
                          warning: true,
                          onClick: () => confirmAction(student, 'deactivate_user'),
                        }]
                      : [{
                          label: 'Activate',
                          icon: FiToggleLeft,
                          success: true,
                          onClick: () => confirmAction(student, 'activate_user'),
                        }]
                    ),
                    ...(isBlocked
                      ? [{
                          label: 'Unblock',
                          icon: FiUnlock,
                          success: true,
                          onClick: () => confirmAction(student, 'unblock'),
                        }]
                      : [{
                          label: 'Block',
                          icon: FiLock,
                          warning: true,
                          onClick: () => confirmAction(student, 'block'),
                        }]
                    ),
                    { divider: true },
                    {
                      label: 'Delete',
                      icon: FiTrash2,
                      danger: true,
                      onClick: () => handleDelete(student._id),
                    },
                  ];

                  return (
                    <tr key={student._id} className="hover:bg-bg-light/80 transition-colors duration-150">
                      <td className="px-4 sm:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                            {student.studentName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-text-dark text-sm truncate">{student.studentName}</p>
                            <p className="text-xs text-text-light truncate">{student.fatherName ? `s/o ${student.fatherName}` : student.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-sm text-text-body hidden md:table-cell">
                        <div className="truncate max-w-[180px]">{student.email || '-'}</div>
                        <div className="text-xs text-text-light">{student.phone || ''}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-center hidden lg:table-cell">
                        <Badge variant={badgeVariant(user)}>{USER_STATUS_MAP[user?.status]?.label || 'Pending'}</Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-center hidden lg:table-cell">
                        <Badge variant={verifVariant(user.profileVerificationStatus)}>{VERIFICATION_STATUS_MAP[user.profileVerificationStatus]?.label || 'Not Submitted'}</Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          {user.completionPercentage ? `${user.completionPercentage}%` : (user.profileComplete ? '100%' : '0%')}
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

      {/* Student Detail Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 pb-10 overflow-y-auto"
          onClick={() => setViewingStudent(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-3xl mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-dark">Student Details</h3>
              <button onClick={() => setViewingStudent(null)}
                className="text-text-light hover:text-text-dark text-xl">&times;</button>
            </div>
            <AdminDetailView entity={viewingStudent} type="student" statusMaps={studentStatusMap} />
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 pb-10 overflow-y-auto"
          onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-3xl mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-dark">Edit Student</h3>
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
                    <label className="block text-sm font-medium text-text-dark mb-1">Student Name *</label>
                    <input type="text" name="studentName" value={form.studentName} onChange={handleChange} required
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Father Name</label>
                      <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Mother Name</label>
                      <input type="text" name="motherName" value={form.motherName} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Guardian Name</label>
                      <input type="text" name="guardianName" value={form.guardianName} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Guardian Relation</label>
                      <input type="text" name="guardianRelation" value={form.guardianRelation} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Gender *</label>
                      <select name="gender" value={form.gender} onChange={handleChange} required
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Date of Birth *</label>
                      <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required
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
                      <label className="block text-sm font-medium text-text-dark mb-1">Phone *</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} required
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
                      <label className="block text-sm font-medium text-text-dark mb-1">Guardian Phone</label>
                      <input type="tel" name="guardianPhone" value={form.guardianPhone} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Guardian Email</label>
                      <input type="email" name="guardianEmail" value={form.guardianEmail} onChange={handleChange}
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
                </div>

                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-text-dark">Education & Career</h3>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Previous Education</label>
                    <textarea name="previousEducation" value={form.previousEducation} onChange={handleChange} rows={2}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Current Qualification</label>
                    <textarea name="currentQualification" value={form.currentQualification} onChange={handleChange} rows={2}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Languages</label>
                    <input type="text" name="languages" value={form.languages} onChange={handleChange}
                      placeholder="Comma-separated languages"
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Skills</label>
                    <input type="text" name="skills" value={form.skills} onChange={handleChange}
                      placeholder="Comma-separated skills"
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Bio</label>
                    <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                      className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-border-light">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Update Student'}
                </button>
                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="px-6 py-2.5 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { setShowActionModal(false); setActionTarget(null); setError(null); }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-bold text-text-dark capitalize">
                {actionType === 'block' ? 'Block Student' :
                 actionType === 'unblock' ? 'Unblock Student' :
                 actionType === 'activate_user' ? 'Activate Student' :
                 actionType === 'deactivate_user' ? 'Deactivate Student' : ''}
              </h3>
              <button onClick={() => { setShowActionModal(false); setActionTarget(null); setError(null); }}
                className="text-text-light hover:text-text-dark text-xl">&times;</button>
            </div>
            <p className="text-sm text-text-body mb-4">
              {actionType === 'block' ? `Are you sure you want to block ${actionTarget?.studentName || actionTarget?.fullName || 'this user'}? They will not be able to log in.` :
               actionType === 'unblock' ? `Are you sure you want to unblock ${actionTarget?.studentName || actionTarget?.fullName || 'this user'}?` :
               actionType === 'activate_user' ? `Are you sure you want to activate ${actionTarget?.studentName || actionTarget?.fullName || 'this user'}?` :
               actionType === 'deactivate_user' ? `Are you sure you want to deactivate ${actionTarget?.studentName || actionTarget?.fullName || 'this user'}? They will not be able to access their account.` : ''}
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
                className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                  actionType === 'block' || actionType === 'deactivate_user'
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
    </div>
  );
}
