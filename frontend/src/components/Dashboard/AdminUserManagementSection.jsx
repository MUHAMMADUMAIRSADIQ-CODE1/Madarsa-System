import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { adminDashboardData } from '../../data/adminDashboardData';
import { FiUsers, FiUser, FiSettings, FiAward, FiUserCheck, FiClipboard, FiList, FiCheck, FiCheckCircle, FiX, FiXCircle, FiClock, FiAlertTriangle, FiBookmark, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ROLE_LABELS = {
  student: 'Student',
  teacher: 'Teacher',
};

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-800 border-blue-200',
  teacher: 'bg-purple-100 text-purple-800 border-purple-200',
};

const ROLE_ICONS = {
  student: FiAward,
  teacher: FiUserCheck,
};

const RoleBadgeIcon = ({ role, className = '' }) => {
  const Icon = ROLE_ICONS[role] || FiBookmark;
  return <Icon className={className} />;
};

const TABS = [
  { id: 'pending', label: 'Pending', icon: FiClock },
  { id: 'rejected', label: 'Rejected', icon: FiXCircle },
];

const dashboardStatCards = [
  { id: 1, name: 'Students', count: adminDashboardData.dashboard.statistics.totalStudents, icon: FiUsers },
  { id: 2, name: 'Teachers', count: adminDashboardData.dashboard.statistics.totalTeachers, icon: FiUser },
  { id: 3, name: 'Admins', count: 3, icon: FiSettings },
];

