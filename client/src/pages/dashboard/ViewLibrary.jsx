// src/components/library/LibraryView.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  Play,
  FileText,
  Trash2,
  BookOpen,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LibraryView({ currentUserRole }) {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null); // id of resource being deleted

  // Only admins/teachers/librarians can delete
  const canDelete = ['superadmin', 'admin', 'teacher', 'librarian'].includes(currentUserRole);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/library/resources`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = res.data.resources || [];
      setResources(data);
      setFilteredResources(data);
    } catch (err) {
      toast.error('Failed to load library resources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Live search & filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResources(resources);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = resources.filter((r) =>
      [r.title, r.subject, r.classLevel, r.author]
        .some((field) => field?.toLowerCase().includes(term))
    );

    setFilteredResources(filtered);
  }, [searchTerm, resources]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/library/resources/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Resource deleted successfully');
      setResources((prev) => prev.filter((r) => r._id !== id));
      setFilteredResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete resource');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDownload = (url, title, fileType) => {
    const extension = fileType === 'pdf' ? 'pdf' : 'mp4';
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.08,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
    hover: { scale: 1.03, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text ">
            School Library
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search by title, subject, class, author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading / Empty State */}
        <AnimatePresence>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </motion.div>
          ) : filteredResources.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100"
            >
              <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No Resources Found</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your search or check back later.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResources.map((resource, idx) => (
                <motion.div
                  key={resource._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  custom={idx}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 relative"
                >
                  {/* Thumbnail / Preview */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {resource.thumbnailUrl ? (
                      <img
                        src={resource.thumbnailUrl}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : resource.fileType === 'pdf' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                        <FileText className="h-20 w-20 text-indigo-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                        <Play className="h-20 w-20 text-purple-400" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      {resource.fileType === 'video' ? (
                        <Play className="h-10 w-10 text-white drop-shadow-lg" />
                      ) : (
                        <Download className="h-10 w-10 text-white drop-shadow-lg" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                      {resource.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                        {resource.subject}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {resource.classLevel}
                      </span>
                      {resource.author && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {resource.author}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-3 border-t">
                      {resource.fileType === 'pdf' ? (
                        <button
                          onClick={() => handleDownload(resource.fileUrl, resource.title, 'pdf')}
                          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition flex items-center justify-center gap-2 shadow-sm font-medium"
                        >
                          <Download size={18} />
                          Download PDF
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedVideo(resource.fileUrl)}
                          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition flex items-center justify-center gap-2 shadow-sm font-medium"
                        >
                          <Play size={18} />
                          Watch Video
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(resource._id)}
                          disabled={deleteLoading === resource._id}
                          className={`p-3 rounded-xl transition ${
                            deleteLoading === resource._id
                              ? 'bg-gray-200 cursor-not-allowed'
                              : 'bg-red-50 hover:bg-red-100 text-red-700'
                          }`}
                          title="Delete Resource"
                        >
                          {deleteLoading === resource._id ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition z-10"
              >
                <X size={28} />
              </button>

              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full max-h-[85vh] outline-none"
                onError={() => toast.error('Failed to load video')}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}