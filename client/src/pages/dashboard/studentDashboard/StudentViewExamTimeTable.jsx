// src/pages/student/StudentTimetables.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import TimetableCard from '../superAdmin/ExamTimeTableCard';
import TimetableDetailsModal from '../superAdmin/TimeTableModal';


export default function StudentTimetables() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
const [selectedTimetable, setSelectedTimetable] = useState(null);
  useEffect(() => {
    fetchMyTimetables();
  }, []);

  const fetchMyTimetables = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/exams/timetable/my`, // new endpoint
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTimetables(res.data.timetables || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load your exam timetable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center md:text-left">
          My Exam Timetable
        </h1>

        {timetables.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800">No Timetable Yet</h2>
            <p className="text-gray-600 mt-2">Check back later or contact your teacher.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timetables.map(tt => (
              <TimetableCard
                key={tt._id}
                timetable={tt}
                onViewDetails={() => setSelectedTimetable(tt)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedTimetable && (
  <TimetableDetailsModal
    timetable={selectedTimetable}

    onClose={() => setSelectedTimetable(null)}
  />
)}

      {/* {selected && <TimetableDetailsModal timetable={selected} onClose={() => setSelected(null)} />} */}
    </div>
  );
}