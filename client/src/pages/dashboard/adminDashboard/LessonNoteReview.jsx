// src/pages/dashboard/LessonNoteReview.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonNoteReview() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/lesson-notes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotes(res.data.lessonNotes || []);
      console.log(res.data.lessonNotes)
    } catch (err) {
      setError('Failed to load lesson notes');
      toast.error('Failed to load lesson notes');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (noteId, status) => {
    if (status === 'rejected' && !feedback.trim()) {
      toast.error('Feedback is required for rejection');
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/lesson-notes/${noteId}/review`,
        { status, feedback: status === 'rejected' ? feedback.trim() : undefined },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success(`Lesson note ${status}`);
      setNotes(prev => prev.map(n => (n._id === noteId ? res.data.lessonNote : n)));
      setSelectedNote(null);
      setFeedback('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 flex items-center gap-3">
          <FileText className="h-10 w-10 text-indigo-600" />
          Lesson Note Approval
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-2xl text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white rounded-3xl shadow border border-gray-200 p-12 text-center">
            <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Pending Lesson Notes
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Teachers have not uploaded any lesson notes yet, or all are reviewed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {notes.map(note => (
              <div
                key={note._id}
                className={`bg-white rounded-3xl shadow-lg border p-6 md:p-8 transition-all ${
                  note.status === 'pending'
                    ? 'border-amber-300 hover:border-amber-500'
                    : note.status === 'approved'
                    ? 'border-green-300 bg-green-50/30'
                    : 'border-red-300 bg-red-50/30'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{note.title}</h3>
                    <p className="text-gray-600 mt-1">
                      {note.subject} • {note.className} • Week {note.week}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-4 py-1.5 rounded-full text-sm font-medium ${
                      note.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : note.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  Uploaded by <span className="font-medium">{note.teacher?.name || 'Unknown'}</span> on{' '}
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>

                <div className="flex gap-4 mb-6">
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-5 bg-indigo-600 text-white rounded-xl font-medium text-center hover:bg-indigo-700 transition"
                  >
                    View/Download Note
                  </a>
                </div>

                {note.status === 'pending' && (
                  <div className="space-y-4">
                    <textarea
                      placeholder="Add feedback (required if rejecting)"
                      value={selectedNote?._id === note._id ? feedback : ''}
                      onChange={(e) => {
                        setSelectedNote(note);
                        setFeedback(e.target.value);
                      }}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition min-h-[100px]"
                      disabled={loading}
                    />

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleReview(note._id, 'approved')}
                        disabled={loading}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>

                      <button
                        onClick={() => handleReview(note._id, 'rejected')}
                        disabled={loading || !feedback.trim()}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {note.feedback && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Admin Feedback:</p>
                    <p className="text-gray-600 mt-1">{note.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}