import {
  FiUser, FiBookOpen, FiCalendar, FiClipboard,
  FiAward, FiDownload, FiArrowRight,
} from 'react-icons/fi';

const actions = [
  { id: 'teacher', label: 'View Teacher', icon: FiUser, color: 'text-primary bg-primary/10 hover:bg-primary/20 border-primary/20' },
  { id: 'course', label: 'View Course', icon: FiBookOpen, color: 'text-blue-600 bg-blue-100 hover:bg-blue-200 border-blue-200' },
  { id: 'attendance', label: 'Attendance', icon: FiCalendar, color: 'text-purple-600 bg-purple-100 hover:bg-purple-200 border-purple-200', placeholder: true },
  { id: 'assignments', label: 'Assignments', icon: FiClipboard, color: 'text-orange-600 bg-orange-100 hover:bg-orange-200 border-orange-200', placeholder: true },
  { id: 'results', label: 'Results', icon: FiAward, color: 'text-green-600 bg-green-100 hover:bg-green-200 border-green-200', placeholder: true },
  { id: 'downloads', label: 'Download Docs', icon: FiDownload, color: 'text-teal-600 bg-teal-100 hover:bg-teal-200 border-teal-200', placeholder: true },
];

export default function StudentQuickActions({ onAction, hasTeacher = false }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-border-light">
      <h3 className="font-heading text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
        <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <FiArrowRight size={18} className="text-primary" />
        </span>
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isDisabled = action.placeholder;

          return (
            <button
              key={action.id}
              onClick={() => !isDisabled && onAction?.(action.id)}
              className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                isDisabled
                  ? 'border-border-light bg-bg-light/50 text-text-light cursor-not-allowed opacity-60'
                  : `${action.color} cursor-pointer hover:shadow-md`
              }`}
              title={isDisabled ? `${action.label} - Coming soon` : action.label}
            >
              <Icon size={20} />
              <span className="text-xs font-semibold text-center leading-tight">{action.label}</span>
              {isDisabled && (
                <span className="text-[10px] text-text-light opacity-70">Coming soon</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
