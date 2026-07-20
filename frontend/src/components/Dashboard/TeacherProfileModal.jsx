import {
  FiX, FiUser, FiMail, FiPhone, FiBookOpen,
  FiBriefcase, FiClock, FiStar, FiAward, FiGlobe,
  FiHeart, FiCheckCircle, FiCalendar,
  FiHome, FiPhoneCall, FiMonitor,
} from 'react-icons/fi';

function SectionCard({ title, icon: Icon, children, cols = 2 }) {
  if (!children) return null;
  const gridCols = cols === 1 ? 'sm:grid-cols-1' : 'sm:grid-cols-2';
  return (
    <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div className="px-5 sm:px-6 py-3.5 border-b border-border-light bg-gradient-to-r from-bg-light/80 to-white">
        <h3 className="flex items-center gap-2 font-heading font-bold text-text-dark text-sm">
          {Icon && (
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon size={14} className="text-primary" />
            </span>
          )}
          {title}
        </h3>
      </div>
      <div className={`p-5 sm:p-6 grid grid-cols-1 ${gridCols} gap-4`}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, icon: Icon }) {
  if (!value && value !== 0) return null;
  return (
    <div className="p-3 sm:p-4 bg-bg-light rounded-xl">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1">
        {Icon && <Icon size={12} />}
        {label}
      </p>
      <p className="text-sm font-semibold text-text-dark leading-relaxed">{value}</p>
    </div>
  );
}

