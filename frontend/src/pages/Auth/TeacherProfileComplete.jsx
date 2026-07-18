import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import teacherPortalService from '../../services/teacherPortalService';
import uploadService from '../../services/uploadService';
import { FiCheckCircle, FiArrowRight, FiUpload, FiTrash2, FiFile, FiPlus, FiUser, FiAward, FiStar, FiLink, FiCheck } from 'react-icons/fi';

const STEPS = [
  { id: 'personal', label: 'Personal', icon: FiUser },
  { id: 'qualification', label: 'Qualification', icon: FiAward },
  { id: 'skills', label: 'Skills', icon: FiStar },
  { id: 'social', label: 'Social Links', icon: FiLink },
  { id: 'documents', label: 'Documents', icon: FiFile },
];

const INITIAL_FORM = {
  fullName: '',
  gender: '',
  dateOfBirth: '',
  nationality: '',
  phone: '',
  whatsapp: '',
  country: '',
  city: '',
  address: '',
  postalCode: '',
  emergencyContact: '',
  emergencyPhone: '',
  qualification: '',
  degree: '',
  experience: '',
  specialization: '',
  subjects: [],
  biography: '',
  shortBio: '',
  teachingLanguages: [],
  skills: [],
  certificates: [],
  awards: [],
  linkedin: '',
  facebook: '',
  instagram: '',
  youtube: '',
  website: '',
  availableForOnline: false,
  teachingMode: '',
  availability: '',
  bloodGroup: '',
  religion: '',
  cnicPassport: '',
  profilePhoto: '',
  coverPhoto: '',
  resume: '',
  additionalDocuments: [],
};

