// src/pages/teacher/CreateGroup.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Loader2, X, Users, BookOpen, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [classNames, setClassNames] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [classSearch, setClassSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [classesRes, studentsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/students1`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      setClasses(classesRes.data.classes || []);
      setAllStudents(studentsRes.data.students || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load classes or students');
    } finally {
      setFetching(false);
    }
  };

  const toggleClass = (className) => {
    setClassNames((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  const toggleStudent = (studentId) => {
    setStudents((prev) =>
      prev.includes(studentId) ? prev.filter((s) => s !== studentId) : [...prev, studentId]
    );
  };

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(classSearch.toLowerCase())
  );

  const filteredStudents = allStudents.filter((student) =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.class?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (classNames.length === 0 && students.length === 0) {
      toast.error('Add at least one class or student');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/groups`,
        {
          name: name.trim(),
          description: description.trim(),
          classNames,
          students,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      toast.success('Group created successfully!');
      // Reset form
      setName('');
      setDescription('');
      setClassNames([]);
      setStudents([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            Create Class Group
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Build a group chat for your students — add by class or individually
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/80 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
            {/* Group Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SSS 1 Mathematics Group"
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg shadow-sm"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purpose of this group..."
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg shadow-sm min-h-[100px]"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Participants Section */}
            <div className="space-y-8">
              {/* Add by Class */}
              <div className="bg-indigo-50/40 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
                    <BookOpen size={22} />
                    Add Entire Class
                  </h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={classSearch}
                      onChange={(e) => setClassSearch(e.target.value)}
                      placeholder="Search classes..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pr-2">
                  {filteredClasses.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4">No classes found</p>
                  ) : (
                    filteredClasses.map((cls) => (
                      <label
                        key={cls.name}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          classNames.includes(cls.name)
                            ? 'bg-indigo-100 border-2 border-indigo-500'
                            : 'bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={classNames.includes(cls.name)}
                          onChange={() => toggleClass(cls.name)}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          disabled={loading}
                        />
                        <span className="font-medium text-gray-800">{cls.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Add Individual Students */}
              <div className="bg-blue-50/40 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                    <Users size={22} />
                    Add Specific Students
                  </h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pr-2">
                  {filteredStudents.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4">No students found</p>
                  ) : (
                    filteredStudents.map((student) => (
                      <label
                        key={student._id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          students.includes(student._id)
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={students.includes(student._id)}
                          onChange={() => toggleStudent(student._id)}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={loading}
                        />
                        <div>
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.class || 'No class'}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Selected Summary */}
            {(classNames.length > 0 || students.length > 0) && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Selected Participants ({classNames.length + students.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {classNames.map((cls) => (
                    <div
                      key={cls}
                      className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {cls}
                      <button
                        type="button"
                        onClick={() => toggleClass(cls)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {students.map((id) => {
                    const student = allStudents.find((s) => s._id === id);
                    return (
                      student && (
                        <div
                          key={id}
                          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {student.name} ({student.class})
                          <button
                            type="button"
                            onClick={() => toggleStudent(id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 px-8 rounded-2xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Creating Group...
                </>
              ) : (
                'Create Group Chat'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}