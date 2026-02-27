// src/pages/teacher/TeacherExamDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Eye, Edit, Trash2, BarChart2, PieChart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
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
import CreateExamModal from './CreateExamModal'; // The modal component below
import CBTStudentInterface from './CBTStudentInterface'; // Student interface below

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function TeacherExamDashboard() {
  const [exams, setExams] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewExam, setPreviewExam] = useState(null);
  const [chartData, setChartData] = useState({
    statusPie: null,
    marksBar: null,
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/exams/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const allExams = res.data.exams || [];
      setExams(allExams.filter(e => e.status === 'published'));
      setDrafts(allExams.filter(e => e.status === 'draft'));
      updateCharts(allExams);
    } catch (err) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const updateCharts = (allExams) => {
    // Pie Chart: Exam Status Distribution
    const statusCounts = allExams.reduce((acc, exam) => {
      acc[exam.status] = (acc[exam.status] || 0) + 1;
      return acc;
    }, {});

    setChartData(prev => ({
      ...prev,
      statusPie: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#6366f1', '#f59e0b', '#ef4444'],
        }],
      },
    }));

    // Bar Chart: Marks Distribution
    const marksRanges = { '0-50': 0, '51-100': 0, '101+': 0 };
    allExams.forEach(exam => {
      if (exam.totalMarks <= 50) marksRanges['0-50']++;
      else if (exam.totalMarks <= 100) marksRanges['51-100']++;
      else marksRanges['101+']++;
    });

    setChartData(prev => ({
      ...prev,
      marksBar: {
        labels: Object.keys(marksRanges),
        datasets: [{
          label: 'Number of Exams',
          data: Object.values(marksRanges),
          backgroundColor: '#6366f1',
        }],
      },
    }));
  };

  const deleteExam = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Exam deleted');
      fetchExams();
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  const openPreview = (exam) => {
    setPreviewExam(exam);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Exam Management Dashboard
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            Create New Exam
          </button>
        </div>

        {/* Stats & Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status Pie Chart */}
          {chartData.statusPie && (
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-indigo-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart size={20} className="text-indigo-600" />
                Exam Status Distribution
              </h2>
              <div className="h-64">
                <Pie data={chartData.statusPie} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Marks Bar Chart */}
          {chartData.marksBar && (
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart2 size={20} className="text-purple-600" />
                Marks Distribution
              </h2>
              <div className="h-64">
                <Bar data={chartData.marksBar} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Published Exams Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Exams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam._id} className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{exam.title}</h3>
                  <p className="text-gray-700"><strong>Subject:</strong> {exam.subject}</p>
                  <p className="text-gray-700"><strong>Class:</strong> {exam.className}</p>
                  <p className="text-gray-700"><strong>Marks:</strong> {exam.totalMarks}</p>
                  <p className="text-gray-700"><strong>Duration:</strong> {exam.durationMinutes} min</p>
                  {exam.isCBT && (
                    <p className="text-gray-700"><strong>CBT Start:</strong> {new Date(exam.cbtAvailableFrom).toLocaleString()}</p>
                  )}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => openPreview(exam)}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 flex items-center gap-2"
                    >
                      <Eye size={18} />
                      Preview
                    </button>
                    <button
                      onClick={() => deleteExam(exam._id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {exams.length === 0 && <p className="text-gray-500 text-center py-8 col-span-full">No published exams yet</p>}
          </div>
        </div>

        {/* Drafts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Exam Drafts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <div key={draft._id} className="bg-white rounded-3xl shadow-lg p-6 border border-yellow-100 hover:shadow-xl transition-shadow">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{draft.title || 'Untitled Draft'}</h3>
                  <p className="text-gray-700"><strong>Subject:</strong> {draft.subject}</p>
                  <p className="text-gray-700"><strong>Class:</strong> {draft.className}</p>
                  <p className="text-gray-700"><strong>Created:</strong> {new Date(draft.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowCreateModal(true);
                        // Pre-fill modal with draft data
                      }}
                      className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 flex items-center gap-2"
                    >
                      <Edit size={18} />
                      Continue Editing
                    </button>
                    <button
                      onClick={() => deleteExam(draft._id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete Draft
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {drafts.length === 0 && <p className="text-gray-500 text-center py-8 col-span-full">No drafts saved yet</p>}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateExamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={fetchExams}
        initialData={null} // For edit, pass draft/exam data
      />

      {/* Preview Modal */}
      {previewExam && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{previewExam.title} Preview</h2>
              <button onClick={() => setPreviewExam(null)} className="text-gray-500 hover:text-gray-700">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-8">
              {previewExam.questions.map((q, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Question {i + 1} ({q.marks} marks)</h3>
                  <div dangerouslySetInnerHTML={{ __html: q.questionText }} className="prose max-w-none" />
                  {q.type === 'multiple_choice' && (
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      {q.options.map((opt, optIdx) => (
                        <li key={optIdx} className="text-gray-700">{opt}</li>
                      ))}
                    </ul>
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