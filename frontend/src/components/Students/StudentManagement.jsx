import { useState, useEffect, useCallback } from 'react';
import studentService from '../../services/studentService';
import admissionService from '../../services/admissionService';

const defaultForm = {
  studentName: '', fatherName: '', guardianName: '', gender: '', dateOfBirth: '',
  email: '', phone: '', whatsapp: '', country: '', city: '', address: '',
  nationality: '', cnicPassport: '', guardianPhone: '', guardianEmail: '',
  previousEducation: '', currentQualification: '', selectedCourse: '',
  preferredBatch: '', preferredTiming: '', learningMode: 'online',
  reasonForJoining: '', previousQuranEducation: '',
  rollNumber: '', enrollmentNumber: '', status: 'active',
};

export default function AdminStudentManagementSection() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [admissions, setAdmissions] = useState([]);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [enrollModal, setEnrollModal] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      const res = await studentService.getAdminStudents(params);
      setStudents(res.data?.data || res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [searchQuery, statusFilter]);

  const loadStats = useCallback(async () => {
    try { const res = await studentService.getStudentStats(); setStats(res.data); } catch (_) {}
  }, []);

  const loadAdmissions = useCallback(async () => {
    try {
      const res = await admissionService.getAdminAdmissions({ status: 'approved', limit: 100 });
      const items = res.data?.data || [];
      setAdmissions(items.filter((a) => !a.convertedToStudent));
    } catch (_) {}
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      const courseService = await import('../../services/courseService');
      const res = await courseService.default.getAdminCourses({ limit: 100 });
      setCourses(res.data?.data || res.data || []);
    } catch (_) {}
  }, []);

  useEffect(() => { loadStudents(); loadStats(); }, [loadStudents, loadStats]);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null); setError(null); setSuccess(null);
  }

  function startEdit(student) {
    setForm({
      studentName: student.studentName || '', fatherName: student.fatherName || '',
      guardianName: student.guardianName || '', gender: student.gender || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      email: student.email || '', phone: student.phone || '',
      whatsapp: student.whatsapp || '', country: student.country || '',
      city: student.city || '', address: student.address || '',
      nationality: student.nationality || '', cnicPassport: student.cnicPassport || '',
      guardianPhone: student.guardianPhone || '', guardianEmail: student.guardianEmail || '',
      previousEducation: student.previousEducation || '',
      currentQualification: student.currentQualification || '',
      selectedCourse: student.selectedCourse?._id || student.selectedCourse || '',
      preferredBatch: student.preferredBatch || '',
      preferredTiming: student.preferredTiming || '',
      learningMode: student.learningMode || 'online',
      reasonForJoining: student.reasonForJoining || '',
      previousQuranEducation: student.previousQuranEducation || '',
      rollNumber: student.rollNumber || '', enrollmentNumber: student.enrollmentNumber || '',
      status: student.status || 'active',
    });
    setEditingId(student._id);
    setView('form');
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
      if (editingId) {
        await studentService.updateStudent(editingId, form);
        setSuccess('Student updated successfully');
      } else {
        await studentService.createStudent(form);
        setSuccess('Student created successfully');
      }
      resetForm(); setView('list');
      loadStudents(); loadStats();
    } catch (err) { setError(err.message || 'Failed to save student'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this student? It will be soft-deleted.')) return;
    try { await studentService.deleteStudent(id); setSuccess('Student deleted'); loadStudents(); loadStats(); }
    catch (err) { setError(err.message); }
  }

  async function handleRestore(id) {
    try { await studentService.restoreStudent(id); setSuccess('Student restored'); loadStudents(); }
    catch (err) { setError(err.message); }
  }

  async function handleActivate(id) {
    try { await studentService.activateStudent(id); setSuccess('Student activated'); loadStudents(); loadStats(); }
    catch (err) { setError(err.message); }
  }

  async function handleDeactivate(id) {
    try { await studentService.deactivateStudent(id); setSuccess('Student deactivated'); loadStudents(); loadStats(); }
    catch (err) { setError(err.message); }
  }

  async function handleEnroll(e) {
    e.preventDefault();
    if (!enrollModal || !selectedCourse) return;
    try {
      setSaving(true);
      await studentService.enrollCourse(enrollModal, selectedCourse);
      setSuccess('Student enrolled in course successfully');
      setEnrollModal(null); setSelectedCourse('');
      loadStudents();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleConvertFromAdmission(admissionId) {
    try {
      setSaving(true);
      await admissionService.convertToStudent(admissionId);
      setSuccess('Admission converted to student successfully');
      setShowConvertModal(false);
      loadStudents(); loadStats(); loadAdmissions();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const StatCard = ({ label, value, color }) => (
    <div className="bg-white rounded-xl border border-border-light p-4">
      <p className="text-sm text-text-light">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-text-dark'}`}>{value}</p>
    </div>
  );

  const statusBadge = (status) => {
    const map = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-orange-100 text-orange-800',
      graduated: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800',
      transferred: 'bg-purple-100 text-purple-800',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  if (view === 'form') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">{editingId ? 'Edit Student' : 'Create Student'}</h2>
            <p className="text-sm text-text-light mt-1">{editingId ? 'Update student details' : 'Add a new student manually'}</p>
          </div>
          <button onClick={() => { resetForm(); setView('list'); }} className="px-4 py-2 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors text-sm">Back to List</button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-text-dark">Personal Information</h3>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Student Name *</label>
                <input type="text" name="studentName" value={form.studentName} onChange={handleChange} required className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Enter student name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Father Name</label>
                  <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Guardian Name</label>
                  <input type="text" name="guardianName" value={form.guardianName} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Gender *</label>
                  <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Date of Birth *</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Nationality</label>
                  <input type="text" name="nationality" value={form.nationality} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">CNIC/Passport</label>
                  <input type="text" name="cnicPassport" value={form.cnicPassport} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Country</label>
                  <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>

              <h3 className="font-heading font-semibold text-text-dark pt-2">Contact</h3>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Phone *</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} required className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">WhatsApp</label>
                  <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Guardian Phone</label>
                  <input type="tel" name="guardianPhone" value={form.guardianPhone} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Guardian Email</label>
                  <input type="email" name="guardianEmail" value={form.guardianEmail} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-text-dark">Academic Information</h3>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Previous Education</label>
                <textarea name="previousEducation" value={form.previousEducation} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Current Qualification</label>
                <textarea name="currentQualification" value={form.currentQualification} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Previous Quran Education</label>
                <textarea name="previousQuranEducation" value={form.previousQuranEducation} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Reason for Joining</label>
                <textarea name="reasonForJoining" value={form.reasonForJoining} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Selected Course</label>
                  <input type="text" name="selectedCourse" value={form.selectedCourse} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Course ID or name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Learning Mode</label>
                  <select name="learningMode" value={form.learningMode} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                    <option value="online">Online</option>
                    <option value="physical">Physical</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Preferred Batch</label>
                  <input type="text" name="preferredBatch" value={form.preferredBatch} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Preferred Timing</label>
                  <input type="text" name="preferredTiming" value={form.preferredTiming} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>

              <h3 className="font-heading font-semibold text-text-dark pt-2">Administrative</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Roll Number</label>
                  <input type="text" name="rollNumber" value={form.rollNumber} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Enrollment Number</label>
                  <input type="text" name="enrollmentNumber" value={form.enrollmentNumber} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-border-light">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update Student' : 'Create Student'}
            </button>
            <button type="button" onClick={() => { resetForm(); setView('list'); }} className="px-6 py-2.5 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Students" value={stats.total} color="text-text-dark" />
          <StatCard label="Active" value={stats.active} color="text-green-600" />
          <StatCard label="Inactive" value={stats.inactive} color="text-orange-600" />
          <StatCard label="Graduated" value={stats.graduated} color="text-blue-600" />
          <StatCard label="Suspended" value={stats.suspended} color="text-red-600" />
          <StatCard label="Transferred" value={stats.transferred} color="text-purple-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">Student Management</h2>
            <p className="text-sm text-text-light mt-1">Manage all students on the platform</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { loadAdmissions(); setShowConvertModal(true); }} className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm">+ Convert from Admission</button>
            <button onClick={() => { resetForm(); setView('form'); }} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">+ Add Student</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, ID, phone, email..." className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">No students found</p>
            <div className="flex justify-center gap-3 mt-3">
              <button onClick={() => { loadAdmissions(); setShowConvertModal(true); }} className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm transition-colors">Convert from Admission</button>
              <button onClick={() => { resetForm(); setView('form'); }} className="px-5 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark text-sm transition-colors">Add your first student</button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
            <table className="w-full min-w-[600px]">
              <thead className="border-b-2 border-border-light">
                <tr>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Student ID</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Name</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm hidden sm:table-cell">Contact</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm hidden md:table-cell">Course</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Status</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-bg-light transition-colors">
                    <td className="p-3 text-sm font-mono text-text-dark">{student.studentId || '-'}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {student.studentName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-text-dark text-sm">{student.studentName}</p>
                          <p className="text-xs text-text-light">{student.fatherName ? `s/o ${student.fatherName}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-text-body hidden sm:table-cell">
                      <div>{student.email || ''}</div>
                      <div className="text-xs text-text-light">{student.phone || ''}</div>
                    </td>
                    <td className="p-3 text-sm text-text-body hidden md:table-cell">
                      {student.selectedCourse?.title || student.selectedCourse?.name || '-'}
                    </td>
                    <td className="p-3 text-center">{statusBadge(student.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button onClick={() => startEdit(student)} className="text-primary text-xs hover:underline font-medium">Edit</button>
                        {student.status === 'active' ? (
                          <button onClick={() => handleDeactivate(student._id)} className="text-orange-500 text-xs hover:underline font-medium">Deactivate</button>
                        ) : (
                          <button onClick={() => handleActivate(student._id)} className="text-green-600 text-xs hover:underline font-medium">Activate</button>
                        )}
                        <button onClick={() => { loadCourses(); setEnrollModal(student._id); setSelectedCourse(''); }} className="text-blue-500 text-xs hover:underline font-medium">Enroll</button>
                        <button onClick={() => handleDelete(student._id)} className="text-red-500 text-xs hover:underline font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Convert from Admission Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowConvertModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-bold text-text-dark">Convert Admission to Student</h3>
              <button onClick={() => setShowConvertModal(false)} className="text-text-light hover:text-text-dark text-xl">&times;</button>
            </div>
            {admissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-light">No approved admissions available for conversion.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {admissions.map((admission) => (
                  <div key={admission._id} className="flex items-center justify-between p-3 border border-border-light rounded-xl hover:bg-bg-light">
                    <div>
                      <p className="font-semibold text-text-dark text-sm">{admission.studentName}</p>
                      <p className="text-xs text-text-light">{admission.applicationNumber} | {admission.email || admission.phone}</p>
                    </div>
                    <button
                      onClick={() => handleConvertFromAdmission(admission._id)}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? 'Converting...' : 'Convert'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enroll in Course Modal */}
      {enrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setEnrollModal(null); setSelectedCourse(''); }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-bold text-text-dark">Enroll in Course</h3>
              <button onClick={() => { setEnrollModal(null); setSelectedCourse(''); }} className="text-text-light hover:text-text-dark text-xl">&times;</button>
            </div>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Select Course</label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Choose a course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title || c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setEnrollModal(null); setSelectedCourse(''); }} className="px-4 py-2 border border-border-light text-text-light rounded-xl hover:bg-bg-light text-sm">Cancel</button>
                <button type="submit" disabled={saving || !selectedCourse} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50">
                  {saving ? 'Enrolling...' : 'Enroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
