// src/pages/admin/ClassTimetableManager.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar, Save, Trash2, Edit3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ClassTimetableModal from './TimeTableModal';


export default function ClassTimetableManager() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);


  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/timetables`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTimetables(res.data.timetables || []);
    } catch (err) {
      toast.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };
  


  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/timetables/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Timetable deleted');
      fetchTimetables();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (timetable) => {
    setEditingTimetable(timetable);
    setModalOpen(true);
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditingTimetable(null);
    fetchTimetables();
  };

  return (
    <div className="min-h-screen bg-grey p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Class Timetables
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Create and manage weekly timetables for each class
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTimetable(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
          >
            <Plus size={20} />
            Create New Timetable
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : timetables.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Timetables Created Yet
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Click "Create New Timetable" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timetables.map((tt) => (
              <div
                key={tt._id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {tt.className}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tt.academicYear} • {tt.term} Term
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(tt)}
                        className="p-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(tt._id)}
                        className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {tt.days.slice(0, 3).map((day, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                          {day.day.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-medium">{day.day}</p>
                          <p className="text-sm text-gray-600">
                            {day.periods.length} periods
                          </p>
                        </div>
                      </div>
                    ))}
                    {tt.days.length > 3 && (
                      <p className="text-sm text-center text-gray-500">
                        + {tt.days.length - 3} more days
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClassTimetableModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTimetable(null);
        }}
        onSave={handleSave}
        initialData={editingTimetable}
      />
    </div>
  );
}















































