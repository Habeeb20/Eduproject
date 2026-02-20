// src/pages/dashboard/StudentMarksDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,

} from 'chart.js';

import { Filter, Search, ArrowDown, ArrowUp, Star,Loader2,RefreshCw, BarChart, PieChart, TrendingUp, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#f59e0b', '#ef4444'];

export default function StudentMarksDashboard() {
  const [marks, setMarks] = useState([]);
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/marks/student`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = res.data.marks || [];

      setMarks(data);
      setFilteredMarks(data);

      // Extract unique subjects and terms
      const uniqueSubjects = [...new Set(data.map(m => m.subject))].sort();
      const uniqueTerms = [...new Set(data.map(m => m.term))].sort((a, b) => new Date(b) - new Date(a));
      setSubjects(uniqueSubjects);
      setTerms(uniqueTerms);
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || 'Failed to load marks');
      toast.error('Failed to load your marks');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sort
  useEffect(() => {
    let result = marks;

    // Subject filter
    if (selectedSubject !== 'all') {
      result = result.filter(m => m.subject === selectedSubject);
    }

    // Term filter
    if (selectedTerm !== 'all') {
      result = result.filter(m => m.term === selectedTerm);
    }

    // Score range filter
    result = result.filter(m => m.marks.total >= scoreRange[0] && m.marks.total <= scoreRange[1]);

    // Sort by total score
    result.sort((a, b) => {
      return sortOrder === 'desc' ? b.marks.total - a.marks.total : a.marks.total - b.marks.total;
    });

    setFilteredMarks(result);
  }, [selectedSubject, selectedTerm, scoreRange, sortOrder, marks]);

  // Chart Data: Scores by Subject (Bar Chart)
  const scoresBySubjectData = {
    labels: subjects,
    datasets: [{
      label: 'Average Score',
      data: subjects.map(sub => {
        const subMarks = marks.filter(m => m.subject === sub);
        const avg = subMarks.length > 0 ? subMarks.reduce((acc, m) => acc + m.marks.total, 0) / subMarks.length : 0;
        return avg.toFixed(1);
      }),
      backgroundColor: COLORS,
      borderRadius: 8,
    }],
  };

  // Chart Data: Score Distribution (Doughnut)
  const scoreDistributionData = {
    labels: ['Below 50', '50-69', '70-89', '90-100'],
    datasets: [{
      data: [
        filteredMarks.filter(m => m.marks.total < 50).length,
        filteredMarks.filter(m => m.marks.total >= 50 && m.marks.total < 70).length,
        filteredMarks.filter(m => m.marks.total >= 70 && m.marks.total < 90).length,
        filteredMarks.filter(m => m.marks.total >= 90).length,
      ],
      backgroundColor: ['#ef4444', '#f59e0b', '#14b8a6', '#10b981'],
      hoverOffset: 4,
    }],
  };

  // Chart Data: Progress Over Terms (Pie Chart)
  const progressOverTermsData = {
    labels: terms,
    datasets: [{
      label: 'Average Score Per Term',
      data: terms.map(t => {
        const termMarks = marks.filter(m => m.term === t);
        const avg = termMarks.length > 0 ? termMarks.reduce((acc, m) => acc + m.marks.total, 0) / termMarks.length : 0;
        return avg.toFixed(1);
      }),
      backgroundColor: COLORS.slice(0, terms.length),
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 } } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleColor: 'white', bodyColor: 'white' },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Marks</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchMarks}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              My Academic Performance
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Track your scores, rankings, and progress
            </p>
          </div>
          <button
            onClick={fetchMarks}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
          >
            <RefreshCw size={18} />
            Refresh Data
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 md:p-8 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Filter Your Marks</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Subject Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-base"
              >
                <option value="all">All Subjects</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Term Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term/Session
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-base"
              >
                <option value="all">All Terms</option>
                {terms.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Score Range Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score Range ({scoreRange[0]}% - {scoreRange[1]}%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scoreRange[0]}
                  onChange={(e) => setScoreRange([Number(e.target.value), scoreRange[1]])}
                  className="w-full accent-indigo-600"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scoreRange[1]}
                  onChange={(e) => setScoreRange([scoreRange[0], Number(e.target.value)])}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Sort Toggle */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            >
              Sort by Score {sortOrder === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Scores by Subject - Bar Chart */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart className="h-6 w-6 text-indigo-600" />
              Scores by Subject
            </h3>
            <div className="h-80">
              <Bar data={scoresBySubjectData} options={barOptions} />
            </div>
          </div>

          {/* Score Distribution - Doughnut Chart */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="h-6 w-6 text-indigo-600" />
              Score Distribution
            </h3>
            <div className="h-80">
              <Doughnut data={scoreDistributionData} options={chartOptions} />
            </div>
          </div>

          {/* Progress Over Terms - Pie Chart */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              Progress Over Terms
            </h3>
            <div className="h-80">
              <Pie data={progressOverTermsData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Detailed Marks Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              Detailed Marks ({filteredMarks.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-max divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Term</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">1st Test</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">2nd Test</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">3rd Test</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Mid Term</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Exam</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMarks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No marks match your filters
                    </td>
                  </tr>
                ) : (
                  filteredMarks.map((mark) => (
                    <tr key={mark._id} className="hover:bg-indigo-50/30 transition">
                      <td className="px-6 py-4 font-medium text-indigo-700">{mark.subject}</td>
                      <td className="px-6 py-4 text-gray-700">{mark.term}</td>
                      <td className="px-6 py-4 text-center">{mark.marks.firstTest}</td>
                      <td className="px-6 py-4 text-center">{mark.marks.secondTest}</td>
                      <td className="px-6 py-4 text-center">{mark.marks.thirdTest}</td>
                      <td className="px-6 py-4 text-center">{mark.marks.midTerm}</td>
                      <td className="px-6 py-4 text-center">{mark.marks.examination}</td>
                      <td className="px-6 py-4 text-center font-bold text-green-700">{mark.marks.total}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Star size={14} />
                          {mark.marks.position || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}