import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import admissionService from '../../services/admissionService';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-400', icon: 'clock' },
  'under-review': { label: 'Under Review', color: 'bg-blue-100 text-blue-800', border: 'border-blue-400', icon: 'search' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', border: 'border-green-400', icon: 'check' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', border: 'border-red-400', icon: 'x' },
  waitlisted: { label: 'Waitlisted', color: 'bg-purple-100 text-purple-800', border: 'border-purple-400', icon: 'clock' },
};

const STEP_ORDER = ['pending', 'under-review', 'approved', 'waitlisted'];

export default function AdmissionStatus() {
  const navigate = useNavigate();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    const val = applicationNumber.trim();
    if (!val) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await admissionService.checkStatus(val);
      if (!res.data) {
        setError('Application not found. Please check the application number.');
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch status. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getStatusIndex(status) {
    const idx = STEP_ORDER.indexOf(status);
    return idx === -1 ? STEP_ORDER.length : idx;
  }

  const currentIdx = result ? getStatusIndex(result.status) : -1;
  const isRejected = result?.status === 'rejected';
  const isWaitlisted = result?.status === 'waitlisted';

  return (
    <div className="min-h-screen bg-bg-light pt-28 lg:pt-32 pb-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <h2 className="font-heading text-2xl font-bold text-text-dark mb-2">Track Your Application</h2>
          <p className="text-sm text-text-light mb-6">Enter your application number to check the status.</p>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={applicationNumber}
              onChange={(e) => setApplicationNumber(e.target.value)}
              placeholder="e.g. ADM-2026-000001"
              className="flex-1 px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-mono"
            />
            <button type="submit" disabled={loading || !applicationNumber.trim()} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors">
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : 'Search'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-semibold text-lg text-text-dark">{result.studentName}</h3>
                <p className="text-xs text-text-light font-mono mt-0.5">{result.applicationNumber}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[result.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                {STATUS_CONFIG[result.status]?.label || result.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="text-text-light">Submission Date</span><p className="font-medium text-text-dark">{new Date(result.createdAt || Date.now()).toLocaleDateString()}</p></div>
              <div><span className="text-text-light">Course</span><p className="font-medium text-text-dark">{result.selectedCourse || '-'}</p></div>
              <div><span className="text-text-light">Contact</span><p className="font-medium text-text-dark">{result.email || result.phone || '-'}</p></div>
              <div><span className="text-text-light">Learning Mode</span><p className="font-medium text-text-dark capitalize">{result.learningMode || '-'}</p></div>
            </div>

            <div className="border-t border-border-light pt-6">
              <h4 className="font-medium text-sm text-text-dark mb-4">Application Timeline</h4>
              <div className="relative">
                {STEP_ORDER.map((status, idx) => {
                  const config = STATUS_CONFIG[status];
                  const isPast = idx < currentIdx && !isRejected;
                  const isCurrent = idx === currentIdx;
                  const isLast = idx === STEP_ORDER.length - 1;
                  return (
                    <div key={status} className="flex gap-4 pb-6 relative">
                      {!isLast && (
                        <div className={`absolute left-[15px] top-8 w-0.5 h-full -z-10 ${isPast ? 'bg-green-300' : 'bg-gray-200'}`} />
                      )}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                        isPast ? 'bg-green-100 text-green-700' : isCurrent ? `${config.color} ring-2 ring-offset-2 ${config.border}` : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isPast ? (
                          <FiCheck className="w-4 h-4" />
                        ) : isCurrent ? (
                          <div className="w-3 h-3 rounded-full bg-current" />
                        ) : idx < currentIdx ? (
                          <FiCheck className="w-4 h-4" />
                        ) : idx}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`text-sm font-medium ${isCurrent ? 'text-text-dark' : isPast ? 'text-green-700' : 'text-gray-400'}`}>
                          {config.label}
                        </p>
                      </div>
                    </div>
                  );
                })}

{isRejected && (
                  <div className="flex gap-4 pb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold z-10 ring-2 ring-offset-2 ring-red-400">
                      <FiX className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm font-medium text-red-600">Rejected</p>
                    </div>
                  </div>
                )}

                {isWaitlisted && (
                  <div className="flex gap-4 pb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold z-10 ring-2 ring-offset-2 ring-purple-400">
                      <FiClock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm font-medium text-purple-600">Waitlisted</p>
                      <p className="text-xs text-text-light mt-1">You have been waitlisted. We will notify you if a slot becomes available.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {result.reviewedAt && (
              <div className="mt-4 p-3 bg-bg-light rounded-xl text-sm">
                <span className="text-text-light">Reviewed on: </span>
                <span className="font-medium text-text-dark">{new Date(result.reviewedAt).toLocaleDateString()}</span>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border-light">
              <button onClick={() => navigate('/admissions')} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                Back to Admissions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
