// src/pages/teacher/TeacherAnalytics.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Loader2, AlertTriangle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function TeacherAnalytics() {
  const [tests, setTests] = useState([]);              // All tests created by this teacher
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Step 1: Fetch all tests created by this teacher
  useEffect(() => {
    fetchMyTests();
  }, []);

  const fetchMyTests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/tests/my`,  // ← New endpoint: teacher's own tests
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      const teacherTests = res.data.tests || [];
      setTests(teacherTests);

      if (teacherTests.length === 0) {
        setError('You have not created any tests yet.');
        toast.info('No tests found. Create one first.');
      } else {
        // Auto-select the most recent test (or first one)
        const latestTest = teacherTests[0]; // or sort by createdAt
        setSelectedTestId(latestTest._id);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load your tests';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: When selectedTestId changes → fetch results for that test
  useEffect(() => {
    if (!selectedTestId) return;

    fetchResults(selectedTestId);
  }, [selectedTestId]);

  const fetchResults = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/tests/${id}/results`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setResults(res.data.attempts || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load analytics for this test';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Calculations ───
  const averageScore =
    results.length > 0
      ? results.reduce((sum, a) => sum + (a.percentage || 0), 0) / results.length
      : 0;

  const scoreData = {
    labels: results.map((a) => a.student?.name || 'Unknown'),
    datasets: [
      {
        label: 'Score %',
        data: results.map((a) => a.percentage || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const distributionData = {
    labels: ['0-40%', '41-60%', '61-80%', '81-100%'],
    datasets: [
      {
        data: [
          results.filter((a) => (a.percentage || 0) <= 40).length,
          results.filter((a) => (a.percentage || 0) > 40 && (a.percentage || 0) <= 60).length,
          results.filter((a) => (a.percentage || 0) > 60 && (a.percentage || 0) <= 80).length,
          results.filter((a) => (a.percentage || 0) > 80).length,
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)' },
    },
  };

  // ─── Render ───
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-indigo-600" />
          My Test Analytics
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-2xl text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Tests Created Yet
            </h2>
            <p className="text-gray-600">
              Create your first test to see analytics here.
            </p>
          </div>
        ) : (
          <>
            {/* Test Selector */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Test to View Analytics
              </label>
              <select
                value={selectedTestId || ''}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-lg"
              >
                <option value="">-- Choose a Test --</option>
                {tests.map((test) => (
                  <option key={test._id} value={test._id}>
                    {test.title} ({test.subject} • {test.term})
                  </option>
                ))}
              </select>
            </div>

            {selectedTestId ? (
              loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white rounded-2xl shadow p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Average Score</p>
                      <p className="text-5xl font-bold text-indigo-700">
                        {averageScore.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Attempts</p>
                      <p className="text-5xl font-bold text-green-700">
                        {results.length}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Highest Score</p>
                      <p className="text-5xl font-bold text-purple-700">
                        {Math.max(...results.map(a => a.percentage || 0))}%
                      </p>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white rounded-2xl shadow p-6 h-96">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Student Scores
                      </h2>
                      <Bar data={scoreData} options={chartOptions} />
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6 h-96">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Score Distribution
                      </h2>
                      <Pie data={distributionData} options={chartOptions} />
                    </div>
                  </div>

                  {/* Top Performers Table */}
                  <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Top Performers
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                              Student
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                              Score %
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                              Time Taken
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {results
                            .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
                            .slice(0, 10)
                            .map((result) => (
                              <tr key={result._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                  {result.student?.name || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-green-700">
                                  {result.percentage || 0}%
                                </td>
                                <td className="px-6 py-4 text-center text-gray-600">
                                  {result.timeTakenSeconds
                                    ? Math.floor(result.timeTakenSeconds / 60) + ' min'
                                    : 'N/A'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <p className="text-xl text-gray-600">
                  Select a test above to view its analytics
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}