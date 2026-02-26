


// src/pages/teacher/CreateVirtualClass.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Calendar, Link2, Users, Save } from 'lucide-react';
import { toast } from 'sonner';
import Video from '../../virtual/Video'

export default function CreateVirtualClass() {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [targetType, setTargetType] = useState('classes');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classRes, studentRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/students`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      setClasses(classRes.data.classes || []);
      setStudents(studentRes.data.students || []);
    } catch (err) {
      toast.error('Failed to load classes/students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !link || !dateTime) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/virtual-classes`,
        {
          title,
          link,
          dateTime,
          targetType,
          targetClasses: targetType === 'classes' ? selectedClasses : [],
          targetStudents: targetType === 'students' ? selectedStudents : [],
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Virtual class created!');
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setLink('');
    setDateTime('');
    setTargetType('classes');
    setSelectedClasses([]);
    setSelectedStudents([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">


      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">
          Create Virtual Class
        </h1>
     <Video />
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mathematics Revision - JSS 3"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Virtual Meeting Link *
            </label>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                className="w-full pl-12 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To *
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={targetType === 'classes'}
                  onChange={() => setTargetType('classes')}
                  className="h-5 w-5 text-indigo-600"
                />
                Entire Class(es)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={targetType === 'students'}
                  onChange={() => setTargetType('students')}
                  className="h-5 w-5 text-indigo-600"
                />
                Specific Students
              </label>
            </div>
          </div>

          {/* Class Selection */}
          {targetType === 'classes' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Class(es)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-xl border">
                {classes.map((cls) => (
                  <label
                    key={cls.name}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedClasses.includes(cls.name)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(cls.name)}
                      onChange={() =>
                        setSelectedClasses(prev =>
                          prev.includes(cls.name)
                            ? prev.filter(c => c !== cls.name)
                            : [...prev, cls.name]
                        )
                      }
                      className="h-5 w-5 text-indigo-600 rounded"
                    />
                    <span className="font-medium">{cls.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Student Selection */}
          {targetType === 'students' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Students
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-xl border">
                {students.map((student) => (
                  <label
                    key={student._id}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedStudents.includes(student._id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() =>
                        setSelectedStudents(prev =>
                          prev.includes(student._id)
                            ? prev.filter(id => id !== student._id)
                            : [...prev, student._id]
                        )
                      }
                      className="h-5 w-5 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.class}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Creating...
              </>
            ) : (
              <>
                <Save size={22} />
                Create Virtual Class
              </>
            )}
          </button>
        </form>
        
        
      </div>
    </div>
  );
}