export default function TeacherProfileComplete() {
  const navigate = useNavigate();
  const { user, completeProfile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [certInput, setCertInput] = useState({ title: '', issuer: '', year: '' });
  const [awardInput, setAwardInput] = useState({ title: '', year: '', description: '' });

  useEffect(() => {
    if (user?.profileComplete && user?.profileVerified) {
      navigate('/teacher/dashboard', { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await teacherPortalService.getProfile();
        if (res?.data) {
          const existing = res.data;
          setFormData(prev => ({
            ...prev,
            fullName: existing.fullName || user?.fullName || '',
            gender: existing.gender || '',
            dateOfBirth: existing.dateOfBirth ? existing.dateOfBirth.split('T')[0] : '',
            nationality: existing.nationality || '',
            phone: existing.phone || user?.phone || '',
            whatsapp: existing.whatsapp || '',
            country: existing.country || user?.country || '',
            city: existing.city || user?.city || '',
            address: existing.address || '',
            postalCode: existing.postalCode || '',
            emergencyContact: existing.emergencyContact || '',
            emergencyPhone: existing.emergencyPhone || '',
            qualification: existing.qualification || '',
            degree: existing.degree || '',
            experience: existing.experience || '',
            specialization: existing.specialization || '',
            subjects: existing.subjects || [],
            biography: existing.biography || '',
            shortBio: existing.shortBio || '',
            teachingLanguages: existing.teachingLanguages || [],
            skills: existing.skills || [],
            certificates: existing.certificates || [],
            awards: existing.awards || [],
            linkedin: existing.linkedin || '',
            facebook: existing.facebook || '',
            instagram: existing.instagram || '',
            youtube: existing.youtube || '',
            website: existing.website || '',
            availableForOnline: existing.availableForOnline || false,
            teachingMode: existing.teachingMode || '',
            availability: existing.availability || '',
            bloodGroup: existing.bloodGroup || '',
            religion: existing.religion || '',
            cnicPassport: existing.cnicPassport || '',
            profilePhoto: existing.profilePhoto || '',
            coverPhoto: existing.coverPhoto || '',
            resume: existing.resume || '',
            additionalDocuments: existing.additionalDocuments || [],
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            city: user?.city || '',
            country: user?.country || '',
          }));
        }
      } catch (err) {
        setFormData(prev => ({
          ...prev,
          fullName: user?.fullName || '',
          phone: user?.phone || '',
          city: user?.city || '',
          country: user?.country || '',
        }));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

  const removeSingleFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: '' }));
  };

  const removeMultiFile = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  const addCertificate = () => {
    if (!certInput.title.trim()) return;
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { ...certInput, year: parseInt(certInput.year) || new Date().getFullYear() }],
    }));
    setCertInput({ title: '', issuer: '', year: '' });
  };

  const removeCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
  };

  const addAward = () => {
    if (!awardInput.title.trim()) return;
    setFormData(prev => ({
      ...prev,
      awards: [...prev.awards, { ...awardInput, year: parseInt(awardInput.year) || new Date().getFullYear() }],
    }));
    setAwardInput({ title: '', year: '', description: '' });
  };

  const removeAward = (index) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
      if (!formData.phone.match(/^[\d\s\-+()]{7,30}$/)) newErrors.phone = 'Valid phone number is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
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
      let teacherId = null;
      try {
        const profileRes = await teacherPortalService.getProfile();
        if (profileRes?.data?._id) {
          teacherId = profileRes.data._id;
        }
      } catch (err) {}

      if (teacherId) {
        await teacherPortalService.updateProfile(teacherId, formData);
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
                    <button onClick={() => removeMultiFile(fieldName, idx)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
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
                    <button onClick={() => removeSingleFile(fieldName)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-0.5 sm:gap-2 md:gap-4 mb-6 sm:mb-10 overflow-x-auto pb-2 -mx-2 sm:mx-0 px-2 sm:px-0">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-0.5 sm:gap-2 md:gap-4 flex-shrink-0">
          <button onClick={() => idx < currentStep ? setCurrentStep(idx) : null}
            className={`flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 md:px-3 py-1 sm:py-2 rounded-xl transition-all ${idx === currentStep ? 'bg-primary text-white shadow-lg' : idx < currentStep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-text-light'}`}>
            <span className="text-xs sm:text-sm">{idx < currentStep ? <FiCheck /> : <step.icon />}</span>
            <span className="hidden sm:inline text-xs md:text-sm font-semibold">{step.label}</span>
          </button>
          {idx < STEPS.length - 1 && (
            <div className={`w-1.5 sm:w-4 md:w-8 lg:w-12 h-0.5 ${idx < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary-light rounded-xl">
          <FiUser size={24} className="sm:w-8 sm:h-8 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-text-dark text-sm sm:text-base">Personal Information</h3>
            <p className="text-xs sm:text-sm text-text-light">Tell us about yourself</p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Full Name *</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.fullName ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.fullName && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.fullName}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Gender *</label>
        <select name="gender" value={formData.gender} onChange={handleChange}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.gender ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.gender}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Date of Birth</label>
        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Nationality *</label>
        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.nationality ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.nationality && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.nationality}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Religion</label>
        <input type="text" name="religion" value={formData.religion} onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Blood Group</label>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base">
          <option value="">Select</option>
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
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Phone *</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.phone ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.phone && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.phone}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">WhatsApp</label>
        <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Country *</label>
        <input type="text" name="country" value={formData.country} onChange={handleChange}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.country ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.country && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.country}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">City *</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${errors.city ? 'border-red-400' : 'border-border-light focus:border-primary'} focus:ring-2 focus:ring-primary/10`} />
        {errors.city && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.city}</p>}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Address</label>
        <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none text-sm sm:text-base" />
      </div>
    </div>
  );

  const renderQualification = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary-light rounded-xl">
          <FiAward size={24} className="sm:w-8 sm:h-8 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-text-dark text-sm sm:text-base">Qualification & Experience</h3>
            <p className="text-xs sm:text-sm text-text-light">Your academic background and teaching experience</p>
          </div>
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Qualification</label>
        <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. Masters in Islamic Studies"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Degree</label>
        <input type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g. PhD, Masters"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Experience (years)</label>
        <input type="number" name="experience" value={formData.experience} onChange={handleChange} min="0" max="70"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Specialization</label>
        <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. Quran & Tafseer"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Subjects (comma separated)</label>
        <input type="text" value={formData.subjects.join(', ')} onChange={(e) => handleArrayChange('subjects', e.target.value)} placeholder="Quran, Hadith, Fiqh"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Teaching Languages (comma separated)</label>
        <input type="text" value={formData.teachingLanguages.join(', ')} onChange={(e) => handleArrayChange('teachingLanguages', e.target.value)} placeholder="Urdu, English, Arabic"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Short Bio</label>
        <textarea name="shortBio" value={formData.shortBio} onChange={handleChange} rows={3} placeholder="Brief introduction about yourself"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none text-sm sm:text-base" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Biography</label>
        <textarea name="biography" value={formData.biography} onChange={handleChange} rows={4} placeholder="Detailed biography"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none text-sm sm:text-base" />
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary-light rounded-xl">
          <FiStar size={24} className="sm:w-8 sm:h-8 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-text-dark text-sm sm:text-base">Skills & Availability</h3>
            <p className="text-xs sm:text-sm text-text-light">Your teaching skills and availability</p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Skills (comma separated)</label>
        <input type="text" value={formData.skills.join(', ')} onChange={(e) => handleArrayChange('skills', e.target.value)} placeholder="Tajweed, Tafseer, Arabic grammar"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Teaching Mode</label>
        <select name="teachingMode" value={formData.teachingMode} onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base">
          <option value="">Select Mode</option>
          <option value="online">Online</option>
          <option value="physical">Physical</option>
          <option value="both">Both</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Availability</label>
        <input type="text" name="availability" value={formData.availability} onChange={handleChange} placeholder="e.g. Weekdays 9AM-5PM"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div className="flex items-center gap-3 pt-4">
        <input type="checkbox" name="availableForOnline" checked={formData.availableForOnline} onChange={handleChange}
          className="w-5 h-5 rounded border-2 border-border-light accent-primary flex-shrink-0" />
        <label className="text-sm font-semibold text-text-dark">Available for online teaching</label>
      </div>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary-light rounded-xl">
          <FiLink size={24} className="sm:w-8 sm:h-8 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-text-dark text-sm sm:text-base">Social Links (Optional)</h3>
            <p className="text-xs sm:text-sm text-text-light">Connect your professional profiles</p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">LinkedIn</label>
        <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Facebook</label>
        <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">Instagram</label>
        <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">YouTube</label>
        <input type="url" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/@..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-text-dark mb-2">Website</label>
        <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border-light focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm sm:text-base" />
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
            <p className="text-xs sm:text-sm text-text-light">Upload your certificates and documents</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {renderFileUpload('profilePhoto', 'Profile Photo', 'image/*')}
        {renderFileUpload('coverPhoto', 'Cover Photo', 'image/*')}
        {renderFileUpload('resume', 'Resume / CV', '.pdf,.doc,.docx')}
      </div>

      {/* Certificates */}
      <div className="p-3 sm:p-4 bg-bg-light rounded-xl">
        <label className="block text-sm font-semibold text-text-dark mb-3">Certificates</label>
        {formData.certificates.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.certificates.map((cert, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-border-light">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-dark truncate">{cert.title}</p>
                  <p className="text-xs text-text-light">{cert.issuer}{cert.year ? ` (${cert.year})` : ''}</p>
                </div>
                <button onClick={() => removeCertificate(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2">
                  <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input type="text" value={certInput.title} onChange={e => setCertInput(p => ({ ...p, title: e.target.value }))} placeholder="Certificate title" className="w-full sm:flex-1 px-3 sm:px-4 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm" />
          <input type="text" value={certInput.issuer} onChange={e => setCertInput(p => ({ ...p, issuer: e.target.value }))} placeholder="Issuer" className="w-full sm:flex-1 px-3 sm:px-4 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm" />
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="number" value={certInput.year} onChange={e => setCertInput(p => ({ ...p, year: e.target.value }))} placeholder="Year" className="flex-1 sm:w-24 px-3 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm min-w-0" />
            <button onClick={addCertificate} className="px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm flex items-center gap-1 whitespace-nowrap flex-shrink-0">
              <FiPlus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Awards */}
      <div className="p-3 sm:p-4 bg-bg-light rounded-xl">
        <label className="block text-sm font-semibold text-text-dark mb-3">Awards</label>
        {formData.awards.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.awards.map((award, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-border-light">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-dark truncate">{award.title}</p>
                  <p className="text-xs text-text-light">{award.year}{award.description ? ` - ${award.description}` : ''}</p>
                </div>
                <button onClick={() => removeAward(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2">
                  <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input type="text" value={awardInput.title} onChange={e => setAwardInput(p => ({ ...p, title: e.target.value }))} placeholder="Award title" className="w-full sm:flex-1 px-3 sm:px-4 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm" />
          <input type="number" value={awardInput.year} onChange={e => setAwardInput(p => ({ ...p, year: e.target.value }))} placeholder="Year" className="w-full sm:w-24 px-3 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm" />
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="text" value={awardInput.description} onChange={e => setAwardInput(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="flex-1 px-3 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm min-w-0" />
            <button onClick={addAward} className="px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm flex items-center gap-1 whitespace-nowrap flex-shrink-0">
              <FiPlus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>

      <div>
        {renderFileUpload('additionalDocuments', 'Additional Documents', 'image/*,.pdf', true)}
      </div>
    </div>
  );

  const profileRejected = user?.profileVerificationStatus === 'rejected' || user?.profileVerificationStatus === 'changes_requested';

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-soft via-white to-primary-light pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-dark mb-2 sm:mb-3 px-2">
            {profileRejected ? 'Update Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-text-body text-sm sm:text-base lg:text-lg px-2">
            {profileRejected ? 'Please update your profile based on the feedback below' : 'Please complete your profile to access the teacher dashboard'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10">
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
            {currentStep === 1 && renderQualification()}
            {currentStep === 2 && renderSkills()}
            {currentStep === 3 && renderSocialLinks()}
            {currentStep === 4 && renderDocuments()}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 mt-8 pt-6 border-t border-border-light">
            <button onClick={handlePrev} disabled={currentStep === 0}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${currentStep === 0 ? 'text-text-light cursor-not-allowed opacity-50' : 'border-2 border-border-light text-text-body hover:bg-bg-light'}`}>
              ← Previous
            </button>
            <div className="text-xs sm:text-sm text-text-light order-first sm:order-none w-full sm:w-auto text-center mb-2 sm:mb-0">
              <span className="inline-block px-3 py-1 bg-bg-light rounded-full text-xs font-medium">Step {currentStep + 1} of {STEPS.length}</span>
            </div>
            {currentStep < STEPS.length - 1 ? (
              <button onClick={handleNext}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-sm sm:text-base">
                Next <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
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
