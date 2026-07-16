import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { adminDashboardData } from '../../data/adminDashboardData';
import { FiUsers, FiUser, FiSettings } from 'react-icons/fi';

const ROLE_LABELS = {
  student: 'Student',
  teacher: 'Teacher',
};

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-800 border-blue-200',
  teacher: 'bg-purple-100 text-purple-800 border-purple-200',
};

const ROLE_ICONS = {
  student: '🎓',
  teacher: '👨‍🏫',
};

const dashboardStatCards = [
  { id: 1, name: 'Students', count: adminDashboardData.dashboard.statistics.totalStudents, icon: FiUsers },
  { id: 2, name: 'Teachers', count: adminDashboardData.dashboard.statistics.totalTeachers, icon: FiUser },
  { id: 3, name: 'Admins', count: 3, icon: FiSettings },
];

export default function AdminUserManagementSection() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ pendingStudents: 0, pendingTeachers: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingUsers = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', p);
      queryParams.set('limit', 20);
      if (search) queryParams.set('search', search);
      if (roleFilter) queryParams.set('role', roleFilter);

      const res = await api.get(`/admin/pending-users?${queryParams.toString()}`);
      const responseData = res?.data || res;

      if (responseData?.users) {
        setUsers(responseData.users);
        setPage(responseData.pagination?.page || 1);
        setTotalPages(responseData.pagination?.totalPages || 1);
        setTotal(responseData.pagination?.total || 0);
      }
      if (responseData?.stats) {
        setStats(responseData.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchPendingUsers(page);
  }, [page, fetchPendingUsers]);

  // When search or roleFilter changes, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleApprove = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/approve-user/${selectedUser._id}`);
      setSuccessMsg(`✓ ${selectedUser.fullName} (${ROLE_LABELS[selectedUser.role]}) has been approved successfully`);
      setShowApproveModal(false);
      setSelectedUser(null);
      fetchPendingUsers(page);
    } catch (err) {
      setError(err.message || 'Failed to approve user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/admin/reject-user/${selectedUser._id}`, { reason: rejectionReason.trim() });
      setSuccessMsg(`✗ ${selectedUser.fullName} (${ROLE_LABELS[selectedUser.role]}) has been rejected`);
      setShowRejectModal(false);
      setSelectedUser(null);
      setRejectionReason('');
      fetchPendingUsers(page);
    } catch (err) {
      setError(err.message || 'Failed to reject user');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const openApproveModal = (user) => {
    setSelectedUser(user);
    setShowApproveModal(true);
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const closeAllModals = () => {
    setShowDetailModal(false);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedUser(null);
    setRejectionReason('');
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Overview Cards */}
      <div>
        <h2 className="font-heading text-xl font-bold text-text-dark mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {dashboardStatCards.map((card) => (
            <div
              key={card.id}
              className="p-6 border-2 border-border-light rounded-xl hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="p-3 bg-primary/10 text-primary rounded-xl"><card.icon size={28} /></span>
                <div>
                  <p className="text-sm text-text-light">{card.name}</p>
                  <p className="text-2xl font-bold text-primary">{card.count}</p>
                </div>
              </div>
              <span className="text-5xl opacity-20">🎓</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-dark">Pending User Management</h1>
        <p className="text-text-light mt-1">Review and manage pending student and teacher registrations</p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-medium animate-fade-in flex items-center gap-3">
          <span className="text-emerald-500 text-lg">✓</span>
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium animate-fade-in flex items-center gap-3">
          <span className="text-red-500 text-lg">⚠</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Pending Users Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Pending Students</p>
              <p className="text-3xl font-bold mt-2">{stats.pendingStudents}</p>
            </div>
            <span className="text-5xl opacity-20">🎓</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Pending Teachers</p>
              <p className="text-3xl font-bold mt-2">{stats.pendingTeachers}</p>
            </div>
            <span className="text-5xl opacity-20">👨‍🏫</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Total Pending</p>
              <p className="text-3xl font-bold mt-2">{stats.totalPending}</p>
            </div>
            <span className="text-5xl opacity-20">⏳</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex rounded-xl border border-border-light overflow-hidden">
            {[
              { value: '', label: 'All', icon: '📋' },
              { value: 'student', label: 'Students', icon: '🎓' },
              { value: 'teacher', label: 'Teachers', icon: '👨‍🏫' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value)}
                className={`px-4 py-3 text-sm font-semibold transition-all flex items-center gap-2 ${
                  roleFilter === tab.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-body hover:bg-bg-light'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-text-light mt-4">Loading pending users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4">✅</span>
            <h3 className="text-xl font-bold text-text-dark mb-2">All Clear!</h3>
            <p className="text-text-light">No pending users to review at this time.</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-border-light">
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">User</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Email</th>
                    <th className="text-center p-3 font-semibold text-text-dark text-sm">Role</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Location</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Registered</th>
                    <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-bg-light transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-text-dark text-sm">{user.fullName || 'N/A'}</p>
                            <p className="text-xs text-text-light capitalize">{user.gender || 'Not specified'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-text-body">{user.email}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'}`}>
                          {ROLE_ICONS[user.role] || '📌'} {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-text-body">
                        {[user.city, user.country].filter(Boolean).join(', ') || 'N/A'}
                      </td>
                      <td className="p-3 text-sm text-text-body">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }) : 'N/A'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openApproveModal(user)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openRejectModal(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
                <p className="text-sm text-text-light">
                  Showing {users.length} of {total} pending user{total !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 border border-border-light rounded-lg text-sm font-semibold hover:bg-bg-light disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const start = Math.max(1, page - 2);
                    const pageNum = start + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                          pageNum === page
                            ? 'bg-primary text-white'
                            : 'border border-border-light text-text-body hover:bg-bg-light'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 border border-border-light rounded-lg text-sm font-semibold hover:bg-bg-light disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* === DETAIL MODAL === */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeAllModals}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-bold text-text-dark">User Details</h2>
                <button onClick={closeAllModals} className="p-2 hover:bg-bg-light rounded-xl transition-colors">
                  <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-dark">{selectedUser.fullName}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border mt-1 ${ROLE_COLORS[selectedUser.role] || 'bg-gray-100 text-gray-800'}`}>
                    {ROLE_ICONS[selectedUser.role] || '📌'} {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg-light rounded-xl">
                  <p className="text-xs text-text-light font-medium uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-text-dark mt-1 break-all">{selectedUser.email}</p>
                </div>
                <div className="p-4 bg-bg-light rounded-xl">
                  <p className="text-xs text-text-light font-medium uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-text-dark mt-1">{selectedUser.phone || 'Not provided'}</p>
                </div>
                <div className="p-4 bg-bg-light rounded-xl">
                  <p className="text-xs text-text-light font-medium uppercase tracking-wider">Gender</p>
                  <p className="text-sm font-semibold text-text-dark mt-1 capitalize">{selectedUser.gender || 'Not specified'}</p>
                </div>
                <div className="p-4 bg-bg-light rounded-xl">
                  <p className="text-xs text-text-light font-medium uppercase tracking-wider">Status</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Pending</span>
                </div>
                <div className="p-4 bg-bg-light rounded-xl">
                  <p className="text-xs text-text-light font-medium uppercase tracking-wider">City</p>
                  <p className="text-sm font-semibold text-text-dark mt-1">{selectedUser.city || 'Not provided'}</p>
                </div>
                <div className="p-4 bg-bg-light rounded-xl">
                  <p className="text-xs text-text-light font-medium uppercase tracking-wider">Country</p>
                  <p className="text-sm font-semibold text-text-dark mt-1">{selectedUser.country || 'Not provided'}</p>
                </div>
              </div>

              <div className="p-4 bg-bg-light rounded-xl">
                <p className="text-xs text-text-light font-medium uppercase tracking-wider">Registered On</p>
                <p className="text-sm font-semibold text-text-dark mt-1">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 sm:p-8 border-t border-border-light flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setShowDetailModal(false); openApproveModal(selectedUser); }}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => { setShowDetailModal(false); openRejectModal(selectedUser); }}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                ✗ Reject
              </button>
              <button
                onClick={closeAllModals}
                className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === APPROVE MODAL === */}
      {showApproveModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeAllModals}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-2">Approve User</h2>
              <p className="text-text-body mb-2">
                Are you sure you want to approve <strong>{selectedUser.fullName}</strong>?
              </p>
              <p className="text-sm text-text-light mb-6">
                They will gain access as a <strong>{ROLE_LABELS[selectedUser.role]}</strong> and receive an approval notification via email.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Approving...' : '✓ Confirm Approval'}
                </button>
                <button
                  onClick={closeAllModals}
                  className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === REJECT MODAL === */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeAllModals}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-2 text-center">Reject User</h2>
              <p className="text-text-body text-center mb-6">
                Reject <strong>{selectedUser.fullName}</strong> ({ROLE_LABELS[selectedUser.role]})
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-text-dark mb-2.5">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                />
                <p className="text-xs text-text-light mt-1.5">
                  This reason will be included in the rejection email sent to the user.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Rejecting...' : '✗ Confirm Rejection'}
                </button>
                <button
                  onClick={closeAllModals}
                  className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
