import { studentDashboardData } from '../../data/studentDashboardData';

export default function AssignmentsSection() {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPendingAssignments = () => {
    return (studentDashboardData.assignments || []).filter(a => a.status !== 'graded').slice(0, 5);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-dark">Assignments</h2>
          <p className="text-sm text-text-light mt-1">{getPendingAssignments().length} pending</p>
        </div>
        <a href="#" className="text-primary font-semibold text-sm hover:underline">View All</a>
      </div>

      <div className="space-y-3">
        {getPendingAssignments().map((assignment) => {
          const dueDate = new Date(assignment.dueDate);
          const today = new Date();
          const isOverdue = dueDate < today && assignment.status === 'pending';
          
          return (
            <div
              key={assignment.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all ${
                isOverdue 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-border-light hover:border-primary hover:bg-bg-light'
              }`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-dark text-lg">{assignment.title}</h3>
                <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mt-2 text-sm text-text-light">
                  <span>{assignment.course}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Due: {dueDate.toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assignment.status)} whitespace-nowrap`}>
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </span>
                
                {assignment.status === 'pending' && (
                  <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm">
                    Submit
                  </button>
                )}
                
                {assignment.status === 'graded' && (
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm">
                    Grade: {assignment.score ?? 0}/100
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {getPendingAssignments().length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-text-light">All assignments completed!</p>
        </div>
      )}
    </div>
  );
}
