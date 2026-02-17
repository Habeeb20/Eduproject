// src/pages/dashboard/AddMarks.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { SCHOOL_SUBJECTS } from '../../../subject';

export default function AddMarks() {
  const [classes, setClasses] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState(SCHOOL_SUBJECTS);
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

  // Fetch classes only (no need for subjects from backend yet)
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(prev => ({ ...prev, classes: true }));
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load classes');
      toast.error('Failed to load classes');
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  // Filter subjects as user types (real-time search)
  useEffect(() => {
    if (!subjectSearch.trim()) {
      setFilteredSubjects(SCHOOL_SUBJECTS);
      return;
    }

    const term = subjectSearch.toLowerCase();
    const filtered = SCHOOL_SUBJECTS.filter(s => s.toLowerCase().includes(term));
    setFilteredSubjects(filtered);
  }, [subjectSearch]);

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
        // Use encodeURIComponent to handle spaces in class names
        const encodedClass = encodeURIComponent(selectedClass);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/classes/${encodedClass}/students`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        console.log('Students response:', res.data); // ← Debug here
        setStudents(res.data.students || []);

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
        console.error('Students fetch error:', err);
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
      const studentMarks = { ...prev[studentId] || {} };
      studentMarks[field] = Number(value) || 0;
      studentMarks.total =
        (studentMarks.firstTest || 0) +
        (studentMarks.secondTest || 0) +
        (studentMarks.thirdTest || 0) +
        (studentMarks.midTerm || 0) +
        (studentMarks.examination || 0);

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
      console.log(err)
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
        {/* Header */}
        <div className="text-center md:text-left mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Enter Student Marks
          </h1>
          <p className="text-gray-600 mt-2">
            Add assessment scores for your class and subject
          </p>
        </div>

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
                className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-base"
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
                placeholder="Type to search subject (e.g., Math)"
                value={subjectSearch}
                onChange={(e) => {
                  setSubjectSearch(e.target.value);
                  setSelectedSubject('');
                }}
                className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-base"
                disabled={loading.classes}
              />

              {/* Dropdown suggestions */}
              {subjectSearch && filteredSubjects.length > 0 && (
                <div className="mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded-xl bg-white shadow-lg absolute w-full z-10">
                  {filteredSubjects.map(sub => (
                    <div
                      key={sub}
                      onClick={() => {
                        setSelectedSubject(sub);
                        setSubjectSearch('');
                      }}
                      className="p-3 hover:bg-indigo-50 cursor-pointer transition text-base border-b last:border-b-0"
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              )}

              {/* Selected subject display */}
              {selectedSubject && (
                <p className="mt-2 text-sm text-indigo-700 font-medium">
                  Selected: {selectedSubject}
                </p>
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
                className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-base"
              >
                <option value="">-- Choose Term --</option>
                <option value="First Term 2025">First Term 2025</option>
                <option value="Second Term 2025">Second Term 2025</option>
                <option value="Third Term 2025">Third Term 2025</option>
              </select>
            </div>
          </div>

          {/* Auto Position Toggle */}
          <div className="mt-8 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoPosition"
              checked={autoPosition}
              onChange={(e) => setAutoPosition(e.target.checked)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="autoPosition" className="text-base font-medium text-gray-700 flex items-center gap-2">
              Automatically calculate student positions/ranks
              <span className="text-gray-500 cursor-help" title="Ranks students based on total score (1st, 2nd, 3rd...)">
                <Info size={18} />
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading.submit || !selectedClass || !selectedSubject || !selectedTerm}
            className="mt-10 w-full py-4 px-8 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-medium text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading.submit ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Saving Marks...
              </>
            ) : (
              <>
                <Save size={22} />
                Save All Marks
              </>
            )}
          </button>
        </div>

        {/* Students Marks Table / Cards */}
        {loading.students ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">No Students Found</h3>
            <p className="text-gray-600 mt-3 max-w-md mx-auto">
              Select a class above to load its students and start entering marks.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            {/* Mobile Card View + Desktop Table */}
            <div className="block md:hidden">
              {students.map(student => (
                <div key={student._id} className="p-6 border-b last:border-b-0 hover:bg-indigo-50/30 transition">
                  <h4 className="font-semibold text-lg text-gray-900 mb-4">{student.name}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {['firstTest', 'secondTest', 'thirdTest', 'midTerm', 'examination'].map(field => (
                      <div key={field} className="text-center">
                        <label className="block text-xs text-gray-600 mb-1 capitalize">
                          {field.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={marks[student._id]?.[field] || 0}
                          onChange={(e) => handleMarkChange(student._id, field, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                      </div>
                    ))}
                    <div className="text-center col-span-2 sm:col-span-1">
                      <label className="block text-xs text-gray-600 mb-1">Total</label>
                      <div className="font-bold text-xl text-indigo-700">
                        {marks[student._id]?.total || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">1st Test</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">2nd Test</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">3rd Test</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">Mid Term</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">Exam</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-indigo-50/30 transition">
                      <td className="px-6 py-5 font-medium text-gray-900">{student.name}</td>
                      {['firstTest', 'secondTest', 'thirdTest', 'midTerm', 'examination'].map(field => (
                        <td key={field} className="px-4 py-5 text-center">
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
                      <td className="px-6 py-5 text-center font-bold text-indigo-700 text-lg">
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