export default function AdminUserManagementSection() {
  const [activeTab, setActiveTab] = useState('pending');

  // Pending users state
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingStats, setPendingStats] = useState({ pendingStudents: 0, pendingTeachers: 0, totalPending: 0 });
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingRoleFilter, setPendingRoleFilter] = useState('');
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);

  // Rejected users state
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [rejectedStats, setRejectedStats] = useState({ rejectedStudents: 0, rejectedTeachers: 0, totalRejected: 0 });
  const [rejectedLoading, setRejectedLoading] = useState(true);
  const [rejectedSearch, setRejectedSearch] = useState('');
  const [rejectedRoleFilter, setRejectedRoleFilter] = useState('');
  const [rejectedPage, setRejectedPage] = useState(1);
  const [rejectedTotalPages, setRejectedTotalPages] = useState(1);
  const [rejectedTotal, setRejectedTotal] = useState(0);



  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReApproveModal, setShowReApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch pending users
  const fetchPendingUsers = useCallback(async (p = 1) => {
    setPendingLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', p);
      queryParams.set('limit', 20);
      if (pendingSearch) queryParams.set('search', pendingSearch);
      if (pendingRoleFilter) queryParams.set('role', pendingRoleFilter);

      const res = await api.get(`/admin/pending-users?${queryParams.toString()}`);
      const responseData = res?.data || res;

      if (responseData?.users) {
        setPendingUsers(responseData.users);
        setPendingPage(responseData.pagination?.page || 1);
        setPendingTotalPages(responseData.pagination?.totalPages || 1);
        setPendingTotal(responseData.pagination?.total || 0);
      }
      if (responseData?.stats) {
        setPendingStats(responseData.stats);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch pending users');
    } finally {
      setPendingLoading(false);
    }
  }, [pendingSearch, pendingRoleFilter]);

  // Fetch rejected users
  const fetchRejectedUsers = useCallback(async (p = 1) => {
    setRejectedLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', p);
      queryParams.set('limit', 20);
      if (rejectedSearch) queryParams.set('search', rejectedSearch);
      if (rejectedRoleFilter) queryParams.set('role', rejectedRoleFilter);

      const res = await api.get(`/admin/rejected-users?${queryParams.toString()}`);
      const responseData = res?.data || res;

      if (responseData?.users) {
        setRejectedUsers(responseData.users);
        setRejectedPage(responseData.pagination?.page || 1);
        setRejectedTotalPages(responseData.pagination?.totalPages || 1);
        setRejectedTotal(responseData.pagination?.total || 0);
      }
      if (responseData?.stats) {
        setRejectedStats(responseData.stats);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch rejected users');
    } finally {
      setRejectedLoading(false);
    }
  }, [rejectedSearch, rejectedRoleFilter]);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingUsers(pendingPage);
    } else {
      fetchRejectedUsers(rejectedPage);
    }
  }, [activeTab, pendingPage, rejectedPage, fetchPendingUsers, fetchRejectedUsers]);

  // Reset page when search or filter changes
  useEffect(() => {
    if (activeTab === 'pending') {
      setPendingPage(1);
    } else {
      setRejectedPage(1);
    }
  }, [pendingSearch, pendingRoleFilter, rejectedSearch, rejectedRoleFilter, activeTab]);

  const handleApprove = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/approve-user/${selectedUser._id}`);
      toast.success(`${selectedUser.fullName} (${ROLE_LABELS[selectedUser.role]}) has been approved successfully`);
      closeAllModals();
      fetchPendingUsers(pendingPage);
    } catch (err) {
      toast.error(err.message || 'Failed to approve user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/admin/reject-user/${selectedUser._id}`, { reason: rejectionReason.trim() });
      toast.success(`${selectedUser.fullName} (${ROLE_LABELS[selectedUser.role]}) has been rejected`);
      closeAllModals();
      setRejectionReason('');
      fetchPendingUsers(pendingPage);
    } catch (err) {
      toast.error(err.message || 'Failed to reject user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReApprove = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/approve-user/${selectedUser._id}`);
      toast.success(`${selectedUser.fullName} (${ROLE_LABELS[selectedUser.role]}) has been re-approved successfully`);
      closeAllModals();
      fetchRejectedUsers(rejectedPage);
    } catch (err) {
      toast.error(err.message || 'Failed to re-approve user');
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

  const openReApproveModal = (user) => {
    setSelectedUser(user);
    setShowReApproveModal(true);
  };

  const closeAllModals = () => {
    setShowDetailModal(false);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setShowReApproveModal(false);
    setSelectedUser(null);
    setRejectionReason('');
    setError(null);
  };

  const renderUserDetails = (user) => (
    <div className="space-y-6">
      {/* Avatar & Name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-text-dark">{user.fullName}</h3>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border mt-1 ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'}`}>
            <RoleBadgeIcon role={user.role} className="inline-block" /> {ROLE_LABELS[user.role] || user.role}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-bg-light rounded-xl">
          <p className="text-xs text-text-light font-medium uppercase tracking-wider">Email</p>
          <p className="text-sm font-semibold text-text-dark mt-1 break-all">{user.email}</p>
        </div>
        <div className="p-4 bg-bg-light rounded-xl">
          <p className="text-xs text-text-light font-medium uppercase tracking-wider">Phone</p>
          <p className="text-sm font-semibold text-text-dark mt-1">{user.phone || 'Not provided'}</p>
        </div>
        <div className="p-4 bg-bg-light rounded-xl">
          <p className="text-xs text-text-light font-medium uppercase tracking-wider">Gender</p>
          <p className="text-sm font-semibold text-text-dark mt-1 capitalize">{user.gender || 'Not specified'}</p>
        </div>
        <div className="p-4 bg-bg-light rounded-xl">
          <p className="text-xs text-text-light font-medium uppercase tracking-wider">Status</p>
          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            user.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-green-100 text-green-800'
            }`}>
            {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'N/A'}
          </span>
        </div>
        <div className="p-4 bg-bg-light rounded-xl">
          <p className="text-xs text-text-light font-medium uppercase tracking-wider">City</p>
          <p className="text-sm font-semibold text-text-dark mt-1">{user.city || 'Not provided'}</p>
        </div>
        <div className="p-4 bg-bg-light rounded-xl">
          <p className="text-xs text-text-light font-medium uppercase tracking-wider">Country</p>
          <p className="text-sm font-semibold text-text-dark mt-1">{user.country || 'Not provided'}</p>
        </div>
      </div>

      {user.status === 'rejected' && user.rejectionReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wider mb-1">Rejection Reason</p>
          <p className="text-sm font-semibold text-red-800">{user.rejectionReason}</p>
          {user.rejectedAt && (
            <p className="text-xs text-red-500 mt-2">
              Rejected on {new Date(user.rejectedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          )}
        </div>
      )}

      <div className="p-4 bg-bg-light rounded-xl">
        <p className="text-xs text-text-light font-medium uppercase tracking-wider">Registered On</p>
        <p className="text-sm font-semibold text-text-dark mt-1">
          {user.createdAt
            ? new Date(user.createdAt).toLocaleString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })
            : 'N/A'}
        </p>
      </div>
    </div>
  );

  const renderModalActions = (user) => {
    if (user.status === 'rejected') {
      return (
        <div className="p-6 sm:p-8 border-t border-border-light flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { setShowDetailModal(false); openReApproveModal(user); }}
            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <FiCheck size={16} className="-mt-0.5 inline-block" /> Re-Approve
          </button>
          <button
            onClick={closeAllModals}
            className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
          >
            Close
          </button>
        </div>
      );
    }
    return (
      <div className="p-6 sm:p-8 border-t border-border-light flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => { setShowDetailModal(false); openApproveModal(user); }}
          className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <FiCheck size={16} className="-mt-0.5 inline-block" /> Approve
          </button>
        <button
          onClick={() => { setShowDetailModal(false); openRejectModal(user); }}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            <FiX size={16} className="-mt-0.5 inline-block" /> Reject
          </button>
        <button
          onClick={closeAllModals}
          className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
        >
          Cancel
        </button>
      </div>
    );
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
              className="p-6 border-2 border-border-light rounded-xl hover:border-primary hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <span className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0"><card.icon size={28} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-light">{card.name}</p>
                  <p className="text-2xl font-bold text-primary">{card.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-dark">User Management</h1>
        <p className="text-text-light mt-1">Review and manage user registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {activeTab === 'pending' ? (
          <>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Pending Students</p>
                  <p className="text-3xl font-bold mt-2">{pendingStats.pendingStudents}</p>
                </div>
                <FiAward size={48} className="opacity-20" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Pending Teachers</p>
                  <p className="text-3xl font-bold mt-2">{pendingStats.pendingTeachers}</p>
                </div>
                <FiUsers size={48} className="opacity-20" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Total Pending</p>
                  <p className="text-3xl font-bold mt-2">{pendingStats.totalPending}</p>
                </div>
                <FiClock size={48} className="opacity-20" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Rejected Students</p>
                  <p className="text-3xl font-bold mt-2">{rejectedStats.rejectedStudents}</p>
                </div>
                <FiAward size={48} className="opacity-20" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Rejected Teachers</p>
                  <p className="text-3xl font-bold mt-2">{rejectedStats.rejectedTeachers}</p>
                </div>
                <FiUsers size={48} className="opacity-20" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm font-medium">Total Rejected</p>
                  <p className="text-3xl font-bold mt-2">{rejectedStats.totalRejected}</p>
                </div>
                <FiXCircle size={48} className="opacity-20" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
        {/* Tabs */}
        <div className="flex rounded-xl border border-border-light overflow-hidden mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white text-text-body hover:bg-bg-light'
                }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder={activeTab === 'pending' ? "Search pending users..." : "Search rejected users..."}
              value={activeTab === 'pending' ? pendingSearch : rejectedSearch}
              onChange={e => activeTab === 'pending' ? setPendingSearch(e.target.value) : setRejectedSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="flex rounded-xl border border-border-light overflow-hidden">
            {[
              { value: '', label: 'All', icon: FiClipboard },
              { value: 'student', label: 'Students', icon: FiAward },
              { value: 'teacher', label: 'Teachers', icon: FiUsers },
            ].map((tab) => {
              const currentFilter = activeTab === 'pending' ? pendingRoleFilter : rejectedRoleFilter;
              const setFilter = activeTab === 'pending' ? setPendingRoleFilter : setRejectedRoleFilter;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-3 text-sm font-semibold transition-all flex items-center gap-2 ${currentFilter === tab.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-body hover:bg-bg-light'
                    }`}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'pending' ? (
          <>
            {pendingLoading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-text-light mt-4">Loading pending users...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-16">
                <FiCheckCircle size={64} className="block mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-text-dark mb-2">All Clear!</h3>
                <p className="text-text-light">No pending users to review at this time.</p>
              </div>
            ) : (
              <>
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
                      {pendingUsers.map((user) => (
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
                              <RoleBadgeIcon role={user.role} className="inline-block" /> {ROLE_LABELS[user.role] || user.role}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-text-body">
                            {[user.city, user.country].filter(Boolean).join(', ') || 'N/A'}
                          </td>
                          <td className="p-3 text-sm text-text-body">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            }) : 'N/A'}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openDetailModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                <FiEye size={16} />
                              </button>
                              <button onClick={() => openApproveModal(user)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                                <FiCheck size={16} />
                              </button>
                              <button onClick={() => openRejectModal(user)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                                <FiX size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pendingTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
                    <p className="text-sm text-text-light">Showing {pendingUsers.length} of {pendingTotal} pending user{pendingTotal !== 1 ? 's' : ''}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setPendingPage(p => Math.max(1, p - 1))} disabled={pendingPage <= 1} className="px-4 py-2 border border-border-light rounded-lg text-sm font-semibold hover:bg-bg-light disabled:opacity-50 transition-colors">Previous</button>
                      {Array.from({ length: Math.min(pendingTotalPages, 5) }, (_, i) => {
                        const start = Math.max(1, pendingPage - 2);
                        const pageNum = start + i;
                        if (pageNum > pendingTotalPages) return null;
                        return (
                          <button key={pageNum} onClick={() => setPendingPage(pageNum)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${pageNum === pendingPage ? 'bg-primary text-white' : 'border border-border-light text-text-body hover:bg-bg-light'}`}>
                            {pageNum}
                          </button>
                        );
                      })}
                      <button onClick={() => setPendingPage(p => Math.min(pendingTotalPages, p + 1))} disabled={pendingPage >= pendingTotalPages} className="px-4 py-2 border border-border-light rounded-lg text-sm font-semibold hover:bg-bg-light disabled:opacity-50 transition-colors">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {rejectedLoading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-text-light mt-4">Loading rejected users...</p>
              </div>
            ) : rejectedUsers.length === 0 ? (
              <div className="text-center py-16">
                <FiCheckCircle size={64} className="block mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-text-dark mb-2">No Rejected Users</h3>
                <p className="text-text-light">There are no rejected users in the database.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
                  <table className="w-full min-w-[750px]">
                    <thead>
                      <tr className="border-b-2 border-border-light">
                        <th className="text-left p-3 font-semibold text-text-dark text-sm">User</th>
                        <th className="text-left p-3 font-semibold text-text-dark text-sm">Email</th>
                        <th className="text-center p-3 font-semibold text-text-dark text-sm">Role</th>
                        <th className="text-left p-3 font-semibold text-text-dark text-sm">Rejection Reason</th>
                        <th className="text-left p-3 font-semibold text-text-dark text-sm">Rejected At</th>
                        <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {rejectedUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-red-50/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
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
                              <RoleBadgeIcon role={user.role} className="inline-block" /> {ROLE_LABELS[user.role] || user.role}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-text-body max-w-[200px]">
                            <p className="truncate" title={user.rejectionReason || 'N/A'}>
                              {user.rejectionReason || 'N/A'}
                            </p>
                          </td>
                          <td className="p-3 text-sm text-text-body">
                            {user.rejectedAt
                              ? new Date(user.rejectedAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })
                              : 'N/A'}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openDetailModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                <FiEye size={16} />
                              </button>
                              <button onClick={() => openReApproveModal(user)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Re-Approve">
                                <FiRefreshCw size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rejectedTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
                    <p className="text-sm text-text-light">Showing {rejectedUsers.length} of {rejectedTotal} rejected user{rejectedTotal !== 1 ? 's' : ''}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setRejectedPage(p => Math.max(1, p - 1))} disabled={rejectedPage <= 1} className="px-4 py-2 border border-border-light rounded-lg text-sm font-semibold hover:bg-bg-light disabled:opacity-50 transition-colors">Previous</button>
                      {Array.from({ length: Math.min(rejectedTotalPages, 5) }, (_, i) => {
                        const start = Math.max(1, rejectedPage - 2);
                        const pageNum = start + i;
                        if (pageNum > rejectedTotalPages) return null;
                        return (
                          <button key={pageNum} onClick={() => setRejectedPage(pageNum)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${pageNum === rejectedPage ? 'bg-primary text-white' : 'border border-border-light text-text-body hover:bg-bg-light'}`}>
                            {pageNum}
                          </button>
                        );
                      })}
                      <button onClick={() => setRejectedPage(p => Math.min(rejectedTotalPages, p + 1))} disabled={rejectedPage >= rejectedTotalPages} className="px-4 py-2 border border-border-light rounded-lg text-sm font-semibold hover:bg-bg-light disabled:opacity-50 transition-colors">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* === DETAIL MODAL === */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeAllModals}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
            <div className="p-6 sm:p-8">
              {renderUserDetails(selectedUser)}
            </div>
            {renderModalActions(selectedUser)}
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
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    "Approving..."
                  ) : (
                    <>
                      <FiCheck size={18} />
                      Confirm Approval
                    </>
                  )}
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
                <label className="block text-sm font-semibold text-text-dark mb-2.5">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                />
                <p className="text-xs text-text-light mt-1.5">This reason will be included in the rejection email sent to the user.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    "Rejecting..."
                  ) : (
                    <>
                      <FiX size={18} />
                      Confirm Rejection
                    </>
                  )}
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

      {/* === RE-APPROVE MODAL === */}
      {showReApproveModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeAllModals}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiRefreshCw className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-2">Re-Approve User</h2>
              <p className="text-text-body mb-2">
                Are you sure you want to re-approve <strong>{selectedUser.fullName}</strong>?
              </p>
              <p className="text-sm text-text-light mb-6">
                This user was previously rejected. Re-approving will grant them access as a <strong>{ROLE_LABELS[selectedUser.role]}</strong> and they will receive a confirmation email.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleReApprove} disabled={actionLoading} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {actionLoading ? 'Re-Approving...' : <><FiRefreshCw size={16} /> Confirm Re-Approval</>}
                </button>
                <button onClick={closeAllModals} className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
