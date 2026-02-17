// src/pages/dashboard/AdminStudentScores.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Filter, Search, ArrowDown, ArrowUp, Star, Users, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart2, PieChart, TrendingUp, BookOpen } from 'lucide-react';
// Register Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#f59e0b', '#ef4444'];

export default function AdminStudentScores() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [marks, setMarks] = useState([]);
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState({ students: true, marks: false });
  const [error, setError] = useState('');

  // Fetch all students in the school
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(prev => ({ ...prev, students: true }));
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Students fetched:', res.data.students);
      setStudents(res.data.students || []);
      setFilteredStudents(res.data.students || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load students';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  // Filter students by search
  useEffect(() => {
    if (!studentSearch.trim()) {
      setFilteredStudents(students);
      return;
    }
    const term = studentSearch.toLowerCase();
    const filtered = students.filter(s => s.name?.toLowerCase().includes(term));
    setFilteredStudents(filtered);
  }, [studentSearch, students]);

  // Fetch marks when a student is selected
  useEffect(() => {
    if (!selectedStudent) {
      setMarks([]);
      setFilteredMarks([]);
      setSubjects([]);
      setTerms([]);
      return;
    }

    const fetchMarks = async () => {
      setLoading(prev => ({ ...prev, marks: true }));
      setError('');
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/marks/student/${selectedStudent}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        const data = res.data.marks || [];
        console.log('Marks for student:', data);

        setMarks(data);
        setFilteredMarks(data);

        const uniqueSubjects = [...new Set(data.map(m => m.subject))].sort();
        const uniqueTerms = [...new Set(data.map(m => m.term))].sort((a, b) => new Date(b) - new Date(a));
        setSubjects(uniqueSubjects);
        setTerms(uniqueTerms);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load marks for this student';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(prev => ({ ...prev, marks: false }));
      }
    };

    fetchMarks();
  }, [selectedStudent]);

  // Apply filters to marks
  useEffect(() => {
    let result = marks;

    if (selectedSubject !== 'all') {
      result = result.filter(m => m.subject === selectedSubject);
    }

    if (selectedTerm !== 'all') {
      result = result.filter(m => m.term === selectedTerm);
    }

    result = result.filter(m => m.marks.total >= scoreRange[0] && m.marks.total <= scoreRange[1]);

    result.sort((a, b) => 
      sortOrder === 'desc' ? b.marks.total - a.marks.total : a.marks.total - b.marks.total
    );

    setFilteredMarks(result);
  }, [selectedSubject, selectedTerm, scoreRange, sortOrder, marks]);

  // Chart Data
  const scoresBySubjectData = {
    labels: subjects,
    datasets: [{
      label: 'Average Score',
      data: subjects.map(sub => {
        const subMarks = marks.filter(m => m.subject === sub);
        return subMarks.length > 0 ? subMarks.reduce((acc, m) => acc + m.marks.total, 0) / subMarks.length : 0;
      }),
      backgroundColor: COLORS,
      borderRadius: 8,
    }],
  };

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

  const progressOverTermsData = {
    labels: terms,
    datasets: [{
      label: 'Average Score',
      data: terms.map(t => {
        const termMarks = marks.filter(m => m.term === t);
        return termMarks.length > 0 ? termMarks.reduce((acc, m) => acc + m.marks.total, 0) / termMarks.length : 0;
      }),
      backgroundColor: COLORS.slice(0, terms.length),
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 13 } } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.85)', titleColor: 'white', bodyColor: 'white' },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Score (%)' } },
      x: { title: { display: true, text: 'Subjects' } },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-10 w-10 text-indigo-600" />
              Student Performance Overview
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              View and analyze individual student scores across subjects and terms
            </p>
          </div>
          <button
            onClick={fetchStudents}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition shadow-sm"
          >
            <Loader2 className="h-5 w-5" />
            Refresh Students
          </button>
        </div>

        {/* Student Search & Selection */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Search className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Search & Select Student</h2>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search student by name..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg shadow-sm"
            />

            {studentSearch && filteredStudents.length > 0 && (
              <div className="mt-2 max-h-80 overflow-y-auto border border-gray-200 rounded-2xl bg-white shadow-2xl absolute w-full z-20">
                {filteredStudents.map(student => (
                  <div
                    key={student._id}
                    onClick={() => {
                      setSelectedStudent(student._id);
                      setStudentSearch(student.name);
                    }}
                    className="p-4 hover:bg-indigo-50 cursor-pointer transition border-b last:border-b-0 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                      {student.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {student.class || 'No class'} • {student.studentId || 'No ID'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {loading.students && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
          )}

          {selectedStudent && students.find(s => s._id === selectedStudent) && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-indigo-800 font-medium">
                Viewing scores for: <span className="font-bold">{students.find(s => s._id === selectedStudent)?.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Charts & Filters (only show when student selected) */}
        {selectedStudent && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Filter & Sort Scores</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-3.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Term / Session</label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="w-full p-3.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                  >
                    <option value="all">All Terms</option>
                    {terms.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score Range ({scoreRange[0]} – {scoreRange[1]})
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={scoreRange[0]}
                      onChange={e => setScoreRange([Number(e.target.value), scoreRange[1]])}
                      className="w-full accent-indigo-600"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={scoreRange[1]}
                      onChange={e => setScoreRange([scoreRange[0], Number(e.target.value)])}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition font-medium text-gray-700"
                >
                  Sort by Total {sortOrder === 'desc' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                </button>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Bar - Scores by Subject */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <BarChart2 className="h-6 w-6 text-indigo-600" />
                  Scores by Subject
                </h3>
                <div className="h-80">
                  <Bar data={scoresBySubjectData} options={barOptions} />
                </div>
              </div>

              {/* Doughnut - Score Distribution */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <PieChart className="h-6 w-6 text-indigo-600" />
                  Score Distribution
                </h3>
                <div className="h-80">
                  <Doughnut data={scoreDistributionData} options={chartOptions} />
                </div>
              </div>

              {/* Pie - Progress Over Terms */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  Progress Over Terms
                </h3>
                <div className="h-80">
                  <Pie data={progressOverTermsData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                  Detailed Marks ({filteredMarks.length} entries)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-max divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Subject</th>
                      <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Term</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">1st Test</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">2nd Test</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">3rd Test</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">Mid Term</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">Exam</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMarks.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-16 text-center text-gray-500">
                          No marks match your current filters for this student
                        </td>
                      </tr>
                    ) : (
                      filteredMarks.map(mark => (
                        <tr key={mark._id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-6 py-5 font-medium text-indigo-700">{mark.subject}</td>
                          <td className="px-6 py-5 text-gray-700">{mark.term}</td>
                          <td className="px-6 py-5 text-center font-medium">{mark.marks.firstTest}</td>
                          <td className="px-6 py-5 text-center font-medium">{mark.marks.secondTest}</td>
                          <td className="px-6 py-5 text-center font-medium">{mark.marks.thirdTest}</td>
                          <td className="px-6 py-5 text-center font-medium">{mark.marks.midTerm}</td>
                          <td className="px-6 py-5 text-center font-medium">{mark.marks.examination}</td>
                          <td className="px-6 py-5 text-center font-bold text-green-700">{mark.marks.total}</td>
                          <td className="px-6 py-5 text-center">
                            <span className="inline-flex px-4 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800 shadow-sm">
                              <Star size={14} className="mr-1" fill="currentColor" />
                              {mark.marks.position || '—'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* No student selected state */}
        {!selectedStudent && !loading.students && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-lg border border-gray-200">
            <Users className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Select a Student to View Scores
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Use the search bar above to find a student, then view their detailed performance, charts, and rankings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}