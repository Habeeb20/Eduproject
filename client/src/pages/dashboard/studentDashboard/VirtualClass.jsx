// src/pages/MyVirtualClasses.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Loader2, 
  Calendar, 
  Video, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  History, 
  Edit3,X,Plus 
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
export default function MyVirtualClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); // 'teacher' or 'student'

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/virtual-classes/my`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setClasses(res.data.classes || []);
    } catch (err) {
      toast.error('Failed to load virtual classes');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (classId, newStatus, note = '') => {
    setUpdatingId(classId);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/virtual-classes/${classId}/status`,
        { status: newStatus, note },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // Update local state
      setClasses(prev =>
        prev.map(c =>
          c._id === classId ? { ...c, status: newStatus, history: res.data.virtualClass.history } : c
        )
      );
      toast.success(`Class marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const openHistoryModal = (history, title) => {
    setSelectedHistory(history);
    setSelectedTitle(title);
    setShowHistoryModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };

    const icons = {
      pending: <Clock size={16} />,
      completed: <CheckCircle size={16} />,
      cancelled: <XCircle size={16} />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {userRole === 'teacher' ? 'My Created Virtual Classes' : ' Virtual Classes'}
          </h1>

          {userRole === 'teacher' && (
            <button
              onClick={() => navigate('/dashboard/create-virtual')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-md"
            >
              <Plus size={20} />
              Create New Class
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Virtual Classes Found
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {userRole === 'teacher'
                ? 'Create your first virtual class to get started.'
                : 'Your teachers have not scheduled any virtual classes for you yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((vc) => (
              <div
                key={vc._id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Header */}
                <div className="p-6 pb-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{vc.title}</h3>
                    {getStatusBadge(vc.status)}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={vc.teacher.profilePicture || 'https://ui-avatars.com/?name=' + vc.teacher.name}
                      alt={vc.teacher.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{vc.teacher.name}</p>
                      <p className="text-xs text-gray-500">Teacher</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar size={18} className="text-indigo-600 flex-shrink-0" />
                    <span>{new Date(vc.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>

                  <a
                    href={vc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                  >
                    <Video size={18} />
                    Join Virtual Class
                  </a>

                  {/* Target Info */}
                  <div className="text-sm text-gray-600">
                    {vc.targetType === 'classes' ? (
                      <p>
                        <span className="font-medium">Classes:</span>{' '}
                        {vc.targetClasses.join(', ') || 'All classes'}
                      </p>
                    ) : (
                      <p>
                        <span className="font-medium">Students:</span>{' '}
                        {vc.targetStudents.length} selected
                      </p>
                    )}
                  </div>

                  {/* Status Actions (Teachers only) */}
                  {userRole === 'teacher' && vc.status === 'pending' && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <button
                        onClick={() => updateStatus(vc._id, 'completed', 'Class conducted successfully')}
                        disabled={updatingId === vc._id}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Mark Completed
                      </button>

                      <button
                        onClick={() => updateStatus(vc._id, 'cancelled', 'Class cancelled')}
                        disabled={updatingId === vc._id}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Cancel Class
                      </button>
                    </div>
                  )}

                  {/* History Button */}
                  {vc.history?.length > 0 && (
                    <button
                      onClick={() => openHistoryModal(vc.history, vc.title)}
                      className="w-full mt-4 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition flex items-center justify-center gap-2"
                    >
                      <History size={18} />
                      View Status History ({vc.history.length})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold line-clamp-1">
                Status History: {selectedTitle}
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-full hover:bg-indigo-700 transition"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              {selectedHistory.map((entry, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-200"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
                    </div>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(entry.changedAt).toLocaleString()}
                    </p>
                  </div>
                  {entry.changedBy && (
                    <p className="text-sm text-gray-500 mt-2">
                      By: {entry.changedBy.name || 'Unknown'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}