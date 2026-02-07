// src/components/dashboard/CreateTeacherForm.jsx
import { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const PRIMARY_BLUE = '#1890ff';

export default function CreateTeacherForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [subjects, setSubjects] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/create-teacher`,
        { name, email, password, phone, subjects: subjects.split(',').map(s => s.trim()) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess('Teacher created successfully!');
      console.log('Created teacher details:', response.data.teacher);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setSubjects('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Teacher</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional, default: teacher123)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma-separated)</label>
          <input
            type="text"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
            placeholder="Math, Physics"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
          style={{ backgroundColor: PRIMARY_BLUE }}
        >
          {isLoading ? 'Creating...' : (
            <>
              Create Teacher
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}