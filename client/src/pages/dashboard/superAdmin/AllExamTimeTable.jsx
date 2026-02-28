// src/pages/admin/AdminTimetables.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Calendar, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ExamTimetableModal from '../adminDashboard/ExamTimeTableModal';
import TimetableCard from './ExamTimeTableCard';
import TimetableDetailsModal from './TimeTableModal';
export default function AdminTimetables() {
  const [timetables, setTimetables] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTimetable, setSelectedTimetable] = useState(null); // for view details
  const [editTimetable, setEditTimetable] = useState(null); // for edit modal
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/exams/timetable`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTimetables(res.data.timetables || []);
      setFiltered(res.data.timetables || []);
    } catch (err) {
      toast.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/exams/timetable/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Timetable deleted');
      setTimetables(prev => prev.filter(t => t._id !== id));
      setFiltered(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      toast.error('Failed to delete timetable');
    }
  };

  const handleEdit = (timetable) => {
    setEditTimetable(timetable);
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    setShowEditModal(false);
    setEditTimetable(null);
    fetchTimetables(); // refresh list
  };

  useEffect(() => {
    const term = search.toLowerCase();
    const filteredList = timetables.filter(t =>
      t.year.toLowerCase().includes(term) ||
      t.term.toLowerCase().includes(term)
    );
    setFiltered(filteredList);
  }, [search, timetables]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-100">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            All Exam Timetables
          </h1>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by year or term..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl shadow-xl">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Timetables Found</h2>
              <p className="text-gray-600">Create your first timetable or adjust search.</p>
            </div>
          ) : (
            filtered.map(timetable => (
              <div key={timetable._id} className="relative">
                <TimetableCard
                  timetable={timetable}
                  onViewDetails={() => setSelectedTimetable(timetable)}
                />
                {/* Admin Edit & Delete Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(timetable)}
                    className="p-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                    title="Edit Timetable"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(timetable._id)}
                    className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                    title="Delete Timetable"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {selectedTimetable && (
        <TimetableDetailsModal
          timetable={selectedTimetable}
          onClose={() => setSelectedTimetable(null)}
        />
      )}

      {/* Edit Modal (reuses your ExamTimetableModal) */}
      {showEditModal && editTimetable && (
        <ExamTimetableModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditTimetable(null);
          }}
          onSave={handleEditSave}
          initialData={editTimetable} // pass existing timetable for editing
        />
      )}
    </div>
  );
}