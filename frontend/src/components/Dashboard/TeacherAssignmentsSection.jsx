import { teacherDashboardData } from '../../data/teacherDashboardData';
import { FiCalendar } from 'react-icons/fi';

export default function TeacherAssignmentsSection() {
  const assignments = teacherDashboardData.assignments || [];

  const getStatusColor = (status) => {
    switch(status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending-grading':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">Assignments</h2>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors">
          + Create
        </button>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => {
          const submissionPercent = Math.round((assignment.submissions / assignment.total) * 100);

          return (
            <div
              key={assignment.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all ${getStatusColor(assignment.status)}`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-dark text-lg">{assignment.title}</h3>
                <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mt-2 text-sm text-text-dark/70">
                  <span>{assignment.course}</span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Submissions Progress */}
                <div className="mt-3 max-w-md">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-medium">Submissions: {assignment.submissions}/{assignment.total}</p>
                    <p className="text-xs font-semibold">{submissionPercent}%</p>
                  </div>
                  <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-dark"
                      style={{ width: `${submissionPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 border-2 border-current text-current rounded-lg font-semibold hover:opacity-80 transition-opacity text-sm whitespace-nowrap">
                  Grade
                </button>
                <button className="px-4 py-2 bg-current text-white rounded-lg font-semibold hover:opacity-80 transition-opacity text-sm whitespace-nowrap">
                  Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
