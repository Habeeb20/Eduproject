// src/components/timetable/ClassTimetableView.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Calendar, Clock, BookOpen, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function ClassTimetableView({ role }) {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimetable, setSelectedTimetable] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, [role]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/timetables/view`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: { role } // optional: backend can use this for extra filtering
        }
      );
      setTimetables(res.data.timetables || []);
      if (res.data.timetables.length > 0) {
        setSelectedTimetable(res.data.timetables[0]); // show latest by default
      }
    } catch (err) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (timetables.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-lg">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Timetable Available
          </h2>
          <p className="text-gray-600">
            {role === 'student' || role === 'parent'
              ? "Your class doesn't have a timetable yet. Check back later."
              : "You don't have any classes with scheduled timetables."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto space-y-10 print:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Class Timetable
          </h1>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md print:hidden"
          >
            <Printer size={20} />
            Print Timetable
          </button>
        </div>

        {/* Timetable Selection (if multiple) */}
        {timetables.length > 1 && (
          <div className="flex flex-wrap gap-3 print:hidden">
            {timetables.map((tt) => (
              <button
                key={tt._id}
                onClick={() => setSelectedTimetable(tt)}
                className={`px-5 py-2.5 rounded-full font-medium transition ${
                  selectedTimetable?._id === tt._id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {tt.className} • {tt.term}
              </button>
            ))}
          </div>
        )}

        {/* Selected Timetable */}
        {selectedTimetable && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
            <div className="p-6 md:p-10 bg-gradient-to-r from-indigo-50 to-purple-50 border-b print:bg-white print:border-none">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">
                {selectedTimetable.className} • {selectedTimetable.academicYear} • {selectedTimetable.term} Term
              </h2>
            </div>

            <div className="p-6 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {selectedTimetable.days.map((day) => (
                  <div key={day.day} className="space-y-4">
                    <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-3">
                      <Calendar size={22} />
                      {day.day}
                    </h3>

                    <div className="space-y-3">
                      {day.periods.length === 0 ? (
                        <p className="text-gray-500 italic text-center py-6">
                          No periods scheduled
                        </p>
                      ) : (
                        day.periods.map((period, idx) => (
                          <div
                            key={idx}
                            className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition print:bg-white print:border print:shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <Clock size={18} className="text-indigo-600" />
                                <span className="font-medium">
                                  {period.startTime} – {period.endTime}
                                </span>
                              </div>
                              {period.venue && (
                                <span className="text-sm text-gray-600">
                                  Venue: {period.venue}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <BookOpen size={18} className="text-purple-600" />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {period.subject}
                                </p>
                                {period.teacher?.name && (
                                  <p className="text-sm text-gray-600">
                                    Teacher: {period.teacher.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}