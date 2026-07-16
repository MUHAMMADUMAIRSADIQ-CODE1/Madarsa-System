import { useState, useEffect, useCallback } from 'react';
import teacherService from '../../services/teacherService';

const defaultForm = {
  fullName: '', shortBio: '', biography: '', qualification: '', degree: '',
  experience: 0, specialization: '', subjects: [], teachingLanguages: [],
  country: '', city: '', timezone: '', email: '', phone: '', whatsapp: '',
  gender: '', dateOfBirth: '', nationality: '',
  linkedin: '', facebook: '', instagram: '', youtube: '', website: '',
  certificates: [], skills: [], awards: [],
  featured: false, availableForOnline: false, displayOrder: 0,
  seoTitle: '', seoDescription: '', seoKeywords: [], status: 'draft',
};

export default function AdminTeacherManagementSection() {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      const res = await teacherService.getAdminTeachers(params);
      setTeachers(res.data?.data || res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [searchQuery, statusFilter]);

  const loadStats = useCallback(async () => {
    try { const res = await teacherService.getTeacherStats(); setStats(res.data); } catch (_) {}
  }, []);

  useEffect(() => { loadTeachers(); loadStats(); }, [loadTeachers, loadStats]);

  function resetForm() {
    setForm(defaultForm);
    setProfileFile(null); setProfilePreview(null);
    setCoverFile(null); setCoverPreview(null);
    setKeywordInput(''); setNewSubject(''); setNewLanguage(''); setNewSkill('');
    setEditingId(null); setError(null); setSuccess(null);
  }

  function startEdit(teacher) {
    setForm({
      fullName: teacher.fullName || '', shortBio: teacher.shortBio || '',
      biography: teacher.biography || '', qualification: teacher.qualification || '',
      degree: teacher.degree || '', experience: teacher.experience || 0,
      specialization: teacher.specialization || '', subjects: teacher.subjects || [],
      teachingLanguages: teacher.teachingLanguages || [],
      country: teacher.country || '', city: teacher.city || '',
      timezone: teacher.timezone || '', email: teacher.email || '',
      phone: teacher.phone || '', whatsapp: teacher.whatsapp || '',
      gender: teacher.gender || '',
      dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split('T')[0] : '',
      nationality: teacher.nationality || '',
      linkedin: teacher.linkedin || '', facebook: teacher.facebook || '',
      instagram: teacher.instagram || '', youtube: teacher.youtube || '',
      website: teacher.website || '', certificates: teacher.certificates || [],
      skills: teacher.skills || [], awards: teacher.awards || [],
      featured: teacher.featured || false,
      availableForOnline: teacher.availableForOnline || false,
      displayOrder: teacher.displayOrder ?? 0,
      seoTitle: teacher.seoTitle || '', seoDescription: teacher.seoDescription || '',
      seoKeywords: teacher.seoKeywords || [], status: teacher.status || 'draft',
    });
    setEditingId(teacher._id);
    setProfilePreview(teacher.profilePhoto || null);
    setCoverPreview(teacher.coverPhoto || null);
    setProfileFile(null); setCoverFile(null);
    setView('form');
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function addArrayItem(field, value, setInput) {
    const v = value.trim();
    if (v && !form[field].includes(v)) {
      setForm((prev) => ({ ...prev, [field]: [...prev[field], v] }));
    }
    setInput('');
  }

  function removeArrayItem(field, item) {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((i) => i !== item) }));
  }

  function addCertificate() {
    setForm((prev) => ({ ...prev, certificates: [...prev.certificates, { title: '', issuer: '', year: '', url: '' }] }));
  }
  function updateCertificate(idx, field, value) {
    setForm((prev) => {
      const certs = [...prev.certificates]; certs[idx] = { ...certs[idx], [field]: value };
      return { ...prev, certificates: certs };
    });
  }
  function removeCertificate(idx) {
    setForm((prev) => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== idx) }));
  }

  function addAward() {
    setForm((prev) => ({ ...prev, awards: [...prev.awards, { title: '', year: '', description: '' }] }));
  }
  function updateAward(idx, field, value) {
    setForm((prev) => {
      const awds = [...prev.awards]; awds[idx] = { ...awds[idx], [field]: value };
      return { ...prev, awards: awds };
    });
  }
  function removeAward(idx) {
    setForm((prev) => ({ ...prev, awards: prev.awards.filter((_, i) => i !== idx) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      setSaving(true);
      const payload = { ...form };
      if (profileFile) payload.profilePhoto = profileFile;
      if (coverFile) payload.coverPhoto = coverFile;
      if (editingId) {
        await teacherService.updateTeacher(editingId, payload);
        setSuccess('Teacher updated successfully');
      } else {
        await teacherService.createTeacher(payload);
        setSuccess('Teacher created successfully');
      }
      resetForm(); setView('list');
      loadTeachers(); loadStats();
    } catch (err) { setError(err.message || 'Failed to save teacher'); }
    finally { setSaving(false); }
  }

  async function handlePublish(id) {
    try { setSaving(true); await teacherService.publishTeacher(id); setSuccess('Teacher published'); loadTeachers(); loadStats(); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  async function handleUnpublish(id) {
    try { setSaving(true); await teacherService.unpublishTeacher(id); setSuccess('Teacher unpublished'); loadTeachers(); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  async function handleArchive(id) {
    if (!confirm('Archive this teacher?')) return;
    try { await teacherService.archiveTeacher(id); setSuccess('Teacher archived'); loadTeachers(); loadStats(); }
    catch (err) { setError(err.message); }
  }
  async function handleRestore(id) {
    try { await teacherService.restoreTeacher(id); setSuccess('Teacher restored'); loadTeachers(); }
    catch (err) { setError(err.message); }
  }
  async function handleDuplicate(id) {
    try { await teacherService.duplicateTeacher(id); setSuccess('Teacher duplicated'); loadTeachers(); }
    catch (err) { setError(err.message); }
  }
  async function handleDelete(id) {
    if (!confirm('Delete this teacher? It will be soft-deleted.')) return;
    try { await teacherService.deleteTeacher(id); setSuccess('Teacher deleted'); loadTeachers(); loadStats(); }
    catch (err) { setError(err.message); }
  }

  const StatCard = ({ label, value, color }) => (
    <div className="bg-white rounded-xl border border-border-light p-4">
      <p className="text-sm text-text-light">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-text-dark'}`}>{value}</p>
    </div>
  );

  const statusBadge = (status) => {
    const map = { published: 'bg-green-100 text-green-800', draft: 'bg-orange-100 text-orange-800', archived: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  if (view === 'form') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">{editingId ? 'Edit Teacher' : 'Create Teacher'}</h2>
            <p className="text-sm text-text-light mt-1">{editingId ? 'Update teacher details' : 'Add a new teacher'}</p>
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
                <label className="block text-sm font-medium text-text-dark mb-1">Full Name *</label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Enter full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Nationality</label>
                  <input type="text" name="nationality" value={form.nationality} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Timezone</label>
                  <input type="text" name="timezone" value={form.timezone} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. Asia/Karachi" />
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

              <h3 className="font-heading font-semibold text-text-dark pt-2">Contact</h3>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">WhatsApp</label>
                  <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>

              <h3 className="font-heading font-semibold text-text-dark pt-2">Professional</h3>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Short Bio</label>
                <textarea name="shortBio" value={form.shortBio} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none" placeholder="Brief intro (max 300 chars)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Biography</label>
                <textarea name="biography" value={form.biography} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none" placeholder="Detailed biography" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Qualification</label>
                  <input type="text" name="qualification" value={form.qualification} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Degree</label>
                  <input type="text" name="degree" value={form.degree} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Experience (Years)</label>
                  <input type="number" name="experience" value={form.experience} onChange={handleChange} min={0} max={70} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Specialization</label>
                <input type="text" name="specialization" value={form.specialization} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. Quran, Tajweed, Arabic" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Subjects</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('subjects', newSubject, setNewSubject))} className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Add subject" />
                  <button type="button" onClick={() => addArrayItem('subjects', newSubject, setNewSubject)} className="px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-dark">Add</button>
                </div>
                {form.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.subjects.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-bg-light rounded-full text-xs font-medium text-text-dark">
                        {s}
                        <button type="button" onClick={() => removeArrayItem('subjects', s)} className="text-red-500 hover:text-red-700">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Teaching Languages</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('teachingLanguages', newLanguage, setNewLanguage))} className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Add language" />
                  <button type="button" onClick={() => addArrayItem('teachingLanguages', newLanguage, setNewLanguage)} className="px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-dark">Add</button>
                </div>
                {form.teachingLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.teachingLanguages.map((l) => (
                      <span key={l} className="inline-flex items-center gap-1 px-3 py-1 bg-bg-light rounded-full text-xs font-medium text-text-dark">
                        {l}
                        <button type="button" onClick={() => removeArrayItem('teachingLanguages', l)} className="text-red-500 hover:text-red-700">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('skills', newSkill, setNewSkill))} className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Add skill" />
                  <button type="button" onClick={() => addArrayItem('skills', newSkill, setNewSkill)} className="px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-dark">Add</button>
                </div>
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-bg-light rounded-full text-xs font-medium text-text-dark">
                        {s}
                        <button type="button" onClick={() => removeArrayItem('skills', s)} className="text-red-500 hover:text-red-700">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-text-dark">Media</h3>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setProfileFile(f); setProfilePreview(URL.createObjectURL(f)); } }} className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                {profilePreview && <img src={profilePreview} alt="Profile preview" className="mt-2 h-32 w-32 rounded-full object-cover border-4 border-border-light" />}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Cover Photo</label>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }} className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                {coverPreview && <img src={coverPreview} alt="Cover preview" className="mt-2 h-24 w-full object-cover rounded-lg border border-border-light" />}
              </div>

              <h3 className="font-heading font-semibold text-text-dark pt-2">Certificates</h3>
              {form.certificates.map((cert, idx) => (
                <div key={idx} className="p-3 border border-border-light rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-dark">Certificate #{idx + 1}</span>
                    <button type="button" onClick={() => removeCertificate(idx)} className="text-red-500 text-xs hover:underline">Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={cert.title} onChange={(e) => updateCertificate(idx, 'title', e.target.value)} placeholder="Title" className="px-3 py-1.5 border border-border-light rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                    <input type="text" value={cert.issuer} onChange={(e) => updateCertificate(idx, 'issuer', e.target.value)} placeholder="Issuer" className="px-3 py-1.5 border border-border-light rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                    <input type="number" value={cert.year} onChange={(e) => updateCertificate(idx, 'year', e.target.value)} placeholder="Year" className="px-3 py-1.5 border border-border-light rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                    <input type="url" value={cert.url} onChange={(e) => updateCertificate(idx, 'url', e.target.value)} placeholder="URL" className="px-3 py-1.5 border border-border-light rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCertificate} className="text-primary text-sm font-medium hover:underline">+ Add Certificate</button>

              <h3 className="font-heading font-semibold text-text-dark pt-2">Awards</h3>
              {form.awards.map((award, idx) => (
                <div key={idx} className="p-3 border border-border-light rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-dark">Award #{idx + 1}</span>
                    <button type="button" onClick={() => removeAward(idx)} className="text-red-500 text-xs hover:underline">Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={award.title} onChange={(e) => updateAward(idx, 'title', e.target.value)} placeholder="Title" className="px-3 py-1.5 border border-border-light rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                    <input type="number" value={award.year} onChange={(e) => updateAward(idx, 'year', e.target.value)} placeholder="Year" className="px-3 py-1.5 border border-border-light rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <textarea value={award.description} onChange={(e) => updateAward(idx, 'description', e.target.value)} placeholder="Description" rows={2} className="w-full px-3 py-1.5 border border-border-light rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
              ))}
              <button type="button" onClick={addAward} className="text-primary text-sm font-medium hover:underline">+ Add Award</button>

              <h3 className="font-heading font-semibold text-text-dark pt-2">Social Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">LinkedIn</label>
                  <input type="url" name="linkedin" value={form.linkedin} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Facebook</label>
                  <input type="url" name="facebook" value={form.facebook} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Instagram</label>
                  <input type="url" name="instagram" value={form.instagram} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">YouTube</label>
                  <input type="url" name="youtube" value={form.youtube} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Website</label>
                <input type="url" name="website" value={form.website} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              </div>

              <h3 className="font-heading font-semibold text-text-dark pt-2">Flags & Display</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 text-primary rounded border-border-light" />
                  <span className="text-sm text-text-dark font-medium">Featured Teacher</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="availableForOnline" checked={form.availableForOnline} onChange={handleChange} className="w-4 h-4 text-primary rounded border-border-light" />
                  <span className="text-sm text-text-dark font-medium">Available for Online Classes</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Display Order</label>
                <input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} min={0} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              </div>

              <h3 className="font-heading font-semibold text-text-dark pt-2">SEO</h3>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">SEO Title</label>
                <input type="text" name="seoTitle" value={form.seoTitle} onChange={handleChange} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">SEO Description</label>
                <textarea name="seoDescription" value={form.seoDescription} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">SEO Keywords</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('seoKeywords', keywordInput, setKeywordInput))} className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Add keyword" />
                  <button type="button" onClick={() => addArrayItem('seoKeywords', keywordInput, setKeywordInput)} className="px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-dark">Add</button>
                </div>
                {form.seoKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.seoKeywords.map((kw) => (
                      <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 bg-bg-light rounded-full text-xs font-medium text-text-dark">
                        {kw}
                        <button type="button" onClick={() => removeArrayItem('seoKeywords', kw)} className="text-red-500 hover:text-red-700">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-border-light">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update Teacher' : 'Create Teacher'}
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
          <StatCard label="Total Teachers" value={stats.total} color="text-text-dark" />
          <StatCard label="Published" value={stats.published} color="text-green-600" />
          <StatCard label="Draft" value={stats.draft} color="text-orange-600" />
          <StatCard label="Archived" value={stats.archived} color="text-gray-600" />
          <StatCard label="Featured" value={stats.featured} color="text-primary" />
          <StatCard label="Available Online" value={stats.availableForOnline} color="text-blue-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">Teacher Management</h2>
            <p className="text-sm text-text-light mt-1">Manage all teachers on the platform</p>
          </div>
          <button onClick={() => { resetForm(); setView('form'); }} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">+ Add Teacher</button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, qualification, specialization..." className="flex-1 px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">No teachers found</p>
            <button onClick={() => { resetForm(); setView('form'); }} className="mt-3 px-5 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark text-sm transition-colors">Add your first teacher</button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
            <table className="w-full min-w-[600px]">
              <thead className="border-b-2 border-border-light">
                <tr>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm">Name</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm hidden md:table-cell">Qualification</th>
                  <th className="text-left p-3 font-semibold text-text-dark text-sm hidden sm:table-cell">Specialization</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm hidden lg:table-cell">Experience</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Status</th>
                  <th className="text-center p-3 font-semibold text-text-dark text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-bg-light transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {teacher.profilePhoto ? (
                          <img src={teacher.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {teacher.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-text-dark text-sm">
                            {teacher.fullName}
                            {teacher.featured && <span className="ml-1.5 text-yellow-500 text-xs" title="Featured">★</span>}
                          </p>
                          <p className="text-xs text-text-light">{teacher.country || teacher.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-text-body hidden md:table-cell">{teacher.qualification || '-'}</td>
                    <td className="p-3 text-sm text-text-body hidden sm:table-cell">{teacher.specialization || '-'}</td>
                    <td className="p-3 text-center text-sm text-text-body hidden lg:table-cell">{teacher.experience ? `${teacher.experience}y` : '-'}</td>
                    <td className="p-3 text-center">{statusBadge(teacher.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button onClick={() => startEdit(teacher)} className="text-primary text-xs hover:underline font-medium">Edit</button>
                        {teacher.status === 'published' ? (
                          <button onClick={() => handleUnpublish(teacher._id)} className="text-orange-500 text-xs hover:underline font-medium">Unpublish</button>
                        ) : teacher.status === 'archived' ? (
                          <button onClick={() => handleRestore(teacher._id)} className="text-blue-500 text-xs hover:underline font-medium">Restore</button>
                        ) : (
                          <button onClick={() => handlePublish(teacher._id)} className="text-green-600 text-xs hover:underline font-medium">Publish</button>
                        )}
                        <button onClick={() => handleDuplicate(teacher._id)} className="text-gray-500 text-xs hover:underline font-medium">Copy</button>
                        {teacher.status !== 'archived' && <button onClick={() => handleArchive(teacher._id)} className="text-gray-500 text-xs hover:underline font-medium">Archive</button>}
                        <button onClick={() => handleDelete(teacher._id)} className="text-red-500 text-xs hover:underline font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
