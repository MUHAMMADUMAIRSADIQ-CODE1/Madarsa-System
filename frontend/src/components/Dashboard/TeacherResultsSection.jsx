import { useState, useEffect, useCallback } from 'react';
import teacherAcademicService from '../../services/teacherAcademicService';
import { useAuth } from '../../context/AuthContext';
import {
  FiEdit3, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight,
  FiCheckCircle, FiSend, FiX, FiPlus, FiBook, FiUser, FiAward
} from 'react-icons/fi';

export default function TeacherResultsSection() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student: '', course: '', teacher: '', examName: '', examDate: '',
    totalMarks: 100, obtainedMarks: 0, remarks: '',
  });

  const teacherId = user?._id || user?.id;

  const fetchResults = useCallback(async (p = 1) => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (courseFilter) params.course = courseFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await teacherAcademicService.getResults(teacherId, params);
      const data = res?.data || res;
      setResults(data?.results || []);
      setTotalPages(data?.totalPages || Math.ceil((data?.total || 0) / 20) || 1);
      setTotal(data?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }, [teacherId, searchQuery, courseFilter, statusFilter]);

  useEffect(() => { fetchResults(page); }, [page, fetchResults]);
  useEffect(() => { setPage(1); }, [searchQuery, courseFilter, statusFilter]);

  const openCreateModal = () => {
    setForm({ student: '', course: '', teacher: teacherId, examName: '', examDate: new Date().toISOString().split('T')[0], totalMarks: 100, obtainedMarks: 0, remarks: '' });
    setEditingResult(null);
    setShowModal(true);
  };

  const openEditModal = (result) => {
    setForm({
      student: result.student?._id || result.student || '',
      course: result.course?._id || result.course || '',
      teacher: teacherId,
      examName: result.examName || '',
      examDate: result.examDate ? new Date(result.examDate).toISOString().split('T')[0] : '',
      totalMarks: result.totalMarks || 100,
      obtainedMarks: result.obtainedMarks || 0,
      remarks: result.remarks || '',
    });
    setEditingResult(result);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingResult) {
        await teacherAcademicService.updateResult(editingResult._id, form);
        setSuccess('Result updated successfully');
      } else {
        await teacherAcademicService.createResult(form);
        setSuccess('Result created successfully');
      }
      setShowModal(false);
      fetchResults(page);
    } catch (err) {
      setError(err.message || 'Failed to save result');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (result) => {
    if (!confirm(`Delete result for ${result.student?.studentName || 'this student'}?`)) return;
    try {
      await teacherAcademicService.deleteResult(result._id, teacherId);
      setSuccess('Result deleted');
      fetchResults(page);
    } catch (err) {
      setError(err.message || 'Failed to delete result');
    }
  };

  const handlePublish = async (result) => {
    try {
      await teacherAcademicService.publishResult(result._id, teacherId);
      setSuccess('Result published');
      fetchResults(page);
    } catch (err) {
      setError(err.message || 'Failed to publish result');
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'B+': case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      case 'D': return 'bg-red-100 text-red-800';
      case 'F': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-dark">Results & Gradebook</h2>
          <p className="text-sm text-text-light mt-1">{total > 0 ? `${total} result${total !== 1 ? 's' : ''}` : 'Enter and manage student marks'}</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm">
          <FiPlus className="w-4 h-4" /> Add Result
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input type="text" placeholder="Search by exam name..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <FiAward className="w-16 h-16 text-border-light mx-auto mb-4" />
          <p className="text-text-light font-medium">No results recorded yet</p>
          <p className="text-sm text-text-light mt-2">Add your first student result to get started</p>
          <button onClick={openCreateModal} className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark text-sm">
            <FiPlus className="w-4 h-4 inline mr-1.5" /> Add Result
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
          <table className="w-full min-w-[700px]">
            <thead className="border-b-2 border-border-light">
              <tr>
                <th className="text-left p-3 font-semibold text-text-dark text-sm">Student</th>
                <th className="text-left p-3 font-semibold text-text-dark text-sm hidden md:table-cell">Exam</th>
                <th className="text-center p-3 font-semibold text-text-dark text-sm">Marks</th>
                <th className="text-center p-3 font-semibold text-text-dark text-sm">%</th>
                <th className="text-center p-3 font-semibold text-text-dark text-sm">Grade</th>
                <th className="text-center p-3 font-semibold text-text-dark text-sm">Status</th>
                <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {results.map(r => (
                <tr key={r._id} className="hover:bg-bg-light transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {r.student?.studentName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-text-dark text-sm">{r.student?.studentName || 'Unknown'}</p>
                        <p className="text-xs text-text-light">{r.student?.studentId || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-text-body hidden md:table-cell">
                    <p className="font-medium">{r.examName}</p>
                    <p className="text-xs text-text-light">{r.course?.title || ''}</p>
                  </td>
                  <td className="p-3 text-center text-sm font-semibold text-text-dark">
                    {r.obtainedMarks}/{r.totalMarks}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.percentage >= 60 ? 'bg-green-100 text-green-800' : r.percentage >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {r.percentage}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getGradeColor(r.grade)}`}>{r.grade || '-'}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${r.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openEditModal(r)} className="p-1.5 text-primary hover:bg-primary-light rounded-lg transition-colors" title="Edit"><FiEdit3 className="w-4 h-4" /></button>
                      {r.status !== 'published' && (
                        <button onClick={() => handlePublish(r)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Publish"><FiSend className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => handleDelete(r)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-light">
          <p className="text-sm text-text-light">Page {page} of {totalPages} ({total} total)</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50"><FiChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50"><FiChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-dark">{editingResult ? 'Edit Result' : 'Add Result'}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-light hover:text-text-dark"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Student ID *</label>
                  <input type="text" value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))} required
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="MongoDB ID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Course ID *</label>
                  <input type="text" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} required
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="MongoDB ID" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Exam Name *</label>
                <input type="text" value={form.examName} onChange={e => setForm(f => ({ ...f, examName: e.target.value }))} required
                  placeholder="e.g. Midterm Exam" className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Total Marks *</label>
                  <input type="number" value={form.totalMarks} onChange={e => setForm(f => ({ ...f, totalMarks: parseInt(e.target.value) || 0 }))} required min={1}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Obtained Marks</label>
                  <input type="number" value={form.obtainedMarks} onChange={e => setForm(f => ({ ...f, obtainedMarks: parseInt(e.target.value) || 0 }))} min={0}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Exam Date</label>
                  <input type="date" value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Remarks</label>
                <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} rows={2}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              {form.totalMarks > 0 && form.obtainedMarks > 0 && (
                <div className="p-3 bg-bg-light rounded-xl flex items-center justify-between">
                  <span className="text-sm text-text-light">Calculated: {(form.obtainedMarks / form.totalMarks * 100).toFixed(1)}%</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(
                    form.obtainedMarks / form.totalMarks >= 0.9 ? 'A+' :
                    form.obtainedMarks / form.totalMarks >= 0.8 ? 'A' :
                    form.obtainedMarks / form.totalMarks >= 0.7 ? 'B+' :
                    form.obtainedMarks / form.totalMarks >= 0.6 ? 'B' :
                    form.obtainedMarks / form.totalMarks >= 0.5 ? 'C' :
                    form.obtainedMarks / form.totalMarks >= 0.4 ? 'D' : 'F'
                  )}`}>
                    {form.obtainedMarks / form.totalMarks >= 0.9 ? 'A+' :
                     form.obtainedMarks / form.totalMarks >= 0.8 ? 'A' :
                     form.obtainedMarks / form.totalMarks >= 0.7 ? 'B+' :
                     form.obtainedMarks / form.totalMarks >= 0.6 ? 'B' :
                     form.obtainedMarks / form.totalMarks >= 0.5 ? 'C' :
                     form.obtainedMarks / form.totalMarks >= 0.4 ? 'D' : 'F'}
                  </span>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50">
                  {saving ? 'Saving...' : editingResult ? 'Update Result' : 'Save Result'}
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
