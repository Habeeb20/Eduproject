import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyId() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    const code = searchParams.get('code');

    if (!id || !code) {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }

    verifyId(id, code);
  }, [searchParams]);

  const verifyId = async (id, code) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/verify`, {
        params: { id, code },
      });
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader2 className="animate-spin h-12 w-12 mx-auto mt-20" />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full border border-gray-100">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Digital ID Verified</h1>
        </div>

        <div className="space-y-6">
          {user.profilePicture && (
            <div className="flex justify-center">
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-md"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-xl font-bold text-gray-900">{user.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg text-gray-700">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-lg font-medium capitalize text-indigo-600">{user.role}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">School</p>
              <p className="text-lg text-gray-800">{user.schoolName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Unique Code</p>
              <p className="text-2xl font-mono font-bold tracking-wider text-gray-900">{user.uniqueCode}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Issued On</p>
              <p className="text-lg text-gray-700">
                {new Date(user.issuedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}