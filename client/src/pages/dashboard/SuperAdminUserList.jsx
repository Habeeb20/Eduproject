// src/components/dashboard/ChangePasswordForm.jsx
import { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const PRIMARY_BLUE = '#1890ff';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess('Password changed successfully!');
      // Reset fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Change Password</h2>

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

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
          >
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
          style={{ backgroundColor: PRIMARY_BLUE }}
        >
          {isLoading ? 'Updating...' : (
            <>
              Change Password
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}