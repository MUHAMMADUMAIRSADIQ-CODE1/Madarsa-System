import { useState, useEffect, useCallback } from 'react';
import teacherAcademicService from '../../services/teacherAcademicService';
import { useAuth } from '../../context/AuthContext';
import {
  FiCalendar, FiClipboard, FiBook, FiPlus, FiEdit2, FiTrash2,
  FiSearch, FiChevronLeft, FiChevronRight, FiEye, FiX, FiFile
} from 'react-icons/fi';

export default function TeacherAssignmentsSection() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    teacher: '',
    dueDate: '',
    totalMarks: 100,
    isPublished: true,
  });

  const teacherId = user?._id || user?.id;

  const fetchAssignments = useCallback(async (p = 1) => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 10 };
      if (searchQuery) params.search = searchQuery;

      const res = await teacherAcademicService.getAssignments(teacherId, params);
      const responseData = res?.data || res;
      setAssignments(responseData?.assignments || []);
      setTotalPages(responseData?.totalPages || Math.ceil((responseData?.total || 0) / 10) || 1);
      setTotal(responseData?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }, [teacherId, searchQuery]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await teacherAcademicService.getMyCourses(teacherId, { limit: 100 });
      const responseData = res?.data || res;
      setCourses(responseData?.courses || []);
    } catch (_) { /* ignore */ }
  }, [teacherId]);

  useEffect(() => {
    fetchAssignments(page);
  }, [page, fetchAssignments]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (showModal && teacherId) {
      fetchCourses();
    }
  }, [showModal, teacherId, fetchCourses]);

  useEffect(() => {
    if (!showModal) {
      setEditingAssignment(null);
      setForm({ title: '', description: '', course: '', teacher: '', dueDate: '', totalMarks: 100, isPublished: true });
      setError(null);
    }
  }, [showModal]);

  const openCreateModal = () => {
    setForm(prev => ({ ...prev, teacher: teacherId }));
    setEditingAssignment(null);
    setShowModal(true);
  };

  const openEditModal = (assignment) => {
    setForm({
      title: assignment.title || '',
      description: assignment.description || '',
      course: assignment.course?._id || assignment.course || '',
      teacher: teacherId,
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
      totalMarks: assignment.totalMarks || 100,
      isPublished: assignment.isPublished !== false,
    });
    setEditingAssignment(assignment);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.course || !form.dueDate) return;

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingAssignment) {
        await teacherAcademicService.updateAssignment(editingAssignment._id, form);
        setSuccess('Assignment updated successfully');
      } else {
        await teacherAcademicService.createAssignment(form);
        setSuccess('Assignment created successfully');
      }
      setShowModal(false);
      fetchAssignments(page);
    } catch (err) {
      setError(err.message || 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (assignment) => {
    if (!confirm(`Delete "${assignment.title}"? This action cannot be undone.`)) return;
    try {
      await teacherAcademicService.deleteAssignment(assignment._id);
      setSuccess('Assignment deleted successfully');
      fetchAssignments(page);
      if (viewingAssignment?._id === assignment._id) setViewingAssignment(null);
    } catch (err) {
      setError(err.message || 'Failed to delete assignment');
    }
  };

  const viewAssignmentDetail = async (assignment) => {
    try {
      const res = await teacherAcademicService.getAssignmentById(assignment._id);
      const responseData = res?.data || res;
      setViewingAssignment(responseData);
    } catch (err) {
      setError(err.message || 'Failed to fetch assignment details');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getDueDateColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'text-red-600 bg-red-100';
    if (diffDays <= 3) return 'text-orange-600 bg-orange-100';
    return 'text-text-light';
  };

  // Assignment Detail Modal
  const renderAssignmentDetail = (assignment) => (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 pb-10 overflow-y-auto"
      onClick={() => setViewingAssignment(null)}>
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-xl font-bold text-text-dark">Assignment Details</h3>
          <button onClick={() => setViewingAssignment(null)}
            className="text-text-light hover:text-text-dark text-xl">&times;</button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-text-dark mb-2">{assignment.title}</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1 text-text-light">
                <FiBook className="w-4 h-4" />
                {assignment.course?.title || 'Course'}
              </span>
              <span className={`flex items-center gap-1 ${getDueDateColor(assignment.dueDate)} px-2.5 py-0.5 rounded-full text-xs font-bold`}>
                <FiCalendar className="w-3.5 h-3.5" />
                Due: {formatDate(assignment.dueDate)}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${assignment.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {assignment.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          {assignment.description && (
            <div>
              <p className="text-xs text-text-light font-medium uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-text-body whitespace-pre-line">{assignment.description}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-bg-light rounded-xl text-center">
              <p className="text-2xl font-bold text-primary">{assignment.totalMarks || '-'}</p>
              <p className="text-xs text-text-light mt-1">Total Marks</p>
            </div>
            <div className="p-4 bg-bg-light rounded-xl text-center">
              <p className="text-2xl font-bold text-green-600">{assignment.submissions?.length || 0}</p>
              <p className="text-xs text-text-light mt-1">Submissions</p>
            </div>
            <div className="p-4 bg-bg-light rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-600">{assignment.submissions?.filter(s => s.status === 'graded').length || 0}</p>
              <p className="text-xs text-text-light mt-1">Graded</p>
            </div>
          </div>

          {assignment.submissions?.length > 0 && (
            <div>
              <p className="text-xs text-text-light font-medium uppercase tracking-wider mb-2">Submissions</p>
              <div className="space-y-2">
                {assignment.submissions.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {sub.student?.studentName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-dark">{sub.student?.studentName || 'Unknown'}</p>
                        <p className="text-xs text-text-light">{sub.student?.studentId || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        sub.status === 'graded' ? 'bg-green-100 text-green-800' :
                        sub.status === 'late' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {sub.status}
                      </span>
                      {sub.score !== undefined && (
                        <span className="text-sm font-bold text-primary">{sub.score}/{assignment.totalMarks}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignment.attachments?.length > 0 && (
            <div>
              <p className="text-xs text-text-light font-medium uppercase tracking-wider mb-2">Attachments</p>
              <div className="space-y-2">
                {assignment.attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-bg-light rounded-xl">
                    <FiFile className="w-4 h-4 text-primary" />
                    <span className="text-sm text-text-dark">{att.name || 'Attachment'}</span>
                    {att.url && (
                      <a href={att.url} target="_blank" rel="noopener noreferrer"
                        className="ml-auto text-primary text-xs hover:underline font-medium">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-border-light flex gap-3">
          <button
            onClick={() => { setViewingAssignment(null); openEditModal(assignment); }}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            <FiEdit2 className="w-4 h-4 inline mr-1.5" />
            Edit Assignment
          </button>
          <button
            onClick={() => setViewingAssignment(null)}
            className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Create/Edit Assignment Modal
  const renderAssignmentForm = () => (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 pb-10 overflow-y-auto"
      onClick={() => setShowModal(false)}>
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg mx-4 relative"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-xl font-bold text-text-dark">
            {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
          </h3>
          <button onClick={() => setShowModal(false)}
            className="text-text-light hover:text-text-dark">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="e.g. Chapter 5 Homework"
              className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Course *</label>
            <select
              value={form.course}
              onChange={e => setForm(prev => ({ ...prev, course: e.target.value }))}
              required
              className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}{course.code ? ` (${course.code})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Due Date *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                required
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Total Marks</label>
              <input
                type="number"
                value={form.totalMarks}
                onChange={e => setForm(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 0 }))}
                min={0}
                className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Assignment instructions, requirements, etc."
              className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={e => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm text-text-dark font-medium">Published (visible to students)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-dark">Assignments</h2>
          <p className="text-sm text-text-light mt-1">
            {total > 0 ? `${total} assignment${total !== 1 ? 's' : ''} created` : 'Create and manage assignments for your courses'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
        >
          <FiPlus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            placeholder="Search assignments by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
          />
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16">
          <FiClipboard className="w-16 h-16 text-border-light mx-auto mb-4" />
          <p className="text-text-light font-medium">No assignments yet</p>
          <p className="text-sm text-text-light mt-2">
            {searchQuery
              ? 'No assignments match your search'
              : 'Create your first assignment to get started.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
            >
              <FiPlus className="w-4 h-4 inline mr-1.5" />
              Create Assignment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const totalSubmissions = assignment.submissions?.length || 0;
            return (
              <div
                key={assignment._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-border-light hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-dark text-lg truncate">{assignment.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      assignment.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-light">
                    {assignment.course?.title && (
                      <span className="flex items-center gap-1">
                        <FiClipboard className="w-4 h-4" />
                        {assignment.course.title}
                      </span>
                    )}
                    <span className={`flex items-center gap-1 ${getDueDateColor(assignment.dueDate)}`}>
                      <FiCalendar className="w-4 h-4" />
                      Due: {formatDate(assignment.dueDate)}
                    </span>
                    {totalSubmissions > 0 && (
                      <span className="text-text-body">
                        {totalSubmissions} submission{totalSubmissions !== 1 ? 's' : ''}
                      </span>
                    )}
                    {assignment.totalMarks && (
                      <span className="text-text-body">
                        {assignment.totalMarks} marks
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => viewAssignmentDetail(assignment)}
                    className="px-3 py-2 border border-border-light text-text-body rounded-lg hover:bg-bg-light transition-colors text-sm"
                    title="View Details"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(assignment)}
                    className="px-3 py-2 text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors text-sm"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment)}
                    className="px-3 py-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-light">
          <p className="text-sm text-text-light">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50 transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-border-light rounded-lg hover:bg-bg-light disabled:opacity-50 transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && renderAssignmentForm()}
      {viewingAssignment && renderAssignmentDetail(viewingAssignment)}
    </div>
  );
}

