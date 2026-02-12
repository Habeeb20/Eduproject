// src/pages/dashboard/AddMarks.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AddMarks() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [autoPosition, setAutoPosition] = useState(false);
  const [loading, setLoading] = useState({
    classes: false,
    students: false,
    submit: false,
  });
  const [error, setError] = useState('');

  // Fetch classes and teacher's subjects
  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  const fetchClassesAndSubjects = async () => {
    setLoading(prev => ({ ...prev, classes: true }));
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setClasses(res.data.classes || []);

      // Assuming teacher has assigned subjects in their profile
      const teacherRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSubjects(teacherRes.data.user.subjects || []);
      setFilteredSubjects(teacherRes.data.user.subjects || []);
    } catch (err) {
        console.log(err)
      setError('Failed to load classes or subjects');
      toast.error('Failed to load data');
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  // Filter subjects as user types
  useEffect(() => {
    if (!subjectSearch.trim()) {
      setFilteredSubjects(subjects);
      return;
    }

    const term = subjectSearch.toLowerCase();
    const filtered = subjects.filter(s => s.toLowerCase().includes(term));
    setFilteredSubjects(filtered);
  }, [subjectSearch, subjects]);

  // Fetch students when class changes
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setMarks({});
      return;
    }

    const fetchStudents = async () => {
      setLoading(prev => ({ ...prev, students: true }));
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/classes/${selectedClass}/students`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setStudents(res.data.students || []);
console.log(res.data)
        // Initialize marks
        const initialMarks = res.data.students.reduce((acc, student) => {
          acc[student._id] = {
            firstTest: 0,
            secondTest: 0,
            thirdTest: 0,
            midTerm: 0,
            examination: 0,
            total: 0,
          };
          return acc;
        }, {});
        setMarks(initialMarks);
      } catch (err) {
        setError('Failed to load students');
        toast.error('Failed to load students');
      } finally {
        setLoading(prev => ({ ...prev, students: false }));
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const handleMarkChange = (studentId, field, value) => {
    setMarks(prev => {
      const studentMarks = { ...prev[studentId] };
      studentMarks[field] = Number(value) || 0;
      studentMarks.total =
        studentMarks.firstTest +
        studentMarks.secondTest +
        studentMarks.thirdTest +
        studentMarks.midTerm +
        studentMarks.examination;

      return { ...prev, [studentId]: studentMarks };
    });
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      toast.error('Please select class, subject, and term');
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));
    setError('');

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/marks`,
        {
          className: selectedClass,
          subject: selectedSubject,
          term: selectedTerm,
          marks, // { studentId: { firstTest, ..., total } }
          autoPosition,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success('Marks saved successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save marks';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">
          Enter Student Marks
        </h1>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Class Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={loading.classes}
              >
                <option value="">-- Choose Class --</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls.name}>
                    {cls.name} ({cls.students?.length || 0} students)
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Searchable Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject
              </label>
              <input
                type="text"
                placeholder="Type to search subject..."
                value={subjectSearch}
                onChange={(e) => {
                  setSubjectSearch(e.target.value);
                  setSelectedSubject('');
                }}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={!subjects.length || loading.classes}
              />
              {subjectSearch && filteredSubjects.length > 0 && (
                <div className="mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded-xl bg-white shadow-lg z-10">
                  {filteredSubjects.map(sub => (
                    <div
                      key={sub}
                      onClick={() => {
                        setSelectedSubject(sub);
                        setSubjectSearch('');
                      }}
                      className="p-3 hover:bg-indigo-50 cursor-pointer transition"
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Term Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Term
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="">-- Choose Term --</option>
                <option value="First Term 2025">First Term 2025</option>
                <option value="Second Term 2025">Second Term 2025</option>
                <option value="Third Term 2025">Third Term 2025</option>
              </select>
            </div>
          </div>

          {/* Auto Position Toggle */}
          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoPosition"
              checked={autoPosition}
              onChange={(e) => setAutoPosition(e.target.checked)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="autoPosition" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              Automatically calculate positions
              <span className="text-gray-500 cursor-help" title="Ranks students based on total score">
                <Info size={16} />
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading.submit || !selectedClass || !selectedSubject || !selectedTerm}
            className="mt-8 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading.submit ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving Marks...
              </>
            ) : (
              <>
                <Save size={20} />
                Save All Marks
              </>
            )}
          </button>
        </div>

        {/* Students Marks Table */}
        {loading.students ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">No Students Found</h3>
            <p className="text-gray-600 mt-2">
              Select a class to view students
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">1st Test</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">2nd Test</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">3rd Test</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Mid Term</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Exam</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-indigo-50/30 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                      {['firstTest', 'secondTest', 'thirdTest', 'midTerm', 'examination'].map(field => (
                        <td key={field} className="px-4 py-4 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={marks[student._id]?.[field] || 0}
                            onChange={(e) => handleMarkChange(student._id, field, e.target.value)}
                            className="w-20 mx-auto p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          />
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center font-bold text-indigo-700">
                        {marks[student._id]?.total || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}