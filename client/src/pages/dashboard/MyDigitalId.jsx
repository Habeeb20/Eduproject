// src/pages/dashboard/MyDigitalId.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import DigitalIdCard from './DigitalCard';
import { Loader2, AlertCircle } from 'lucide-react';

export default function MyDigitalId() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(res.data.user);
      } catch (err) {
        setError('Failed to load your digital ID');
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !user?.digitalId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-amber-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Digital ID Found</h2>
          <p className="text-gray-600">
            {error || 'Your digital ID card will appear here once generated.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          My Digital ID Card
        </h1>

        <DigitalIdCard user={user} isAdminView={false} />
      </div>
    </div>
  );
}