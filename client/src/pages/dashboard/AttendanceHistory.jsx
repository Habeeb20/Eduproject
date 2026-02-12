// src/pages/dashboard/AttendanceHistory.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function AttendanceHistory({ userId }) { // userId optional for parents/admins
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const endpoint = userId ? `/api/attendance/history/${userId}` : '/api/attendance/history';
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setHistory(res.data.history);
    } catch (err) {
      setError('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader2 className="animate-spin h-12 w-12 mx-auto mt-20" />;

  if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Attendance History</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Method</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              history.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'late' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize text-gray-600">
                    {record.method.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}