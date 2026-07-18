import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentPortalService from '../../services/studentPortalService';
import courseService from '../../services/courseService';
import uploadService from '../../services/uploadService';
import { FiCheckCircle, FiArrowRight, FiUpload, FiUser, FiMail, FiPhone, FiGlobe, FiMapPin, FiTrash2, FiFile, FiBook, FiCheck } from 'react-icons/fi';

const STEPS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'contact', label: 'Contact & Address', icon: '📍' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'bio', label: 'Bio & Skills', icon: '✨' },
];

const INITIAL_FORM = {
  studentName: '',
  fatherName: '',
  motherName: '',
  guardianName: '',
  guardianRelation: '',
  dateOfBirth: '',
  gender: 'male',
  nationality: '',
  religion: '',
  bloodGroup: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  emergencyContact: '',
  emergencyPhone: '',
  previousEducation: '',
  currentQualification: '',
  bio: '',
  languages: [],
  skills: [],
  studentPhoto: '',
  cnicFront: '',
  cnicBack: '',
  passport: '',
  educationalCertificates: [],
  additionalDocuments: [],
};

export default function StudentProfileComplete() {
  const navigate = useNavigate();
  const { user, completeProfile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    if (user?.profileComplete && user?.profileVerified) {
      const dashboard = user?.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';
      navigate(dashboard, { replace: true });
      return;
    }

    // Load available courses for multi-select
    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await courseService.getPublishedCourses({ limit: 200 });
        if (res?.data?.data) {
          setAvailableCourses(res.data.data);
        }
      } catch (_) {}
      setCoursesLoading(false);
    };
    loadCourses();

    const loadProfile = async () => {
      try {
        const res = await studentPortalService.getProfile();
        if (res?.data) {
          const existing = res.data;
          // Pre-select courses from existing profile
          if (existing.courses && Array.isArray(existing.courses)) {
            const courseIds = existing.courses
              .filter(c => c.course && c.course._id)
              .map(c => c.course._id);
            setSelectedCourses(courseIds);
          }
          setFormData(prev => ({
            ...prev,
            studentName: existing.studentName || user?.fullName || '',
            fatherName: existing.fatherName || '',
            motherName: existing.motherName || '',
            guardianName: existing.guardianName || '',
            guardianRelation: existing.guardianRelation || '',
            dateOfBirth: existing.dateOfBirth ? existing.dateOfBirth.split('T')[0] : '',
            gender: existing.gender || 'male',
            nationality: existing.nationality || '',
            religion: existing.religion || '',
            bloodGroup: existing.bloodGroup || '',
            phone: existing.phone || user?.phone || '',
            whatsapp: existing.whatsapp || '',
            email: existing.email || user?.email || '',
            address: existing.address || '',
            city: existing.city || user?.city || '',
            country: existing.country || user?.country || '',
            postalCode: existing.postalCode || '',
            emergencyContact: existing.emergencyContact || '',
            emergencyPhone: existing.emergencyPhone || '',
            previousEducation: existing.previousEducation || '',
            currentQualification: existing.currentQualification || '',
            bio: existing.bio || '',
            languages: existing.languages || [],
            skills: existing.skills || [],
            studentPhoto: existing.studentPhoto || '',
            cnicFront: existing.cnicFront || '',
            cnicBack: existing.cnicBack || '',
            passport: existing.passport || '',
            educationalCertificates: existing.educationalCertificates || [],
            additionalDocuments: existing.additionalDocuments || [],
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            studentName: user?.fullName || '',
            phone: user?.phone || '',
            city: user?.city || '',
            country: user?.country || '',
            email: user?.email || '',
          }));
        }
      } catch (err) {
        setFormData(prev => ({
          ...prev,
          studentName: user?.fullName || '',
          phone: user?.phone || '',
          city: user?.city || '',
          country: user?.country || '',
          email: user?.email || '',
        }));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const res = await uploadService.uploadFile(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setFormData(prev => ({ ...prev, [fieldName]: url }));
      }
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [fieldName]: err.message || 'Upload failed' }));
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleMultiFileUpload = async (fieldName, files) => {
    if (!files || files.length === 0) return;
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const res = await uploadService.uploadMultiple(Array.from(files));
      const urls = res?.data?.files?.map(f => f.url) || [];
      if (urls.length > 0) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: [...(prev[fieldName] || []), ...urls],
        }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [fieldName]: err.message || 'Upload failed' }));
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const removeFile = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  const removeSingleFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: '' }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.studentName.trim()) newErrors.studentName = 'Full name is required';
      if (!formData.fatherName.trim()) newErrors.fatherName = 'Father name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
      if (!formData.religion.trim()) newErrors.religion = 'Religion is required';
    } else if (step === 1) {
      if (!formData.phone.match(/^[\d\s\-+()]{7,30}$/)) newErrors.phone = 'Valid phone number is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact name is required';
      if (!formData.emergencyPhone.match(/^[\d\s\-+()]{7,30}$/)) newErrors.emergencyPhone = 'Valid emergency phone is required';
    }

    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let studentId = null;
      try {
        const profileRes = await studentPortalService.getProfile();
        if (profileRes?.data?._id) {
          studentId = profileRes.data._id;
        }
      } catch (err) {}

      // Add selectedCourses to submission data
      const submitData = {
        ...formData,
        selectedCourses,
      };

      if (studentId) {
        await studentPortalService.updateProfile(studentId, submitData);
      }

      await completeProfile();

      setSuccessMessage('Profile submitted for verification! Redirecting...');
      setTimeout(() => {
        navigate('/profile-under-review', { replace: true });
      }, 1500);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to submit profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-soft">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => idx < currentStep ? setCurrentStep(idx) : null}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
              idx === currentStep
                ? 'bg-primary text-white shadow-lg'
                : idx < currentStep
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-text-light'
            }`}
          >
            <span className="text-sm">{idx < currentStep ? '✓' : step.icon}</span>
            <span className="hidden sm:inline text-sm font-semibold">{step.label}</span>
          </button>
          {idx < STEPS.length - 1 && (
            <div className={`w-6 sm:w-12 h-0.5 ${idx < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderFileUpload = (fieldName, label, accept = 'image/*,.pdf', isMulti = false) => {
    const hasFile = isMulti ? (formData[fieldName]?.length > 0) : !!formData[fieldName];
    const isUploading = uploading[fieldName];

    return (
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">{label}</label>
        {isMulti ? (
          <div>
            {hasFile && (
              <div className="space-y-2 mb-3">
                {formData[fieldName].map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-bg-light rounded-lg">
                    {url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                      <img src={url} alt={`${label} ${idx + 1}`} className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      <FiFile className="w-6 h-6 text-primary" />
                    )}
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary truncate flex-1 hover:underline">
                      {label} {idx + 1}
                    </a>
                    <button onClick={() => removeFile(fieldName, idx)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isUploading ? 'border-primary bg-primary/5' : 'border-border-light hover:border-primary hover:bg-primary/5'}`}>
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiUpload className="w-5 h-5 text-text-light" />
              )}
              <span className="text-sm text-text-light">{isUploading ? 'Uploading...' : `Upload ${label}`}</span>
              <input type="file" accept={accept} multiple onChange={(e) => handleMultiFileUpload(fieldName, e.target.files)} className="hidden" disabled={isUploading} />
            </label>
          </div>
        ) : (
          <div>
            {hasFile && (
              <div className="relative mb-3">
                {formData[fieldName].match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                  <div className="relative group">
                    <img src={formData[fieldName]} alt={label} className="w-32 h-32 object-cover rounded-xl border-2 border-border-light" />
                    <button onClick={() => removeSingleFile(fieldName)} className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-bg-light rounded-lg">
                    <FiFile className="w-6 h-6 text-primary" />
                    <a href={formData[fieldName]} target="_blank" rel="noopener noreferrer" className="text-sm text-primary truncate flex-1 hover:underline">View {label}</a>
                    <button onClick={() => removeSingleFile(fieldName)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isUploading ? 'border-primary bg-primary/5' : 'border-border-light hover:border-primary hover:bg-primary/5'}`}>
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiUpload className="w-5 h-5 text-text-light" />
              )}
              <span className="text-sm text-text-light">{hasFile ? 'Replace' : 'Upload'} {label}</span>
              <input type="file" accept={accept} onChange={(e) => handleFileUpload(fieldName, e.target.files[0])} className="hidden" disabled={isUploading} />
            </label>
          </div>
        )}
        {errors[fieldName] && <p className="text-red-600 text-sm mt-1">{errors[fieldName]}</p>}
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-4 mb-6 p-4 bg-primary-light rounded-xl">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            {formData.studentName?.charAt(0) || 'S'}
          </div>
          <div>
            <h3 className="font-semibold text-text-dark">Personal Information</h3>
            <p className="text-sm text-text-light">Tell us about yourself</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Full Name *</label>
        <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Your full name"
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.studentName ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.studentName && <p className="text-red-600 text-sm mt-1">{errors.studentName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Father Name *</label>
        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father's full name"
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.fatherName ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.fatherName && <p className="text-red-600 text-sm mt-1">{errors.fatherName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Mother Name</label>
        <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Mother's full name"
          className="w-full px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Guardian Name</label>
        <div className="flex gap-2">
          <input type="text" name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} placeholder="Relation"
            className="w-1/3 px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
          <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="Guardian name"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Date of Birth *</label>
        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.dateOfBirth ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.dateOfBirth && <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Gender *</label>
        <select name="gender" value={formData.gender} onChange={handleChange}
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.gender ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Nationality *</label>
        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g. Pakistani"
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.nationality ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.nationality && <p className="text-red-600 text-sm mt-1">{errors.nationality}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Religion *</label>
        <input type="text" name="religion" value={formData.religion} onChange={handleChange} placeholder="e.g. Islam"
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.religion ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.religion && <p className="text-red-600 text-sm mt-1">{errors.religion}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Blood Group</label>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all">
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
      </div>
    </div>
  );

  const renderContactAddress = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-4 mb-6 p-4 bg-primary-light rounded-xl">
          <FiMapPin className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold text-text-dark">Contact & Address</h3>
            <p className="text-sm text-text-light">How can we reach you?</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Phone Number *</label>
        <div className="relative">
          <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1-555-123-4567"
            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.phone ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        </div>
        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">WhatsApp Number</label>
        <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+1-555-123-4567"
          className="w-full px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Email</label>
        <div className="relative">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
          <input type="email" name="email" value={formData.email} onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border-light bg-gray-50 outline-none" readOnly />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Country *</label>
        <div className="relative">
          <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
          <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Your country"
            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.country ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        </div>
        {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">City *</label>
        <div className="relative">
          <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Your city"
            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.city ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        </div>
        {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Postal Code</label>
        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal code"
          className="w-full px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Address *</label>
        <textarea name="address" value={formData.address} onChange={handleChange} rows={3} placeholder="Your full address"
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all resize-none ${errors.address ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Emergency Contact Name *</label>
        <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Emergency contact person"
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.emergencyContact ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.emergencyContact && <p className="text-red-600 text-sm mt-1">{errors.emergencyContact}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Emergency Contact Phone *</label>
        <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="Emergency phone number"
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${errors.emergencyPhone ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.emergencyPhone && <p className="text-red-600 text-sm mt-1">{errors.emergencyPhone}</p>}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-4 mb-6 p-4 bg-primary-light rounded-xl">
          <span className="text-3xl">📚</span>
          <div>
            <h3 className="font-semibold text-text-dark">Education & Courses</h3>
            <p className="text-sm text-text-light">Tell us about your education and select courses</p>
          </div>
        </div>
      </div>

      {/* Dynamic Course Selection */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-3">
          Select Courses *
          <span className="text-xs text-text-light ml-2 font-normal">(Choose the courses you want to study)</span>
        </label>
        {coursesLoading ? (
          <div className="flex items-center gap-3 p-4 bg-bg-light rounded-xl">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-light">Loading courses...</span>
          </div>
        ) : availableCourses.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-700">No courses available yet. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableCourses.map(course => {
              const isSelected = selectedCourses.includes(course._id);
              return (
                <button
                  key={course._id}
                  type="button"
                  onClick={() => toggleCourse(course._id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border-light hover:border-primary/50 hover:bg-primary/[0.02]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected ? 'bg-primary text-white' : 'border-2 border-border-light'
                  }`}>
                    {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-dark truncate">{course.title}</p>
                    {course.shortDescription && (
                      <p className="text-xs text-text-light truncate mt-0.5">{course.shortDescription}</p>
                    )}
                  </div>
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
        {selectedCourses.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-light">
            <FiBook className="w-3.5 h-3.5" />
            <span>{selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected</span>
          </div>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Previous Institute / School</label>
        <textarea name="previousEducation" value={formData.previousEducation} onChange={handleChange} rows={3} placeholder="Name of your previous school, college or institute"
          className="w-full px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Current Qualification</label>
        <textarea name="currentQualification" value={formData.currentQualification} onChange={handleChange} rows={3} placeholder="Your current educational qualification"
          className="w-full px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="p-4 bg-primary-light rounded-xl">
        <div className="flex items-center gap-4">
          <span className="text-3xl">📄</span>
          <div>
            <h3 className="font-semibold text-text-dark">Documents</h3>
            <p className="text-sm text-text-light">Upload your required documents</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {renderFileUpload('studentPhoto', 'Profile Photo', 'image/*')}
        {renderFileUpload('cnicFront', 'CNIC Front', 'image/*,.pdf')}
        {renderFileUpload('cnicBack', 'CNIC Back', 'image/*,.pdf')}
        {renderFileUpload('passport', 'Passport', 'image/*,.pdf')}
      </div>

      <div>
        {renderFileUpload('educationalCertificates', 'Certificates', 'image/*,.pdf', true)}
      </div>

      <div>
        {renderFileUpload('additionalDocuments', 'Additional Documents', 'image/*,.pdf', true)}
      </div>
    </div>
  );

  const renderBio = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-4 mb-6 p-4 bg-primary-light rounded-xl">
          <span className="text-3xl">✨</span>
          <div>
            <h3 className="font-semibold text-text-dark">Bio & Skills</h3>
            <p className="text-sm text-text-light">Tell us more about yourself</p>
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Bio</label>
        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Write a short bio about yourself..."
          className="w-full px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Languages</label>
        <input type="text" value={formData.languages.join(', ')} onChange={(e) => handleArrayChange('languages', e.target.value)}
          placeholder="Urdu, English, Arabic (comma separated)"
          className="w-full px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
        <p className="text-xs text-text-light mt-1">Separate languages with commas</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Skills</label>
        <input type="text" value={formData.skills.join(', ')} onChange={(e) => handleArrayChange('skills', e.target.value)}
          placeholder="Quran recitation, Tajweed, etc. (comma separated)"
          className="w-full px-4 py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
        <p className="text-xs text-text-light mt-1">Separate skills with commas</p>
      </div>
    </div>
  );

  // Show rejection reason if profile was rejected
  const profileRejected = user?.profileVerificationStatus === 'rejected' || user?.profileVerificationStatus === 'changes_requested';

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-dark mb-3">
            {profileRejected ? 'Update Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-text-body text-lg">
            {profileRejected
              ? 'Please update your profile based on the feedback below'
              : 'Please complete your profile to access the student dashboard'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10">
          {/* Rejection Notice */}
          {profileRejected && user?.profileVerificationRejectionReason && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in">
              <p className="text-sm font-semibold text-amber-800 mb-1">Changes Required:</p>
              <p className="text-sm text-amber-700">{user.profileVerificationRejectionReason}</p>
            </div>
          )}

          {renderStepIndicator()}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 animate-fade-in flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fade-in">
              {errors.submit}
            </div>
          )}

          <div className="min-h-[400px]">
            {currentStep === 0 && renderPersonalInfo()}
            {currentStep === 1 && renderContactAddress()}
            {currentStep === 2 && renderEducation()}
            {currentStep === 3 && renderDocuments()}
            {currentStep === 4 && renderBio()}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-light">
            <button type="button" onClick={handlePrev} disabled={currentStep === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${currentStep === 0 ? 'text-text-light cursor-not-allowed' : 'border-2 border-border-light text-text-body hover:bg-bg-light'}`}>
              ← Previous
            </button>

            <div className="text-sm text-text-light">Step {currentStep + 1} of {STEPS.length}</div>

            {currentStep < STEPS.length - 1 ? (
              <button type="button" onClick={handleNext}
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                Next <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${isSubmitting ? 'bg-text-light text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'}`}>
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><FiCheckCircle className="w-5 h-5" /> Submit for Verification</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
