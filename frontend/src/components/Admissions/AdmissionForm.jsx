import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import admissionService from '../../services/admissionService';
import courseService from '../../services/courseService';

const STORAGE_KEY = 'admission_form_draft';

const STEPS = [
  { id: 1, label: 'Student Info' },
  { id: 2, label: 'Contact' },
  { id: 3, label: 'Education' },
  { id: 4, label: 'Course' },
  { id: 5, label: 'Documents' },
  { id: 6, label: 'Review' },
];

const INITIAL_FORM = {
  studentName: '', fatherName: '', guardianName: '', gender: '', dateOfBirth: '',
  email: '', phone: '', whatsapp: '', country: '', city: '', address: '',
  previousEducation: '', currentQualification: '', previousQuranEducation: '',
  selectedCourse: '', preferredBatch: '', preferredTiming: '', learningMode: 'online',
  studentPhoto: null, cnicFront: null, cnicBack: null, passport: null,
  educationalCertificates: [], additionalDocuments: [],
};

export default function AdmissionForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_FORM, ...JSON.parse(saved) } : INITIAL_FORM;
    } catch { return INITIAL_FORM; }
  });
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [coursesLoading, setCoursesLoading] = useState(true);
  const topRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        setCoursesLoading(true);
        const res = await courseService.getPublishedCourses();
        setCourses(res.data?.data || []);
      } catch (_) {} finally {
        setCoursesLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const toSave = {};
    for (const [key, val] of Object.entries(form)) {
      if (!(val instanceof File) && !Array.isArray(val)) {
        toSave[key] = val;
      }
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); } catch (_) {}
  }, [form]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      if (name === 'educationalCertificates' || name === 'additionalDocuments') {
        setForm((prev) => ({ ...prev, [name]: [...prev[name], ...Array.from(files)] }));
      } else {
        setForm((prev) => ({ ...prev, [name]: files[0] || null }));
      }
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  function removeFile(field, index) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }

  function removeSingleFile(field) {
    setForm((prev) => ({ ...prev, [field]: null }));
  }

  function validateStep(s) {
    const errs = {};
    if (s === 1) {
      if (!form.studentName?.trim()) errs.studentName = 'Full name is required';
      if (!form.gender) errs.gender = 'Gender is required';
      if (!form.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    }
    if (s === 2) {
      if (!form.phone?.trim()) errs.phone = 'Phone is required';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    }
    if (s === 4) {
      if (!form.selectedCourse) errs.selectedCourse = 'Please select a course';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 6));
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 1));
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSubmit() {
    if (!validateStep(6)) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = new FormData();
      const fileFields = ['studentPhoto', 'cnicFront', 'cnicBack', 'passport', 'educationalCertificates', 'additionalDocuments'];
      for (const [key, val] of Object.entries(form)) {
        if (val instanceof File) {
          payload.append(key, val);
        } else if (key === 'educationalCertificates' && Array.isArray(val)) {
          val.forEach((f) => payload.append('educationalCertificates', f));
        } else if (key === 'additionalDocuments' && Array.isArray(val)) {
          val.forEach((f) => payload.append('additionalDocuments', f));
        } else if (val !== undefined && val !== null && val !== '') {
          payload.append(key, val);
        }
      }
      const res = await admissionService.submitApplication(payload);
      setResult(res.data || res);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-bg-light pt-28 lg:pt-32 pb-16">
        <div className="max-w-xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-heading text-2xl font-bold text-text-dark mb-2">Application Submitted!</h2>
            <p className="text-text-light mb-6">Your application has been received successfully.</p>

            <div className="bg-bg-light rounded-xl p-6 space-y-3 text-left">
              <div className="flex justify-between"><span className="text-sm text-text-light">Application #</span><span className="text-sm font-mono font-bold text-text-dark">{result.applicationNumber}</span></div>
              <div className="flex justify-between"><span className="text-sm text-text-light">Student Name</span><span className="text-sm font-semibold text-text-dark">{result.studentName}</span></div>
              <div className="flex justify-between"><span className="text-sm text-text-light">Date</span><span className="text-sm text-text-dark">{new Date(result.createdAt || Date.now()).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-text-light">Status</span><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Pending</span></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <button onClick={() => { navigator.clipboard.writeText(result.applicationNumber); }} className="px-5 py-2.5 border border-border-light rounded-xl text-sm font-medium hover:bg-bg-light transition-colors">
                Copy Application #
              </button>
              <button onClick={() => window.print()} className="px-5 py-2.5 border border-border-light rounded-xl text-sm font-medium hover:bg-bg-light transition-colors">
                Print
              </button>
              <button onClick={() => navigate('/admissions')} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                Back to Admissions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderProgress() {
    return (
      <div className="flex items-center justify-center gap-1 sm:gap-4 mb-6 sm:mb-10 overflow-x-auto pb-2 -mx-2 sm:mx-0 px-2 sm:px-0">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center flex-shrink-0">
            <div className={`flex items-center gap-1 sm:gap-2 ${idx < step ? 'cursor-pointer' : ''}`} onClick={() => idx < step && setStep(s.id)}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                s.id === step ? 'bg-primary text-white' : s.id < step ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {s.id < step ? (
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${s.id === step ? 'text-primary' : s.id < step ? 'text-green-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-3 sm:w-6 md:w-12 h-0.5 mx-0.5 sm:mx-2 ${s.id < step ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
  }

  function inputClass(name) {
    return `w-full px-4 py-2.5 border rounded-xl outline-none transition-colors text-sm ${
      errors[name] ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-border-light focus:ring-2 focus:ring-primary focus:border-primary'
    }`;
  }

  function renderField(label, name, type = 'text', opts = {}) {
    return (
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">{label}{opts.required && <span className="text-red-500 ml-0.5">*</span>}</label>
        {type === 'select' ? (
          <select name={name} value={form[name] || ''} onChange={handleChange} className={inputClass(name)}>
            <option value="">{opts.placeholder || 'Select...'}</option>
            {opts.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea name={name} value={form[name] || ''} onChange={handleChange} rows={opts.rows || 3} className={inputClass(name)} placeholder={opts.placeholder} />
        ) : type === 'file' ? (
          <div>
            <input type="file" name={name} onChange={handleChange} multiple={opts.multiple} accept="image/jpeg,image/png,image/webp,application/pdf" className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
          </div>
        ) : (
          <input type={type} name={name} value={form[name] || ''} onChange={handleChange} className={inputClass(name)} placeholder={opts.placeholder} />
        )}
        {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  function renderStep() {
    return (
      <div className="space-y-5">
        {step === 1 && (
          <>
            <h3 className="font-heading font-semibold text-lg text-text-dark">Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField('Full Name', 'studentName', 'text', { required: true, placeholder: 'Enter full name' })}
              {renderField('Father Name', 'fatherName', 'text', { placeholder: 'Enter father name' })}
              {renderField('Guardian Name', 'guardianName', 'text', { placeholder: 'Enter guardian name' })}
              {renderField('Gender', 'gender', 'select', { required: true, options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }] })}
              {renderField('Date of Birth', 'dateOfBirth', 'date', { required: true })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="font-heading font-semibold text-lg text-text-dark">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField('Email', 'email', 'email', { placeholder: 'email@example.com' })}
              {renderField('Phone', 'phone', 'tel', { required: true, placeholder: '+1234567890' })}
              {renderField('WhatsApp', 'whatsapp', 'tel', { placeholder: '+1234567890' })}
              {renderField('Country', 'country', 'text', { placeholder: 'Your country' })}
              {renderField('City', 'city', 'text', { placeholder: 'Your city' })}
            </div>
            {renderField('Complete Address', 'address', 'textarea', { rows: 3, placeholder: 'Street, area, postal code...' })}
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="font-heading font-semibold text-lg text-text-dark">Education</h3>
            <div className="space-y-4">
              {renderField('Previous Education', 'previousEducation', 'textarea', { rows: 3, placeholder: 'Describe your previous education (school, madrasa, etc.)' })}
              {renderField('Current Qualification', 'currentQualification', 'textarea', { rows: 3, placeholder: 'Your current qualification level' })}
              {renderField('Previous Quran Education', 'previousQuranEducation', 'textarea', { rows: 3, placeholder: 'Any previous Quranic studies (Nazra, Hifz, Tajweed, etc.)' })}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="font-heading font-semibold text-lg text-text-dark">Course Selection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Select Course <span className="text-red-500">*</span></label>
                <select name="selectedCourse" value={form.selectedCourse} onChange={handleChange} className={inputClass('selectedCourse')} disabled={coursesLoading}>
                  <option value="">{coursesLoading ? 'Loading courses...' : 'Select a course'}</option>
                  {courses.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                  ))}
                </select>
                {errors.selectedCourse && <p className="text-xs text-red-500 mt-1">{errors.selectedCourse}</p>}
              </div>
              {renderField('Preferred Batch', 'preferredBatch', 'text', { placeholder: 'e.g. Morning, Evening' })}
              {renderField('Preferred Timing', 'preferredTiming', 'text', { placeholder: 'e.g. 9:00 AM - 11:00 AM' })}
              {renderField('Learning Mode', 'learningMode', 'select', {
                options: [
                  { value: 'online', label: 'Online' },
                  { value: 'physical', label: 'Physical' },
                  { value: 'both', label: 'Both' },
                ],
              })}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h3 className="font-heading font-semibold text-lg text-text-dark">Documents</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Student Photo</label>
                  <input type="file" name="studentPhoto" onChange={handleChange} accept="image/jpeg,image/png,image/webp" className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                  {form.studentPhoto instanceof File && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-text-light">{form.studentPhoto.name}</span>
                      <button onClick={() => removeSingleFile('studentPhoto')} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">CNIC Front</label>
                  <input type="file" name="cnicFront" onChange={handleChange} accept="image/jpeg,image/png,image/webp,application/pdf" className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                  {form.cnicFront instanceof File && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-text-light">{form.cnicFront.name}</span>
                      <button onClick={() => removeSingleFile('cnicFront')} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">CNIC Back</label>
                  <input type="file" name="cnicBack" onChange={handleChange} accept="image/jpeg,image/png,image/webp,application/pdf" className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                  {form.cnicBack instanceof File && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-text-light">{form.cnicBack.name}</span>
                      <button onClick={() => removeSingleFile('cnicBack')} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Passport</label>
                  <input type="file" name="passport" onChange={handleChange} accept="image/jpeg,image/png,image/webp,application/pdf" className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                  {form.passport instanceof File && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-text-light">{form.passport.name}</span>
                      <button onClick={() => removeSingleFile('passport')} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Educational Certificates</label>
                <input type="file" name="educationalCertificates" onChange={handleChange} multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                {form.educationalCertificates.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {form.educationalCertificates.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-text-light bg-bg-light rounded-lg px-3 py-1.5">
                        <span>{f.name}</span>
                        <button onClick={() => removeFile('educationalCertificates', i)} className="text-red-500 hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Additional Documents</label>
                <input type="file" name="additionalDocuments" onChange={handleChange} multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                {form.additionalDocuments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {form.additionalDocuments.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-text-light bg-bg-light rounded-lg px-3 py-1.5">
                        <span>{f.name}</span>
                        <button onClick={() => removeFile('additionalDocuments', i)} className="text-red-500 hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h3 className="font-heading font-semibold text-lg text-text-dark">Review Your Application</h3>
            <div className="space-y-4">
              <div className="bg-bg-light rounded-xl p-4 sm:p-5 space-y-3">
                <h4 className="font-medium text-sm text-text-dark">Student Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <ReviewItem label="Full Name" value={form.studentName} />
                  <ReviewItem label="Father Name" value={form.fatherName} />
                  <ReviewItem label="Guardian Name" value={form.guardianName} />
                  <ReviewItem label="Gender" value={form.gender} />
                  <ReviewItem label="Date of Birth" value={form.dateOfBirth} />
                </div>
              </div>
              <div className="bg-bg-light rounded-xl p-4 sm:p-5 space-y-3">
                <h4 className="font-medium text-sm text-text-dark">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <ReviewItem label="Email" value={form.email} />
                  <ReviewItem label="Phone" value={form.phone} />
                  <ReviewItem label="WhatsApp" value={form.whatsapp} />
                  <ReviewItem label="Country" value={form.country} />
                  <ReviewItem label="City" value={form.city} />
                </div>
                <ReviewItem label="Address" value={form.address} />
              </div>
              <div className="bg-bg-light rounded-xl p-5 space-y-3">
                <h4 className="font-medium text-sm text-text-dark">Education</h4>
                <ReviewItem label="Previous Education" value={form.previousEducation} />
                <ReviewItem label="Current Qualification" value={form.currentQualification} />
                <ReviewItem label="Previous Quran Education" value={form.previousQuranEducation} />
              </div>
              <div className="bg-bg-light rounded-xl p-4 sm:p-5 space-y-3">
                <h4 className="font-medium text-sm text-text-dark">Course Selection</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <ReviewItem label="Course" value={courses.find((c) => (c._id || c.id) === form.selectedCourse)?.title || form.selectedCourse} />
                  <ReviewItem label="Preferred Batch" value={form.preferredBatch} />
                  <ReviewItem label="Preferred Timing" value={form.preferredTiming} />
                  <ReviewItem label="Learning Mode" value={form.learningMode} />
                </div>
              </div>
              <div className="bg-bg-light rounded-xl p-4 sm:p-5 space-y-3">
                <h4 className="font-medium text-sm text-text-dark">Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <ReviewItem label="Student Photo" value={form.studentPhoto instanceof File ? form.studentPhoto.name : 'Not provided'} />
                  <ReviewItem label="CNIC Front" value={form.cnicFront instanceof File ? form.cnicFront.name : 'Not provided'} />
                  <ReviewItem label="CNIC Back" value={form.cnicBack instanceof File ? form.cnicBack.name : 'Not provided'} />
                  <ReviewItem label="Passport" value={form.passport instanceof File ? form.passport.name : 'Not provided'} />
                  <ReviewItem label="Certificates" value={form.educationalCertificates.length > 0 ? `${form.educationalCertificates.length} file(s)` : 'Not provided'} />
                  <ReviewItem label="Additional Docs" value={form.additionalDocuments.length > 0 ? `${form.additionalDocuments.length} file(s)` : 'Not provided'} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light pt-28 lg:pt-32 pb-16" ref={topRef}>
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {renderProgress()}

          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{submitError}</div>
          )}

          {renderStep()}

          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 mt-8 pt-6 border-t border-border-light">
            <div>
              {step > 1 ? (
                <button onClick={prev} className="px-5 py-2.5 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors text-sm font-medium">
                  Previous
                </button>
              ) : (
                <button onClick={() => navigate('/admissions')} className="px-5 py-2.5 border border-border-light text-text-light rounded-xl hover:bg-bg-light transition-colors text-sm font-medium">
                  Cancel
                </button>
              )}
            </div>
            <div className="text-xs sm:text-sm text-text-light order-first sm:order-none w-full sm:w-auto text-center mb-2 sm:mb-0">
              <span className="inline-block px-3 py-1 bg-bg-light rounded-full text-xs font-medium">Step {step} of 6</span>
            </div>
            <div className="flex items-center gap-2">
              {step < 6 ? (
                <button onClick={next} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                  Next
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center gap-2">
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Submitting...
                    </>
                  ) : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <span className="text-text-light text-xs">{label}</span>
      <p className="text-text-dark font-medium">{value || '-'}</p>
    </div>
  );
}
