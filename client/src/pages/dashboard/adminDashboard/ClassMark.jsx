// src/pages/dashboard/ClassMarks.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, AlertCircle, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ClassMarks() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classSearch, setClassSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [term, setTerm] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setClasses(res.data.classes || []);
    } catch (err) {
      toast.error('Failed to load classes');
    }
  };

  const handleFetchMarks = async () => {
    if (!selectedClass || !term) {
      toast.warning('Please select class and term');
      return;
    }

    setLoading(true);
    setError('');
    setMarks([]);

    try {
      const params = { className: selectedClass, term };
      if (selectedSubject) params.subject = selectedSubject;

      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/marks/class`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setMarks(res.data.marks || []);
    } catch (err) {
      setError('Failed to load class marks');
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(classSearch.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s =>
    s.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center md:text-left">
          Class Marks Overview
        </h1>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Class Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search class..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              {classSearch && (
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg">
                  {filteredClasses.map(cls => (
                    <div
                      key={cls._id}
                      onClick={() => {
                        setSelectedClass(cls.name);
                        setClassSearch('');
                      }}
                      className="p-3 hover:bg-indigo-50 cursor-pointer transition"
                    >
                      {cls.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search subject..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              {subjectSearch && (
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg">
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

            {/* Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="">-- Select Term --</option>
                <option value="First Term 2025">First Term 2025</option>
                <option value="Second Term 2025">Second Term 2025</option>
                <option value="Third Term 2025">Third Term 2025</option>
              </select>
            </div>

            {/* Fetch Button */}
            <div className="flex items-end">
              <button
                onClick={handleFetchMarks}
                disabled={loading || !selectedClass || !term}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Loading...
                  </>
                ) : (
                  'View Marks'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : marks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">No Marks Found</h3>
            <p className="text-gray-600 mt-2">
              Select class, subject (optional), and term then click "View Marks"
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-indigo-800">Student</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-indigo-800">Total Score</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-indigo-800">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {marks.map((m, index) => (
                    <tr
                      key={m._id}
                      className="hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="px-6 py-5 font-medium text-gray-900">
                        {m.student.name}
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-indigo-700">
                        {m.marks.total}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          {m.marks.position || '—'}
                        </span>
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