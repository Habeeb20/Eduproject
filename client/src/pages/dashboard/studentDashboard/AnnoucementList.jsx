// src/components/dashboard/AnnouncementsFeed.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bell, Calendar, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementsFeed() {
  const [announcements, setAnnouncements] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/announcements/my`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (res.data.success) {
        const all = res.data.announcements || [];
        // Separate pinned (you can add isPinned field later or use a simple rule)
        const pinnedOnes = all.filter(a => a.isPinned || new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // example: recent 7 days
        const others = all.filter(a => !pinnedOnes.includes(a));

        setPinned(pinnedOnes);
        setAnnouncements(others);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load announcements';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-800">{error}</p>
        <button
          onClick={fetchAnnouncements}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (announcements.length === 0 && pinned.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
        <Bell className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          No Announcements Yet
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Important updates from the school administration will appear here when posted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pinned Announcements */}
      {pinned.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Star className="h-7 w-7 text-amber-500" fill="currentColor" />
            Important Announcements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinned.map(ann => (
              <motion.div
                key={ann._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-amber-900 mb-3 line-clamp-2">
                      {ann.title}
                    </h3>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Pinned
                    </span>
                  </div>

                  <p className={`text-gray-700 whitespace-pre-line ${expandedId === ann._id ? '' : 'line-clamp-4'}`}>
                    {ann.content}
                  </p>

                  {ann.content.length > 200 && (
                    <button
                      onClick={() => toggleExpand(ann._id)}
                      className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                    >
                      {expandedId === ann._id ? (
                        <>Show less <ChevronUp size={16} /></>
                      ) : (
                        <>Read more <ChevronDown size={16} /></>
                      )}
                    </button>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{new Date(ann.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={14} />
                      <span>By {ann.postedBy?.name || 'Admin'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Bell className="h-7 w-7 text-indigo-600" />
          School Announcements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map(ann => (
            <motion.div
              key={ann._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.random() * 0.2 }}
              className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {ann.title}
                </h3>

                <p className={`text-gray-700 whitespace-pre-line ${expandedId === ann._id ? '' : 'line-clamp-4'}`}>
                  {ann.content}
                </p>

                {ann.content.length > 180 && (
                  <button
                    onClick={() => toggleExpand(ann._id)}
                    className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                  >
                    {expandedId === ann._id ? (
                      <>Show less <ChevronUp size={16} /></>
                    ) : (
                      <>Read more <ChevronDown size={16} /></>
                    )}
                  </button>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{new Date(ann.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    <span>By {ann.postedBy?.name || 'Admin'}</span>
                  </div>
                  {ann.expiresAt && (
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <Calendar size={14} />
                      <span>Expires {new Date(ann.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Audience badge */}
                <div className="mt-4">
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}