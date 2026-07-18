import { useState, useEffect, useCallback } from 'react';
import admissionService from '../../services/admissionService';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'under-review': 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-purple-100 text-purple-800',
};

export default function AdminAdmissionManagementSection() {
  const [admissions, setAdmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [remarks, setRemarks] = useState('');
  const [actionId, setActionId] = useState(null);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentAction, setCurrentAction] = useState('');

  const loadAdmissions = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      const res = await admissionService.getAdminAdmissions(params);
      setAdmissions(res.data?.data || res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [searchQuery, statusFilter]);

  const loadStats = useCallback(async () => {
    try { const res = await admissionService.getAdmissionStats(); setStats(res.data); } catch (_) {}
  }, []);

  useEffect(() => { loadAdmissions(); loadStats(); }, [loadAdmissions, loadStats]);

  async function handleAction(action, id) {
    if (action === 'delete') {
      if (!confirm('Delete this application? It will be soft-deleted.')) return;
      try { await admissionService.deleteAdmission(id); setSuccess('Application deleted'); loadAdmissions(); loadStats(); }
      catch (err) { setError(err.message); }
      return;
    }
    if (action === 'restore') {
      try { await admissionService.restoreAdmission(id); setSuccess('Application restored'); loadAdmissions(); }
      catch (err) { setError(err.message); }
      return;
    }
    setCurrentAction(action);
    setActionId(id);
    setRemarks('');
    setShowRemarksModal(true);
  }

  async function confirmAction() {
    if (!actionId) return;
    try {
      const action = currentAction;
      if (action === 'approve') await admissionService.approveAdmission(actionId, remarks);
      else if (action === 'reject') await admissionService.rejectAdmission(actionId, remarks);
      else if (action === 'waitlist') await admissionService.waitlistAdmission(actionId, remarks);
      else if (action === 'review') await admissionService.reviewAdmission(actionId, remarks);
      setSuccess(`Application ${action}d successfully`);
      setShowRemarksModal(false);
      setActionId(null);
      setRemarks('');
      loadAdmissions();
      loadStats();
    } catch (err) { setError(err.message); }
  }

  async function handleConvertToStudent(id) {
    if (!confirm('Convert this admission to a student account? This action cannot be undone.')) return;
    try {
      await admissionService.convertToStudent(id);
      setSuccess('Admission converted to student account');
      loadAdmissions();
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

  const statusBadge = (status) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total" value={stats.total} color="text-text-dark" />
          <StatCard label="Pending" value={stats.pending} color="text-yellow-600" />
          <StatCard label="Under Review" value={stats.underReview} color="text-blue-600" />
          <StatCard label="Approved" value={stats.approved} color="text-green-600" />
          <StatCard label="Rejected" value={stats.rejected} color="text-red-600" />
          <StatCard label="Waitlisted" value={stats.waitlisted} color="text-purple-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">Admissions Management</h2>
            <p className="text-sm text-text-light mt-1">Manage all admission applications</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, application #, email, phone..."
            className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
          </select>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
          </div>
        ) : admissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
            <table className="w-full min-w-[600px]">
              <thead className="border-b-2 border-border-light">
                <tr>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Application #</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Student</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm hidden md:table-cell">Contact</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm hidden lg:table-cell">Country</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm hidden sm:table-cell">Status</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {admissions.map((adm) => (
                  <tr key={adm._id} className="hover:bg-bg-light transition-colors">
                    <td className="p-3">
                      <span className="text-xs font-mono font-semibold text-text-dark">{adm.applicationNumber}</span>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-text-dark text-sm">{adm.studentName}</p>
                      <p className="text-xs text-text-light">{adm.gender} &middot; {adm.dateOfBirth ? new Date(adm.dateOfBirth).toLocaleDateString() : '-'}</p>
                    </td>
                    <td className="p-3 text-sm text-text-body hidden md:table-cell">
                      <p>{adm.email || '-'}</p>
                      <p className="text-xs text-text-light">{adm.phone}</p>
                    </td>
                    <td className="p-3 text-sm text-text-body hidden lg:table-cell">{adm.country || '-'}</td>
                    <td className="p-3 text-center hidden sm:table-cell">{statusBadge(adm.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {adm.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction('review', adm._id)} className="text-blue-500 text-xs hover:underline font-medium">Review</button>
                            <button onClick={() => handleAction('approve', adm._id)} className="text-green-600 text-xs hover:underline font-medium">Approve</button>
                            <button onClick={() => handleAction('reject', adm._id)} className="text-red-500 text-xs hover:underline font-medium">Reject</button>
                            <button onClick={() => handleAction('waitlist', adm._id)} className="text-purple-500 text-xs hover:underline font-medium">Waitlist</button>
                          </>
                        )}
                        {adm.status === 'under-review' && (
                          <>
                            <button onClick={() => handleAction('approve', adm._id)} className="text-green-600 text-xs hover:underline font-medium">Approve</button>
                            <button onClick={() => handleAction('reject', adm._id)} className="text-red-500 text-xs hover:underline font-medium">Reject</button>
                            <button onClick={() => handleAction('waitlist', adm._id)} className="text-purple-500 text-xs hover:underline font-medium">Waitlist</button>
                          </>
                        )}
                        {adm.status === 'approved' && (
                          <>
                            <span className="text-xs text-text-light">Completed</span>
                            {!adm.convertedToStudent && (
                              <button onClick={() => handleConvertToStudent(adm._id)} className="text-green-600 text-xs hover:underline font-medium ml-1">Convert to Student</button>
                            )}
                          </>
                        )}
                        {adm.status === 'rejected' && (
                          <button onClick={() => handleAction('restore', adm._id)} className="text-blue-500 text-xs hover:underline font-medium">Restore</button>
                        )}
                        {adm.status === 'waitlisted' && (
                          <>
                            <button onClick={() => handleAction('approve', adm._id)} className="text-green-600 text-xs hover:underline font-medium">Approve</button>
                            <button onClick={() => handleAction('reject', adm._id)} className="text-red-500 text-xs hover:underline font-medium">Reject</button>
                          </>
                        )}
                        <button onClick={() => handleAction('delete', adm._id)} className="text-red-500 text-xs hover:underline font-medium ml-1">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRemarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-heading font-semibold text-lg text-text-dark mb-2">
              {currentAction.charAt(0).toUpperCase() + currentAction.slice(1)} Application
            </h3>
            <p className="text-sm text-text-light mb-4">Add admin remarks (optional):</p>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
              placeholder="Enter remarks..."
            />
            <div className="flex items-center gap-3 mt-4">
              <button onClick={confirmAction} className="px-5 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors">
                Confirm
              </button>
              <button onClick={() => { setShowRemarksModal(false); setActionId(null); }} className="px-5 py-2 border border-border-light text-text-light rounded-xl text-sm hover:bg-bg-light transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
