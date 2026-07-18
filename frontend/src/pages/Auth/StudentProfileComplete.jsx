import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentPortalService from '../../services/studentPortalService';
import uploadService from '../../services/uploadService';
import { FiCheckCircle, FiArrowRight, FiUpload, FiUser, FiMail, FiPhone, FiGlobe, FiMapPin, FiTrash2, FiFile, FiBook, FiStar, FiCheck } from 'react-icons/fi';

const STEPS = [
  { id: 'personal', label: 'Personal Info', icon: FiUser },
  { id: 'contact', label: 'Contact & Address', icon: FiMapPin },
  { id: 'education', label: 'Education', icon: FiBook },
  { id: 'documents', label: 'Documents', icon: FiFile },
  { id: 'bio', label: 'Bio & Skills', icon: FiStar },
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
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    if (user?.profileComplete && user?.profileVerified) {
      const dashboard = user?.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';
      navigate(dashboard, { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await studentPortalService.getProfile();
        if (res?.data) {
          const existing = res.data;
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
    setDirection('next');
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setDirection('prev');
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

      if (studentId) {
        await studentPortalService.updateProfile(studentId, formData);
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

  const renderStepIndicator = () => {
    const progressPercent = currentStep / (STEPS.length - 1) * 100;

    return (
      <div className="mb-6 sm:mb-10">
        {/* === CIRCULAR STEPPER WITH PROGRESS LINE === */}
        <div className="relative pt-[18px] sm:pt-[22px] lg:pt-[26px]">
          {/* Line wrapper — padded to align with circle centers on all breakpoints */}
          <div className="absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 top-[18px] sm:top-[22px] lg:top-[26px] h-[2px] sm:h-[3px]">
            {/* Track */}
            <div className="absolute inset-0 bg-gray-200 rounded-full" />
            {/* Fill — percentage width matches wrapper exactly, no hardcoded px */}
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step circles + labels */}
          <div className="relative flex items-start justify-between">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <button
                    onClick={() => idx < currentStep ? setCurrentStep(idx) : null}
                    aria-current={isActive ? 'step' : undefined}
                    disabled={idx > currentStep}
                    className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-500 ease-out ${
                      isCompleted
                        ? 'w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white shadow-md'
                        : isActive
                          ? 'w-[34px] h-[34px] sm:w-11 sm:h-11 bg-primary text-white shadow-lg shadow-primary/30 animate-pulse-ring'
                          : 'w-8 h-8 sm:w-10 sm:h-10 bg-white text-text-light border-2 border-border-light'
                    } ${idx > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    title={step.label}
                  >
                    {isCompleted ? (
                      <FiCheck size={16} className="sm:w-[18px] sm:h-[18px] animate-bounce-in" />
                    ) : (
                      <step.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    )}
                  </button>

                  {/* Label — shown on sm+ only */}
                  <span className={`hidden sm:block text-center leading-tight transition-all duration-300 ${
                    isActive
                      ? 'text-primary font-bold text-[10px] md:text-xs lg:text-sm'
                      : isCompleted
                        ? 'text-text-dark font-semibold text-[10px] md:text-xs lg:text-sm'
                        : 'text-text-light font-medium text-[10px] md:text-xs lg:text-sm'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile step indicator — shows step number + label */}
        <div className="flex sm:hidden items-center justify-center mt-3">
          <span key={currentStep} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-light/80 rounded-full border border-primary/10 animate-slide-in-right">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
              {currentStep + 1}
            </span>
            <span className="text-xs font-semibold text-primary">{STEPS[currentStep].label}</span>
          </span>
        </div>
      </div>
    );
  };

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
                      <img src={url} alt={`${label} ${idx + 1}`} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <FiFile className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                    )}
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-primary truncate flex-1 hover:underline min-w-0">
                      {label} {idx + 1}
                    </a>
                    <button onClick={() => removeFile(fieldName, idx)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                      <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isUploading ? 'border-primary bg-primary/5' : 'border-border-light hover:border-primary hover:bg-primary/5'}`}>
              {isUploading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiUpload className="w-4 h-4 sm:w-5 sm:h-5 text-text-light" />
              )}
              <span className="text-xs sm:text-sm text-text-light truncate">{isUploading ? 'Uploading...' : `Upload ${label}`}</span>
              <input type="file" accept={accept} multiple onChange={(e) => handleMultiFileUpload(fieldName, e.target.files)} className="hidden" disabled={isUploading} />
            </label>
          </div>
        ) : (
          <div>
            {hasFile && (
              <div className="relative mb-3">
                {formData[fieldName].match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                  <div className="relative group inline-block max-w-full">
                    <img src={formData[fieldName]} alt={label} className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-xl border-2 border-border-light" />
                    <button onClick={() => removeSingleFile(fieldName)} className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-bg-light rounded-lg">
                    <FiFile className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                    <a href={formData[fieldName]} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-primary truncate flex-1 hover:underline min-w-0">View {label}</a>
                    <button onClick={() => removeSingleFile(fieldName)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0">
                      <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            <label className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isUploading ? 'border-primary bg-primary/5' : 'border-border-light hover:border-primary hover:bg-primary/5'}`}>
              {isUploading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiUpload className="w-4 h-4 sm:w-5 sm:h-5 text-text-light" />
              )}
              <span className="text-xs sm:text-sm text-text-light truncate">{hasFile ? 'Replace' : 'Upload'} {label}</span>
              <input type="file" accept={accept} onChange={(e) => handleFileUpload(fieldName, e.target.files[0])} className="hidden" disabled={isUploading} />
            </label>
          </div>
        )}
        {errors[fieldName] && <p className="text-red-600 text-sm mt-1">{errors[fieldName]}</p>}
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary-light rounded-xl">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl sm:text-2xl font-bold flex-shrink-0">
            {formData.studentName?.charAt(0) || 'S'}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-text-dark text-sm sm:text-base">Personal Information</h3>
            <p className="text-xs sm:text-sm text-text-light">Tell us about yourself</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Full Name *</label>
        <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Your full name"
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.studentName ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.studentName && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.studentName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Father Name *</label>
        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father's full name"
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.fatherName ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.fatherName && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.fatherName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Mother Name</label>
        <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Mother's full name"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Guardian Name</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} placeholder="Relation (e.g. Father)"
            className="w-full sm:w-2/5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
          <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="Guardian name"
            className="w-full sm:flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Date of Birth *</label>
        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.dateOfBirth ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.dateOfBirth && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.dateOfBirth}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Gender *</label>
        <select name="gender" value={formData.gender} onChange={handleChange}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.gender ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.gender}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Nationality *</label>
        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g. Pakistani"
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.nationality ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.nationality && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.nationality}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Religion *</label>
        <input type="text" name="religion" value={formData.religion} onChange={handleChange} placeholder="e.g. Islam"
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.religion ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.religion && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.religion}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Blood Group</label>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary-light rounded-xl">
          <FiMapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-text-dark text-sm sm:text-base">Contact & Address</h3>
            <p className="text-xs sm:text-sm text-text-light">How can we reach you?</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Phone Number *</label>
        <div className="relative">
          <FiPhone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-light w-4 h-4 sm:w-5 sm:h-5" />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1-555-123-4567"
            className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.phone ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        </div>
        {errors.phone && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">WhatsApp Number</label>
        <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+1-555-123-4567"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Email</label>
        <div className="relative">
          <FiMail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-light w-4 h-4 sm:w-5 sm:h-5" />
          <input type="email" name="email" value={formData.email} onChange={handleChange}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light bg-gray-50 outline-none text-sm sm:text-base" readOnly />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Country *</label>
        <div className="relative">
          <FiGlobe className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-light w-4 h-4 sm:w-5 sm:h-5" />
          <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Your country"
            className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.country ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        </div>
        {errors.country && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.country}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">City *</label>
        <div className="relative">
          <FiMapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-light w-4 h-4 sm:w-5 sm:h-5" />
          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Your city"
            className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.city ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        </div>
        {errors.city && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.city}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Postal Code</label>
        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal code"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Address *</label>
        <textarea name="address" value={formData.address} onChange={handleChange} rows={3} placeholder="Your full address"
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all resize-none text-sm sm:text-base ${errors.address ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.address && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.address}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Emergency Contact Name *</label>
        <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Emergency contact person"
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.emergencyContact ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.emergencyContact && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.emergencyContact}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Emergency Contact Phone *</label>
        <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="Emergency phone number"
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.emergencyPhone ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.emergencyPhone && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.emergencyPhone}</p>}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary-light rounded-xl">
          <FiBook size={24} className="sm:w-8 sm:h-8 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-text-dark text-sm sm:text-base">Education Background</h3>
            <p className="text-xs sm:text-sm text-text-light">Tell us about your education</p>
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Previous Institute / School</label>
        <textarea name="previousEducation" value={formData.previousEducation} onChange={handleChange} rows={3} placeholder="Name of your previous school, college or institute"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none text-sm sm:text-base" />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Current Qualification</label>
        <textarea name="currentQualification" value={formData.currentQualification} onChange={handleChange} rows={3} placeholder="Your current educational qualification"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none text-sm sm:text-base" />
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-3 sm:p-4 bg-primary-light rounded-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <FiFile size={24} className="sm:w-8 sm:h-8 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-text-dark text-sm sm:text-base">Documents</h3>
            <p className="text-xs sm:text-sm text-text-light">Upload your required documents</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary-light rounded-xl">
          <FiStar size={24} className="sm:w-8 sm:h-8 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-text-dark text-sm sm:text-base">Bio & Skills</h3>
            <p className="text-xs sm:text-sm text-text-light">Tell us more about yourself</p>
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Bio</label>
        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Write a short bio about yourself..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none text-sm sm:text-base" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Languages</label>
        <input type="text" value={formData.languages.join(', ')} onChange={(e) => handleArrayChange('languages', e.target.value)}
          placeholder="Urdu, English, Arabic (comma separated)"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
        <p className="text-xs text-text-light mt-1">Separate languages with commas</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Skills</label>
        <input type="text" value={formData.skills.join(', ')} onChange={(e) => handleArrayChange('skills', e.target.value)}
          placeholder="Quran recitation, Tajweed, etc. (comma separated)"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
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
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-dark mb-2 sm:mb-3 px-2">
            {profileRejected ? 'Update Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-text-body text-sm sm:text-base lg:text-lg px-2">
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

          <div className="min-h-[400px]" key={currentStep}>
            <div className={direction === 'prev' ? 'animate-slide-in-left' : 'animate-slide-in-right'}>
              {currentStep === 0 && renderPersonalInfo()}
              {currentStep === 1 && renderContactAddress()}
              {currentStep === 2 && renderEducation()}
              {currentStep === 3 && renderDocuments()}
              {currentStep === 4 && renderBio()}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 mt-8 pt-6 border-t border-border-light">
            <button type="button" onClick={handlePrev} disabled={currentStep === 0}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${currentStep === 0 ? 'text-text-light cursor-not-allowed opacity-50' : 'border-2 border-border-light text-text-body hover:bg-bg-light'}`}>
              ← Previous
            </button>

            <div className="text-xs sm:text-sm text-text-light order-first sm:order-none w-full sm:w-auto text-center mb-2 sm:mb-0">
              <span className="inline-block px-3 py-1 bg-bg-light rounded-full text-xs font-medium">Step {currentStep + 1} of {STEPS.length}</span>
            </div>

            {currentStep < STEPS.length - 1 ? (
              <button type="button" onClick={handleNext}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-sm sm:text-base">
                Next <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${isSubmitting ? 'bg-text-light text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'}`}>
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Submit for Verification</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
