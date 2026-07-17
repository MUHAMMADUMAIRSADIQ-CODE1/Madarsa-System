import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { FiEye, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

const ROLE_LABELS = { student: 'Student', teacher: 'Teacher' };
const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-800 border-blue-200',
  teacher: 'bg-purple-100 text-purple-800 border-purple-200',
};
const ROLE_ICONS = { student: '🎓', teacher: '👨‍🏫' };

export default function AdminProfileVerificationSection() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ pendingStudents: 0, pendingTeachers: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      q.set('page', p); q.set('limit', 20);
      if (search) q.set('search', search);
      if (roleFilter) q.set('role', roleFilter);

      const res = await api.get(`/admin/pending-profile-verifications?${q.toString()}`);
      const d = res?.data || res;
      if (d?.users) {
        setUsers(d.users);
        setPage(d.pagination?.page || 1);
        setTotalPages(d.pagination?.totalPages || 1);
        setTotal(d.pagination?.total || 0);
      }
      if (d?.stats) setStats(d.stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter]);
  useEffect(() => { if (successMsg) setTimeout(() => setSuccessMsg(''), 4000); }, [successMsg]);

  const handleVerify = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/approve-profile-verification/${selectedUser._id}`);
      setSuccessMsg(`✓ ${selectedUser.fullName} profile verified successfully`);
      closeAll();
      fetchUsers(page);
    } catch (err) {
      setError(err.message || 'Failed to verify');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/reject-profile-verification/${selectedUser._id}`, { reason: rejectionReason.trim() });
      setSuccessMsg(`✗ ${selectedUser.fullName} verification rejected`);
      closeAll();
      setRejectionReason('');
      fetchUsers(page);
    } catch (err) {
      setError(err.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const closeAll = () => {
    setShowDetailModal(false);
    setShowVerifyModal(false);
    setShowRejectModal(false);
    setSelectedUser(null);
    setRejectionReason('');
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold text-text-dark mb-4">Profile Verification Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm font-medium">Pending Students</p>
            <p className="text-3xl font-bold mt-2">{stats.pendingStudents}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
            <p className="text-purple-100 text-sm font-medium">Pending Teachers</p>
            <p className="text-3xl font-bold mt-2">{stats.pendingTeachers}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
            <p className="text-amber-100 text-sm font-medium">Total Pending</p>
            <p className="text-3xl font-bold mt-2">{stats.totalPending}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
        {successMsg && (
          <div className="mb-4 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-medium animate-fade-in flex items-center gap-3">
            <span>✓</span><span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="ml-auto text-emerald-500 hover:text-emerald-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        )}
        {error && (
          <div className="mb-4 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium animate-fade-in flex items-center gap-3">
            <span>⚠</span><span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="flex-1 px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          <div className="flex rounded-xl border border-border-light overflow-hidden">
            {[
              { value: '', label: 'All', icon: '📋' },
              { value: 'student', label: 'Students', icon: '🎓' },
              { value: 'teacher', label: 'Teachers', icon: '👨‍🏫' },
            ].map(tab => (
              <button key={tab.value} onClick={() => setRoleFilter(tab.value)}
                className={`px-4 py-3 text-sm font-semibold transition-all flex items-center gap-2 ${roleFilter === tab.value ? 'bg-primary text-white' : 'bg-white text-text-body hover:bg-bg-light'}`}>
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-text-light mt-4">Loading...</p></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16"><span className="text-6xl block mb-4">✅</span><h3 className="text-xl font-bold text-text-dark mb-2">All Profiles Verified</h3><p className="text-text-light">No pending profile verifications.</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b-2 border-border-light">
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">User</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Email</th>
                    <th className="text-center p-3 font-semibold text-text-dark text-sm">Role</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Submitted</th>
                    <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-bg-light transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {u.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-semibold text-text-dark text-sm">{u.fullName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-text-body">{u.email}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-800'}`}>
                          {ROLE_ICONS[u.role] || '📌'} {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-text-body">
                        {u.profileVerificationSubmittedAt ? new Date(u.profileVerificationSubmittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setSelectedUser(u); setShowDetailModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details"><FiEye size={16} /></button>
                          <button onClick={() => { setSelectedUser(u); setShowVerifyModal(true); }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Verify Profile"><FiCheck size={16} /></button>
                          <button onClick={() => { setSelectedUser(u); setShowRejectModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject"><FiX size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
                <p className="text-sm text-text-light">Showing {users.length} of {total}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 border border-border-light rounded-lg text-sm font-semibold hover:bg-bg-light disabled:opacity-50">Previous</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 border border-border-light rounded-lg text-sm font-semibold hover:bg-bg-light disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeAll}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-bold text-text-dark">Profile Verification Details</h2>
                <button onClick={closeAll} className="p-2 hover:bg-bg-light rounded-xl transition-colors">
                  <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {selectedUser.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-dark">{selectedUser.fullName}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border mt-1 ${ROLE_COLORS[selectedUser.role] || 'bg-gray-100 text-gray-800'}`}>
                    {ROLE_ICONS[selectedUser.role] || '📌'} {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                  </span>
                </div>
              </div>
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
                  <p className="text-xs text-text-light font-medium uppercase tracking-wider">Country</p>
                  <p className="text-sm font-semibold text-text-dark mt-1">{selectedUser.country || 'Not provided'}</p>
                </div>
                <div className="p-4 bg-bg-light rounded-xl">
                  <p className="text-xs text-text-light font-medium uppercase tracking-wider">City</p>
                  <p className="text-sm font-semibold text-text-dark mt-1">{selectedUser.city || 'Not provided'}</p>
                </div>
              </div>
              <div className="p-4 bg-bg-light rounded-xl">
                <p className="text-xs text-text-light font-medium uppercase tracking-wider">Profile Status</p>
                <p className="text-sm font-semibold text-text-dark mt-1">Submitted for verification</p>
              </div>
            </div>
            <div className="p-6 sm:p-8 border-t border-border-light flex flex-col sm:flex-row gap-3">
              <button onClick={() => { setShowDetailModal(false); setShowVerifyModal(true); }} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">✓ Approve Profile</button>
              <button onClick={() => { setShowDetailModal(false); setShowRejectModal(true); }} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">✗ Reject</button>
              <button onClick={closeAll} className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeAll}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-2">Verify Profile</h2>
              <p className="text-text-body mb-2">Approve profile for <strong>{selectedUser.fullName}</strong>?</p>
              <p className="text-sm text-text-light mb-6">This will enable dashboard access and send a verification email.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleVerify} disabled={actionLoading} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  {actionLoading ? 'Verifying...' : '✓ Confirm Verification'}
                </button>
                <button onClick={closeAll} className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeAll}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-dark mb-2 text-center">Reject Profile Verification</h2>
              <p className="text-text-body text-center mb-6">Provide feedback for <strong>{selectedUser.fullName}</strong></p>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-text-dark mb-2.5">Reason / Required Changes *</label>
                <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Describe what needs to be corrected..." rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
                  {actionLoading ? 'Rejecting...' : '✗ Confirm Rejection'}
                </button>
                <button onClick={closeAll} className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
