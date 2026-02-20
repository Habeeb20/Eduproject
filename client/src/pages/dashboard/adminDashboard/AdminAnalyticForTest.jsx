// src/pages/admin/AdminExamAnalytics.jsx
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

export default function AdminExamAnalytics() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/tests`, // or /api/tests/all if you have a special endpoint
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTests(res.data.tests || []);
      console.log(res.data)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load tests';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTest) {
      setResults([]);
      return;
    }
    fetchResults(selectedTest);
  }, [selectedTest]);

  const fetchResults = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/tests/${id}/results`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setResults(res.data.attempts || []);
      console.log('Results loaded:', res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load results';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Safe Calculations ───
  const averageScore =
    results?.length > 0
      ? results.reduce((sum, a) => sum + (Number(a?.percentage) || 0), 0) / results.length
      : 0;

  const scoreData = {
    labels: results?.length > 0 ? results.map(a => a?.student?.name || 'Unknown') : ['No Data'],
    datasets: [
      {
        label: 'Score %',
        data: results?.length > 0 ? results.map(a => Number(a?.percentage) || 0) : [0],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
      },
    ],
  };

  const distributionData = {
    labels: ['0-40%', '41-60%', '61-80%', '81-100%'],
    datasets: [
      {
        data: results?.length > 0
          ? [
              results.filter(a => (Number(a?.percentage) || 0) <= 40).length,
              results.filter(a => (Number(a?.percentage) || 0) > 40 && (Number(a?.percentage) || 0) <= 60).length,
              results.filter(a => (Number(a?.percentage) || 0) > 60 && (Number(a?.percentage) || 0) <= 80).length,
              results.filter(a => (Number(a?.percentage) || 0) > 80).length,
            ]
          : [0, 0, 0, 0],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
          Exam Analytics Dashboard
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
          <div className="bg-white rounded-3xl shadow border border-gray-200 p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Tests Available
            </h2>
            <p className="text-gray-600">
              No exams/tests have been created in your school yet.
            </p>
          </div>
        ) : (
          <>
            {/* Test Selector */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Test to Analyze
              </label>
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-lg"
              >
                <option value="">-- Choose a Test --</option>
                {tests.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({t.subject} • {t.term})
                  </option>
                ))}
              </select>
            </div>

            {selectedTest ? (
              loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                </div>
              ) : results.length === 0 ? (
                <div className="bg-white rounded-2xl shadow p-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    No Attempts Yet
                  </h2>
                  <p className="text-gray-600">
                    Students have not taken this test yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
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

                  {/* Top Performers */}
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
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                              Class
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
                                <td className="px-6 py-4 font-medium text-gray-900">
                                  {result.student?.class || 'Unknown'}
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
                  Select a test from the dropdown above to view its analytics
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}