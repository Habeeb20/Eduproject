// src/pages/dashboard/AnnouncementsManagement.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Bell, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import CreateAnnouncement from './CreateAnnoucement';
import { User, Calendar } from 'lucide-react';

const AnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/announcements/my`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      console.log(res.data)
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      toast.error('Failed to load your announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/announcements/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Announcement deleted');
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  const handleEdit = (ann) => {
    setEditingAnnouncement(ann);
  };

  const handleSuccess = (updatedAnn) => {
    if (editingAnnouncement) {
      // Update existing
      setAnnouncements(prev =>
        prev.map(a => (a._id === updatedAnn._id ? updatedAnn : a))
      );
    } else {
      // Add new
      setAnnouncements(prev => [updatedAnn, ...prev]);
    }
    setEditingAnnouncement(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="h-10 w-10 text-indigo-600" />
              Announcements
            </h1>
            <p className="text-gray-600 mt-2">
              Create, edit, and manage school-wide announcements
            </p>
          </div>
          {!editingAnnouncement && (
            <button
              onClick={() => setEditingAnnouncement({})}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition"
            >
              <Plus size={20} />
              New Announcement
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {(editingAnnouncement || announcements.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <CreateAnnouncement
              onSuccess={handleSuccess}
              initialData={editingAnnouncement}
            />
          </motion.div>
        )}

        {/* List of Posted Announcements */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                No Announcements Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Post your first announcement to keep everyone informed
              </p>
              <button
                onClick={() => setEditingAnnouncement({})}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
              >
                Create First Announcement
              </button>
            </div>
          ) : (
            announcements.map((ann) => (
              <motion.div
                key={ann._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                        {ann.title}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-line mb-6 leading-relaxed">
                        {ann.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>Posted by {ann.postedBy?.name || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{new Date(ann.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}</span>
                        </div>
                        {ann.expiresAt && (
                          <div className="flex items-center gap-2 text-amber-700">
                            <Calendar size={16} />
                            <span>Expires {new Date(ann.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            ann.targetAudience === 'all' ? 'bg-indigo-100 text-indigo-800' :
                            ann.targetAudience === 'students' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {ann.targetAudience === 'all' ? 'Everyone' :
                             ann.targetAudience === 'students' ? 'Students Only' :
                             'Teachers & Staff'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleEdit(ann)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(ann._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsManagement;