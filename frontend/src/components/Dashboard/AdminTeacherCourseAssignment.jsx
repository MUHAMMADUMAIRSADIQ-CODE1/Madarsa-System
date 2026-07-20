import { useState, useEffect, useCallback } from 'react';
import teacherService from '../../services/teacherService';
import courseService from '../../services/courseService';
import { toast } from 'react-toastify';
import {
  FiUser, FiMail, FiBookOpen, FiBriefcase, FiCheck, FiX,
  FiChevronLeft, FiSearch, FiBook, FiCheckSquare,
  FiSquare, FiCalendar, FiClock, FiImage,
} from 'react-icons/fi';

const STATUS_MAP = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  blocked: { label: 'Blocked', color: 'bg-gray-100 text-gray-800' },
  published: { label: 'Published', color: 'bg-green-100 text-green-800' },
  draft: { label: 'Draft', color: 'bg-orange-100 text-orange-800' },
};

function Badge({ children, variant = 'default' }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent';
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    published: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-orange-100 text-orange-800 border-orange-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
  };
  return <span className={`${base} ${variants[variant] || variants.default}`}>{children}</span>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border-light">
          <div className="w-8 h-8 rounded bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="w-12 h-8 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function AdminTeacherCourseAssignment({ teacher, onClose, onSuccess }) {
  const [allCourses, setAllCourses] = useState([]);
  const [assignedCourseIds, setAssignedCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load the teacher's canTeachCourses (assignable) and currently assigned courses
      const [assignableRes, assignedRes] = await Promise.all([
        teacherService.getAssignableCourses(teacher._id),
        teacherService.getAssignedCourses(teacher._id),
      ]);

      const assignable = assignableRes.data || [];
      const assignedData = assignedRes.data || {};

      // Build the full course list from assignable courses
      setAllCourses(assignable);

      // Extract currently assigned course IDs
      const assigned = (assignedData.assignedCourses || []).map(c => c._id || c);
      setAssignedCourseIds(new Set(assigned));
    } catch (err) {
      toast.error(err.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [teacher._id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleCourse = (courseId) => {
    setAssignedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const courseIds = Array.from(assignedCourseIds);
      await teacherService.bulkAssignCourses(teacher._id, courseIds);
      toast.success('Courses assigned successfully');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to assign courses');
    } finally {
      setSaving(false);
    }
  };

  // Filter courses by search
  const filteredCourses = search
    ? allCourses.filter((c) =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
        c.code?.toLowerCase().includes(search.toLowerCase())
      )
    : allCourses;

  const user = teacher.user || {};

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-8 pb-8 overflow-y-auto"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 relative max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white z-10 border-b border-border-light px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-bg-light rounded-lg transition-colors text-text-light hover:text-text-dark">
              <FiChevronLeft size={20} />
            </button>
            <h2 className="font-heading text-xl font-bold text-text-dark">Assign Courses</h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* ── Teacher Profile Card ── */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/[0.02] rounded-2xl border border-primary/10 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                {teacher.profilePhoto ? (
                  <img src={teacher.profilePhoto} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-border-light" />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FiUser size={28} className="text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="font-heading text-lg font-bold text-text-dark">{teacher.fullName}</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-1.5">
                  {teacher.qualification && (
                    <span className="text-xs text-text-light flex items-center gap-1">
                      <FiBookOpen size={12} /> {teacher.qualification}
                    </span>
                  )}
                  {teacher.specialization && (
                    <span className="text-xs text-text-light flex items-center gap-1">
                      <FiBriefcase size={12} /> {teacher.specialization}
                    </span>
                  )}
                  {teacher.email && (
                    <span className="text-xs text-text-light flex items-center gap-1">
                      <FiMail size={12} /> {teacher.email}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                  <Badge variant={user?.status || 'pending'}>
                    {STATUS_MAP[user?.status]?.label || 'Pending'}
                  </Badge>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <FiBook size={12} /> {allCourses.length} Preferred Courses
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                    <FiCheck size={12} /> {assignedCourseIds.size} Assigned
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Course Selection ── */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-heading font-bold text-text-dark text-base">Select Courses to Assign</h3>
                <p className="text-xs text-text-light mt-0.5">
                  Only courses the teacher selected as preferred are shown
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16} />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : allCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-bg-light rounded-full flex items-center justify-center">
                  <FiBookOpen size={28} className="text-text-light" />
                </div>
                <h3 className="text-lg font-bold text-text-dark mb-1">No preferred courses</h3>
                <p className="text-sm text-text-light max-w-md mx-auto">
                  This teacher has not selected any preferred courses in their profile. They need to update their profile first.
                </p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-text-light">No courses match your search.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Select All / Summary Row */}
                <div className="flex items-center justify-between px-2 py-2">
                  <button
                    onClick={() => {
                      if (assignedCourseIds.size === filteredCourses.length) {
                        setAssignedCourseIds(new Set());
                      } else {
                        setAssignedCourseIds(new Set(filteredCourses.map(c => c._id)));
                      }
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-text-body hover:text-primary transition-colors"
                  >
                    {assignedCourseIds.size === filteredCourses.length && filteredCourses.length > 0 ? (
                      <FiCheckSquare size={18} className="text-primary" />
                    ) : (
                      <FiSquare size={18} />
                    )}
                    {assignedCourseIds.size === filteredCourses.length && filteredCourses.length > 0
                      ? 'Deselect All'
                      : 'Select All'}
                    <span className="text-text-light font-normal">({filteredCourses.length} courses)</span>
                  </button>
                  <span className="text-xs text-text-light">
                    {assignedCourseIds.size} of {allCourses.length} selected
                  </span>
                </div>

                {/* Course List */}
                <div className="max-h-[400px] overflow-y-auto pr-1 space-y-2">
                  {filteredCourses.map((course) => {
                    const isAssigned = assignedCourseIds.has(course._id);
                    return (
                      <div
                        key={course._id}
                        onClick={() => toggleCourse(course._id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isAssigned
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border-light hover:border-primary/30 hover:bg-bg-light'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {isAssigned ? (
                            <FiCheckSquare size={20} className="text-primary" />
                          ) : (
                            <FiSquare size={20} className="text-text-light" />
                          )}
                        </div>
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover border border-border-light flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-bg-light flex items-center justify-center flex-shrink-0">
                            <FiImage size={18} className="text-text-light" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-dark text-sm truncate">{course.title}</p>
                          <div className="flex items-center gap-3 text-xs text-text-light mt-0.5">
                            {course.duration && (
                              <span className="flex items-center gap-1">
                                <FiClock size={11} /> {course.duration}
                              </span>
                            )}
                            {course.level && (
                              <Badge variant={course.level === 'all' ? 'default' : course.level}>
                                {course.level}
                              </Badge>
                            )}
                            {course.categoryName && (
                              <span>{course.categoryName}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant={course.status === 'published' ? 'published' : 'draft'}>
                          {STATUS_MAP[course.status]?.label || course.status || 'Draft'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Summary + Actions ── */}
          <div className="flex items-center justify-between pt-4 border-t border-border-light">
            <div className="text-sm text-text-light">
              <span className="font-semibold text-text-dark">{assignedCourseIds.size}</span> course{assignedCourseIds.size !== 1 ? 's' : ''} assigned
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><FiCheck size={16} /> Save Assignments</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
