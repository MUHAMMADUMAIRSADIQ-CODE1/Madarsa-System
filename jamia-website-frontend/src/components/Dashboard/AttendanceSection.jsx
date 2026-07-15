import { useState, useEffect } from 'react';
import { studentDashboardData } from '../../data/studentDashboardData';
import attendanceService from '../../services/attendanceService';

export default function AttendanceSection({ studentId }) {
  const [attendanceData, setAttendanceData] = useState(studentDashboardData.attendance || {});
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(!!studentId);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!studentId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await attendanceService.getStudentAttendance(studentId, { month, year });
        if (res?.data) {
          setAttendanceData(res.data.stats || { percentage: 0, total: 0, present: 0, absent: 0, late: 0, excused: 0 });
          setRecords(res.data.data || []);
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId, month, year]);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const currentMonthName = monthNames[month - 1];
  const mockByMonth = attendanceData.byMonth || [];
  const currentMonthData = mockByMonth.find(m => m.month === currentMonthName);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-light mt-4">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">Attendance</h2>
        {studentId && (
          <div className="flex gap-2">
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="px-3 py-2 rounded-lg border border-border-light text-sm outline-none">
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx + 1}>{name}</option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="px-3 py-2 rounded-lg border border-border-light text-sm outline-none">
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-xl p-6 border border-primary/20">
          <p className="text-sm text-text-light font-medium">Overall Attendance</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-bold text-primary">{attendanceData.percentage ?? 0}%</span>
          </div>
          <p className="text-xs text-text-light mt-3">
            {attendanceData.present || 0} present out of {attendanceData.total || 0} classes
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-text-light font-medium">{studentId ? 'This Month' : 'Current Month'}</p>
          <p className="text-3xl font-bold text-green-600 mt-4">
            {studentId ? (attendanceData.percentage || 0) : (currentMonthData ? currentMonthData.percentage : attendanceData.attended ?? 0)}%
          </p>
          <p className="text-xs text-text-light mt-3">
            {studentId ? `${attendanceData.present || 0} present` : 'This month'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-sm text-text-light font-medium">Classes Missed</p>
          <p className="text-3xl font-bold text-yellow-600 mt-4">
            {studentId ? (attendanceData.absent || 0) + (attendanceData.late || 0) : (attendanceData.missed ?? 0)}
          </p>
          <p className="text-xs text-text-light mt-3">This semester</p>
        </div>
      </div>

      {records.length > 0 && (
        <div className="overflow-x-auto mb-8">
          <h3 className="font-semibold text-lg text-text-dark mb-4">Recent Records</h3>
          <table className="w-full">
            <thead className="border-b-2 border-border-light">
              <tr>
                <th className="text-left p-3 font-semibold text-text-dark text-sm">Date</th>
                <th className="text-left p-3 font-semibold text-text-dark text-sm">Course</th>
                <th className="text-left p-3 font-semibold text-text-dark text-sm">Teacher</th>
                <th className="text-center p-3 font-semibold text-text-dark text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {records.map((record) => (
                <tr key={record._id} className="hover:bg-bg-light">
                  <td className="p-3 text-sm text-text-body">{new Date(record.classDate).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-semibold text-text-dark">{record.course?.title || 'N/A'}</td>
                  <td className="p-3 text-sm text-text-body">{record.teacher?.fullName || 'N/A'}</td>
                  <td className="p-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>{record.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(!studentId && mockByMonth.length > 0) && (
        <div>
          <h3 className="font-semibold text-lg text-text-dark mb-4">Monthly Breakdown</h3>
          <div className="space-y-3">
            {mockByMonth.map((month, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-text-dark">{month.month}</div>
                <div className="flex-1 h-2 bg-bg-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300"
                    style={{ width: `${month.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-semibold text-primary">{month.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
