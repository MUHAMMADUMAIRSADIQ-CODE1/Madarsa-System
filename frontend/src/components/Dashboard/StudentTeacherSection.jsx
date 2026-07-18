import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentPortalService from '../../services/studentPortalService';
import { Badge } from '../common/AdminDetailView';
import {
  FiUser, FiMail, FiPhone, FiBookOpen, FiBriefcase,
  FiClock, FiCheckCircle, FiAward, FiChevronRight,
  FiStar, FiAlertTriangle, FiRefreshCw,
} from 'react-icons/fi';
import TeacherProfileModal from './TeacherProfileModal';

export default function StudentTeacherSection({ teacher: propTeacher, loading: propLoading }) {
  const { user } = useAuth();
  const [localTeacher, setLocalTeacher] = useState(null);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : false);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const studentId = user?._id || user?.id;

  // Fetch own data when used standalone (no teacher prop)
  const fetchTeacher = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await studentPortalService.getDashboard(studentId);
      const data = res?.data || res;
      setLocalTeacher(data?.assignedTeacher || null);
    } catch (err) {
      setError(err.message || 'Failed to load teacher info');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (propTeacher === undefined && !propLoading) {
      fetchTeacher();
    }
  }, [propTeacher, propLoading, fetchTeacher]);

  const teacher = propTeacher !== undefined ? propTeacher : localTeacher;
  const isLoading = propLoading !== undefined ? propLoading : loading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <FiAlertTriangle size={22} className="text-red-500" />
          </div>
          <h3 className="font-heading font-bold text-text-dark mb-1">Failed to Load</h3>
          <p className="text-xs text-text-light text-center mb-4 max-w-xs">{error}</p>
          <button
            onClick={fetchTeacher}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
          >
            <FiRefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-bg-light rounded-2xl flex items-center justify-center">
            <FiUser size={32} className="text-border-light" />
          </div>
          <h3 className="font-heading text-lg font-bold text-text-dark mb-2">No Teacher Assigned</h3>
          <p className="text-sm text-text-light max-w-sm mx-auto">
            You have not been assigned a teacher yet. Please contact the administration for assistance.
          </p>
        </div>
      </div>
    );
  }

  const subjects = teacher.subjects || [];
  const isVerified = teacher.user?.profileVerificationStatus === 'verified' || teacher.profileVerified;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-border-light hover:shadow-xl transition-shadow duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-dark px-6 py-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <FiAward size={20} className="text-green-200" />
              My Teacher
            </h3>
            {isVerified && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-green-400/20 text-green-200 rounded-full text-xs font-bold border border-green-300/30">
                <FiCheckCircle size={12} />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Teacher Info */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Photo */}
            <div className="flex-shrink-0 relative">
              {teacher.profilePhoto ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-border-light shadow-md">
                  <img src={teacher.profilePhoto} alt={teacher.fullName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center border-2 border-border-light shadow-md">
                  <FiUser size={36} className="text-primary" />
                </div>
              )}
              {teacher.availability === 'available' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full shadow" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h4 className="font-heading text-xl font-bold text-text-dark">{teacher.fullName}</h4>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                {teacher.qualification && (
                  <span className="flex items-center gap-1 text-xs text-text-light">
                    <FiBookOpen size={12} />
                    {teacher.qualification}
                  </span>
                )}
                {teacher.specialization && (
                  <span className="flex items-center gap-1 text-xs text-text-light">
                    <FiBriefcase size={12} />
                    {teacher.specialization}
                  </span>
                )}
                {teacher.experience && (
                  <span className="flex items-center gap-1 text-xs text-text-light">
                    <FiClock size={12} />
                    {teacher.experience} yrs
                  </span>
                )}
              </div>

              {/* Subjects */}
              {subjects.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-3">
                  {subjects.slice(0, 3).map((subj, idx) => (
                    <Badge key={idx} variant="active">{subj}</Badge>
                  ))}
                  {subjects.length > 3 && (
                    <span className="text-xs text-text-light">+{subjects.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Contact */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-3 text-xs text-text-light">
                {teacher.email && (
                  <span className="flex items-center gap-1">
                    <FiMail size={12} />
                    {teacher.email}
                  </span>
                )}
                {teacher.phone && (
                  <span className="flex items-center gap-1">
                    <FiPhone size={12} />
                    {teacher.phone}
                  </span>
                )}
              </div>

              {/* Action */}
              <button
                onClick={() => setShowProfile(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
              >
                <FiStar size={14} />
                View Teacher Profile
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Profile Modal */}
      {showProfile && (
        <TeacherProfileModal
          teacher={teacher}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}
