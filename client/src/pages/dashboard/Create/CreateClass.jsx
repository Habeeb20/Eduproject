// src/pages/dashboard/CreateClass.jsx
import { useState } from 'react';
import axios from 'axios';
import { PlusCircle, AlertCircle, CheckCircle, Loader2, School } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
export default function CreateClass() {
  const [className, setClassName] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
const [classes, setClasses] = useState([])

useEffect(() => {
fetchClasses()
}, [])

 const fetchClasses = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setClasses(res.data.classes || []);
  } catch {}
};

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!className.trim()) {
      setError('Class name is required');
      toast.error('Class name is required');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/classes`,
        {
          name: className.trim(),
          level: level || undefined,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setSuccess(`Class "${res.data.class.name}" created successfully!`);
      toast.success('Class created successfully');
      setClassName('');
      setLevel('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create class';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <School className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Create New Class
          </h1>
          <p className="text-gray-600 mt-3 max-w-md mx-auto">
            Add a new class to your school (e.g., SSS 2A, JSS 1B). You can assign students and subjects later.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-10">
            {/* Error / Success */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl mb-8 flex items-center gap-3">
                <AlertCircle size={24} />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl mb-8 flex items-center gap-3">
                <CheckCircle size={24} />
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Class Name */}
              <div>
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="className"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., SSS 2A, JSS 1B, Primary 4"
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                  required
                  disabled={loading}
                />
              </div>

              {/* Level (optional) */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Level / Grade (optional)
                </label>
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-lg"
                  disabled={loading}
                >
                  <option value="">-- Select Level --</option>
                  <option value="Nursery">Nursery</option>
                  <option value="Primary">Primary</option>
                  <option value="JSS 1">JSS 1</option>
                  <option value="JSS 2">JSS 2</option>
                  <option value="JSS 3">JSS 3</option>
                  <option value="SSS 1">SSS 1</option>
                  <option value="SSS 2">SSS 2</option>
                  <option value="SSS 3">SSS 3</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-medium text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    Creating Class...
                  </>
                ) : (
                  <>
                    <PlusCircle size={22} />
                    Create Class
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-600">
            <p>Class names should be unique within your school.</p>
            <p className="mt-1">You can add students and subjects after creation.</p>
          </div>
        </div>
        {classes.length > 0 && (
  <div className="mt-10">
    <h3 className="text-xl font-semibold mb-4">Your Classes</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {classes.map(cls => (
        <div key={cls._id} className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="font-medium">{cls.name}</p>
          {cls.level && <p className="text-sm text-gray-600">{cls.level}</p>}
        </div>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
}