import { useState, useEffect, useCallback } from 'react';
import attendanceService from '../../services/attendanceService';

const STATUS_BADGES = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  excused: 'bg-blue-100 text-blue-800',
};

export default function AdminAttendanceSection() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', course: '', batch: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ student: '', course: '', classDate: '', classTime: '', status: 'present', batch: '', remarks: '' });
  const [saving, setSaving] = useState(false);

  const fetchRecords = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20, ...filters };
      if (search) params.search = search;
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });

      const res = await attendanceService.getAdminAttendance(params);
      if (res?.data) {
        setRecords(res.data.data || []);
        setPage(res.data.pagination?.page || 1);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.course) params.course = filters.course;
      if (filters.batch) params.batch = filters.batch;
      const res = await attendanceService.getAdminAttendanceStats(params);
      if (res?.data) setStats(res.data);
    } catch (_) {}
  }, [filters]);

  useEffect(() => { fetchRecords(page); }, [page, fetchRecords]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await attendanceService.createAttendance(formData);
      setShowForm(false);
      setFormData({ student: '', course: '', classDate: '', classTime: '', status: 'present', batch: '', remarks: '' });
      fetchRecords(1);
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to create attendance record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this attendance record?')) return;
    try {
      await attendanceService.deleteAttendance(id);
      fetchRecords(page);
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      await attendanceService.restoreAttendance(id);
      fetchRecords(page);
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-dark">Attendance Management</h1>
          <p className="text-text-light mt-1">{total} total records</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          {showForm ? 'Cancel' : '+ Mark Attendance'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-primary/20">
          <h2 className="font-heading text-xl font-bold text-text-dark mb-6">Mark New Attendance</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Student ID</label>
              <input type="text" value={formData.student} onChange={e => setFormData({ ...formData, student: e.target.value })} required placeholder="MongoDB Student ID" className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Course ID</label>
              <input type="text" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} required placeholder="MongoDB Course ID" className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Class Date</label>
              <input type="date" value={formData.classDate} onChange={e => setFormData({ ...formData, classDate: e.target.value })} required max={getTodayDate()} className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Class Time</label>
              <input type="time" value={formData.classTime} onChange={e => setFormData({ ...formData, classTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">Batch</label>
              <input type="text" value={formData.batch} onChange={e => setFormData({ ...formData, batch: e.target.value })} placeholder="e.g. Morning Batch" className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-text-dark mb-2">Remarks</label>
              <textarea rows={2} value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
            </div>
            <div className="md:col-span-3 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : 'Save Record'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border-2 border-border-light text-text-light rounded-xl font-semibold hover:bg-bg-light transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total Records', value: stats.total, color: 'bg-primary/10 text-primary' },
          { label: 'Present', value: stats.present, color: 'bg-green-100 text-green-800' },
          { label: 'Absent', value: stats.absent, color: 'bg-red-100 text-red-800' },
          { label: 'Late', value: stats.late, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Attendance %', value: `${stats.percentage}%`, color: 'bg-blue-100 text-blue-800' },
        ].map((card, idx) => (
          <div key={idx} className={`rounded-xl p-4 border ${card.color.replace('text-', 'border-').split(' ')[0]}/20 ${card.color}`}>
            <p className="text-xs font-medium opacity-75">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by ID, student name, or batch..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="px-4 py-3 rounded-xl border border-border-light outline-none min-w-[120px]">
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
          <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} className="px-4 py-3 rounded-xl border border-border-light outline-none min-w-[130px]" placeholder="From" />
          <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} className="px-4 py-3 rounded-xl border border-border-light outline-none min-w-[130px]" placeholder="To" />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-text-light mt-4">Loading attendance records...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">No attendance records found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
              <table className="w-full min-w-[700px]">
                <thead className="border-b-2 border-border-light">
                  <tr>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Attendance ID</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Student</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Course</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Date</th>
                    <th className="text-left p-3 font-semibold text-text-dark text-sm">Time</th>
                    <th className="text-center p-3 font-semibold text-text-dark text-sm">Status</th>
                    <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-bg-light">
                      <td className="p-3 font-mono text-xs text-primary font-semibold">{record.attendanceId}</td>
                      <td className="p-3">
                        <p className="font-semibold text-text-dark text-sm">{record.student?.studentName || 'N/A'}</p>
                        <p className="text-xs text-text-light">{record.student?.studentId}</p>
                      </td>
                      <td className="p-3 text-sm text-text-body">{record.course?.title || 'N/A'}</td>
                      <td className="p-3 text-sm text-text-body">{record.classDate ? new Date(record.classDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3 text-sm text-text-body">{record.classTime || '-'}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_BADGES[record.status] || 'bg-gray-100 text-gray-800'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
                <p className="text-sm text-text-light">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 border border-border-light rounded-lg text-sm font-semibold hover:bg-bg-light disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
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
    </div>
  );
}
