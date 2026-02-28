











// src/pages/teacher/TeacherExamDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Eye, Edit, Trash2, BookOpen, CheckCircle, FileText, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,

} from 'chart.js';
import { BarChart2 } from 'lucide-react';
import CreateExamModal from './CreateExamModal';
import { PieChart} from 'lucide-react';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
import TimetableCard from '../superAdmin/ExamTimeTableCard';
import TimetableDetailsModal from '../superAdmin/TimeTableModal';
export default function TeacherExamDashboard() {
  const [exams, setExams] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [chartData, setChartData] = useState({
    statusPie: null,
    marksBar: null,
  });
  // Stats
  const totalExams = exams.length + drafts.length;
  const publishedCount = exams.length;
  const draftCount = drafts.length;
  const totalQuestions = [...exams, ...drafts].reduce((sum, e) => sum + (e.questions?.length || 0), 0);
// Add this state for preview modal
const [previewExam, setPreviewExam] = useState(null);

const [teacherTimetables, setTeacherTimetables] = useState([]);

useEffect(() => {
  const fetchTeacherTimetables = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/exams/timetable/teacher`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTeacherTimetables(res.data.timetables || []);
    } catch (err) {
      console.error('Failed to load teacher timetables', err);
    }
  };
  fetchTeacherTimetables();
}, []);

// Add this function to open preview
const openPreview = (exam) => {
  setPreviewExam(exam);
};

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/exams/questions/my`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const all = res.data.exams || [];
      setExams(all.filter(e => e.status === 'published'));
      setDrafts(all.filter(e => e.status === 'draft'));
      updateCharts(all);
    } catch (err) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

 const updateCharts = (allExams) => {
  // Status Pie
  const statusCounts = allExams.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});
  setChartData(prev => ({
    ...prev,
    statusPie: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      }],
    },
  }));

  // Marks Bar
  const marks = allExams.map(e => e.totalMarks);
  const avgMarks = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
  setChartData(prev => ({
    ...prev,
    marksBar: {
      labels: ['Average Marks', 'Highest Marks'],
      datasets: [{
        label: 'Marks',
        data: [avgMarks, Math.max(...marks, 0)],
        backgroundColor: '#6366f1',
      }],
    },
  }));
};
  const deleteExam = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/exams/questions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Exam deleted');
      fetchExams();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (exam) => {
    setEditExam(exam);
    setShowCreateModal(true);
  };

  const handleSave = () => {
    setShowCreateModal(false);
    setEditExam(null);
    fetchExams();
  };
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Exam Insights' },
  },
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Colorful Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Exams</p>
                <p className="text-4xl font-bold mt-2">{totalExams}</p>
              </div>
              <BookOpen className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Published</p>
                <p className="text-4xl font-bold mt-2">{publishedCount}</p>
              </div>
              <CheckCircle className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Drafts</p>
                <p className="text-4xl font-bold mt-2">{draftCount}</p>
              </div>
              <FileText className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Questions</p>
                <p className="text-4xl font-bold mt-2">{totalQuestions}</p>
              </div>
              <BarChart2 className="h-12 w-12 opacity-50" />
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditExam(null);
              setShowCreateModal(true);
            }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg flex items-center gap-3"
          >
            <Plus size={24} />
            Create New Exam
          </button>
        </div>

        {previewExam && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 flex justify-between items-center rounded-t-3xl">
        <h2 className="text-2xl md:text-3xl font-bold line-clamp-1">
          {previewExam.title}
        </h2>
        <button
          onClick={() => setPreviewExam(null)}
          className="p-2 rounded-full hover:bg-white/20 transition"
        >
          <X size={28} />
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6 md:p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <p><strong>Subject:</strong> {previewExam.subject}</p>
            <p><strong>Class:</strong> {previewExam.className}</p>
          </div>
          <div>
            <p><strong>Total Marks:</strong> {previewExam.totalMarks}</p>
            <p><strong>Duration:</strong> {previewExam.durationMinutes} minutes</p>
            {previewExam.isCBT && (
              <p><strong>CBT Available From:</strong> {new Date(previewExam.cbtAvailableFrom).toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-gray-900">Questions</h3>
          {previewExam.questions.map((q, idx) => (
            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Question {idx + 1} ({q.marks} marks)
                </h4>
                <span className="text-sm text-gray-600 capitalize">{q.type.replace('_', ' ')}</span>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: q.questionText }}
                className="prose max-w-none text-gray-700"
              />
              {q.type === 'multiple_choice' && q.options.length > 0 && (
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  {q.options.map((opt, i) => (
                    <li key={i} className="text-gray-700">{opt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}


<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {chartData.statusPie && (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-6 md:p-8 border border-indigo-100">
      <h2 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
        <PieChart size={24} className="text-indigo-600" />
        Exam Status Breakdown
      </h2>
      <div className="h-80">
        <Pie data={chartData.statusPie} options={chartOptions} />
      </div>
    </div>
  )}

  {chartData.marksBar && (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-6 md:p-8 border border-purple-100">
      <h2 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-3">
        <BarChart2 size={24} className="text-purple-600" />
        Marks Distribution
      </h2>
      <div className="h-80">
        <Bar data={chartData.marksBar} options={chartOptions} />
      </div>
    </div>
  )}
</div>


        {/* Published Exams */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Exams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <div key={exam._id} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{exam.title}</h3>
                <p className="text-gray-700 mb-2"><strong>Subject:</strong> {exam.subject}</p>
                <p className="text-gray-700 mb-4"><strong>Class:</strong> {exam.className}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openPreview(exam)}
                    className="flex-1 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200"
                  >
                    Preview
                  </button>
                  <button
  onClick={() => {
    setEditExam(exam);
    setShowCreateModal(true);
  }}
  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition flex items-center gap-2"
>
  <Edit size={18} />
  Edit
</button>
                  <button
                    onClick={() => deleteExam(exam._id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Drafts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map(draft => (
              <div key={draft._id} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{draft.title || 'Untitled Draft'}</h3>
                <p className="text-gray-700 mb-2"><strong>Subject:</strong> {draft.subject}</p>
                <p className="text-gray-700 mb-4"><strong>Created:</strong> {new Date(draft.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditExam(draft);
                      setShowCreateModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl hover:bg-yellow-200"
                  >
                    Edit Draft
                  </button>
                  <button
                    onClick={() => deleteExam(draft._id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher's Timetables Section */}
<div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
  <h2 className="text-2xl font-bold text-gray-900 mb-6"> Exam Timetables</h2>

  {teacherTimetables.length === 0 ? (
    <div className="text-center py-12 bg-gray-50 rounded-2xl">
      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">No timetables scheduled for your classes yet.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teacherTimetables.map(tt => (
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

        {/* Create/Edit Modal */}
        <CreateExamModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditExam(null);
          }}
          onSave={handleSave}
          initialData={editExam}
        />
      </div>
    </div>
  );
}
