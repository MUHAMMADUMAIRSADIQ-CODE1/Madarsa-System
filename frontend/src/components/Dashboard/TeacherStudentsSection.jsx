import { teacherDashboardData } from '../../data/teacherDashboardData';

export default function TeacherStudentsSection() {
  const students = teacherDashboardData.students || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">My Students</h2>
        <button className="px-4 py-2 text-primary font-semibold text-sm hover:underline">
          View All
        </button>
      </div>

      <div className="min-w-full">
        <table className="w-full">
          <thead className="border-b-2 border-border-light">
            <tr>
              <th className="text-left p-3 font-semibold text-text-dark">Name</th>
              <th className="text-left p-3 font-semibold text-text-dark">Course</th>
              <th className="text-center p-3 font-semibold text-text-dark">Attendance</th>
              <th className="text-center p-3 font-semibold text-text-dark">Progress</th>
              <th className="text-center p-3 font-semibold text-text-dark">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-bg-light transition-colors">
                <td className="p-3">
                  <div>
                    <p className="font-semibold text-text-dark">{student.name}</p>
                    <p className="text-xs text-text-light">{student.email}</p>
                  </div>
                </td>
                <td className="p-3 text-text-body">{student.course}</td>
                <td className="p-3 text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {student.attendance}%
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-16 h-2 bg-bg-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-text-dark">{student.progress}%</span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <button className="px-3 py-1 text-primary font-semibold text-sm hover:underline">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