function TagList({ items, color = 'primary' }) {
  if (!items || items.length === 0) return null;
  const colors = {
    primary: 'bg-primary/5 text-primary',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-bg-light text-text-dark',
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${colors[color] || colors.primary}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function StatPill({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center border border-white/10 min-w-[80px]">
      {Icon && <Icon size={16} className="text-white/60 mx-auto mb-0.5" />}
      <p className="text-lg font-bold text-white leading-none">{value ?? '-'}</p>
      <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

export default function TeacherProfileModal({ teacher, onClose }) {
  if (!teacher) return null;

  const subjects = teacher.subjects || [];
  const teachingLanguages = teacher.teachingLanguages || teacher.languages || [];
  const certificates = teacher.certificates || [];
  const isVerified = teacher.user?.profileVerificationStatus === 'verified' || teacher.profileVerified;
  const name = teacher.fullName || 'Teacher';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-6 pb-10 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky -top-6 bg-white z-100 border-b border-border-light px-6 sm:px-8 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-light rounded-lg transition-colors text-text-light hover:text-text-dark"
            >
              <FiX size={20} />
            </button>
            <h2 className="font-heading text-xl font-bold text-text-dark">Teacher Profile</h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Profile Header - Premium Card */}
          <div className="relative bg-gradient-to-br from-primary via-primary-dark to-[#1a3a6b] rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 opacity-[0.04]">
              <div
                className="w-full h-full"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
              />
            </div>
            <div className="absolute top-0 right-0 opacity-[0.07]">
              <svg className="w-96 h-96" viewBox="0 0 400 400" fill="none">
                <circle cx="250" cy="150" r="180" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="250" cy="150" r="120" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent" />

            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {teacher.profilePhoto ? (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl ring-4 ring-white/10">
                      <img src={teacher.profilePhoto} alt={name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 shadow-xl ring-4 ring-white/10">
                      <FiUser size={48} className="text-white/60" />
                    </div>
                  )}
                  {isVerified && (
                    <div className="w-6 h-6 bg-green-400 border-2 border-white rounded-full shadow-lg flex items-center justify-center -mt-3 ml-auto sm:absolute sm:-bottom-0.5 sm:-right-0.5">
                      <FiCheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">{name}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                    {teacher.qualification && (
                      <span className="text-green-100/80 text-sm flex items-center gap-1">
                        <FiBookOpen size={14} /> {teacher.qualification}
                      </span>
                    )}
                    {teacher.specialization && (
                      <span className="text-green-100/80 text-sm flex items-center gap-1">
                        <FiBriefcase size={14} /> {teacher.specialization}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20">
                      Teacher
                    </span>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-200 border border-green-300/30">
                        <FiCheckCircle size={10} />
                        Verified
                      </span>
                    )}
                    {teacher.availability === 'available' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-200 border border-green-300/30">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-2 flex-shrink-0">
                  {teacher.experience && (
                    <StatPill icon={FiClock} label="Experience" value={`${teacher.experience}y`} />
                  )}
                  {subjects.length > 0 && (
                    <StatPill icon={FiBookOpen} label="Subjects" value={subjects.length} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Biography */}
          {teacher.shortBio && (
            <SectionCard title="Short Biography" icon={FiHeart} cols={1}>
              <p className="text-sm text-text-body leading-relaxed">
                {teacher.shortBio}
              </p>
            </SectionCard>
          )}

          {/* Professional Information */}
          <SectionCard title="Professional Information" icon={FiStar} cols={2}>
            <Field label="Full Name" value={teacher.fullName} icon={FiUser} />
            <Field label="Qualification" value={teacher.qualification} icon={FiAward} />
            <Field label="Specialization" value={teacher.specialization} icon={FiBriefcase} />
            <Field label="Experience" value={teacher.experience ? `${teacher.experience} years` : null} icon={FiClock} />
            {subjects.length > 0 && (
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1">
                  <FiBookOpen size={12} />
                  Subjects
                </p>
                <TagList items={subjects} color="primary" />
              </div>
            )}
            {teachingLanguages.length > 0 && (
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1">
                  <FiGlobe size={12} />
                  Teaching Languages
                </p>
                <TagList items={teachingLanguages} color="blue" />
              </div>
            )}
          </SectionCard>

          {/* Certificates & Awards */}
          {certificates.length > 0 && (
            <SectionCard title="Certificates" icon={FiAward} cols={1}>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-text-light">Certificates</p>
                {certificates.map((cert, i) => {
                  const url = typeof cert === 'string' ? cert : cert?.url || '';
                  const name = typeof cert === 'string' ? `Certificate ${i + 1}` : cert?.name || `Certificate ${i + 1}`;
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                      <span className="text-sm font-semibold text-text-dark">{name}</span>
                      {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary font-bold hover:underline px-3 py-1.5 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                          View
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* Contact Information */}
          <SectionCard title="Contact Information" icon={FiMail} cols={2}>
            <Field label="Email" value={teacher.email} icon={FiMail} />
            <Field label="Phone" value={teacher.phone} icon={FiPhone} />
            {teacher.officeAddress && (
              <div className="sm:col-span-2">
                <Field label="Office Address" value={teacher.officeAddress} icon={FiHome} />
              </div>
            )}
            {teacher.emergencyContact && (
              <Field label="Emergency Contact" value={teacher.emergencyContact} icon={FiPhoneCall} />
            )}
            {teacher.emergencyPhone && (
              <Field label="Emergency Phone" value={teacher.emergencyPhone} icon={FiPhoneCall} />
            )}
          </SectionCard>

          {/* Availability & Teaching Mode */}
          <SectionCard title="Availability & Teaching Mode" icon={FiCalendar} cols={2}>
            <div className="p-3 sm:p-4 bg-bg-light rounded-xl">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1">
                <FiClock size={12} />
                Availability
              </p>
              <p className={`text-sm font-bold mt-1 capitalize ${teacher.availability === 'available' ? 'text-green-600' : 'text-yellow-600'}`}>
                {teacher.availability || 'Not specified'}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-bg-light rounded-xl">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-light mb-1">
                <FiMonitor size={12} />
                Teaching Mode
              </p>
              <p className="text-sm font-bold text-text-dark mt-1 capitalize">
                {teacher.teachingMode || 'Not specified'}
              </p>
            </div>
          </SectionCard>
        </div>

        
        
      </div>
    </div>
  );
}
