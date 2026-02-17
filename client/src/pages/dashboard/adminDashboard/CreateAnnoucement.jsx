// src/components/admin/CreateAnnouncement.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Send, X, Loader2, Calendar, Edit } from 'lucide-react';
import axios from 'axios';

const CreateAnnouncement = ({ onSuccess, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience || 'all');
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setTargetAudience(initialData.targetAudience || 'all');
      setExpiresAt(
        initialData.expiresAt
          ? new Date(initialData.expiresAt).toISOString().split('T')[0]
          : ''
      );
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        targetAudience,
      };
      if (expiresAt) payload.expiresAt = expiresAt;

      let res;
      if (initialData) {
        // Edit mode
        res = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/announcements/${initialData._id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Announcement updated successfully');
      } else {
        // Create mode
        res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/announcements`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Announcement posted successfully');
      }

      if (res.data.success) {
        onSuccess?.(res.data.announcement);
        // Reset form only on create
        if (!initialData) {
          setTitle('');
          setContent('');
          setTargetAudience('all');
          setExpiresAt('');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          {initialData ? <Edit className="text-indigo-600" /> : <Send className="text-indigo-600" />}
          {initialData ? 'Edit Announcement' : 'Post New Announcement'}
        </h2>
        {initialData && (
          <button
            onClick={() => onSuccess?.()} // close edit mode
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            placeholder="e.g. Mid-term Break Notice"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none transition"
            placeholder="Write your announcement here..."
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who should see this?
          </label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-white"
            disabled={loading}
          >
            <option value="all">Everyone (Teachers, Students, Staff)</option>
            <option value="teachers_staff">Only Teachers & Staff</option>
            <option value="students">Only Students</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={18} />
            Expires on (optional)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {initialData ? 'Updating...' : 'Posting...'}
            </>
          ) : (
            <>
              <Send size={20} />
              {initialData ? 'Update Announcement' : 'Post Announcement'}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateAnnouncement;