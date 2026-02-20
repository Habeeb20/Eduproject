// src/pages/dashboard/UploadLessonNote.jsx
import { useState } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import CloudinaryUpload from '../../../CloudinaryUpload';


export default function UploadLessonNote() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [term, setTerm] = useState('');
  const [week, setWeek] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [filePublicId, setFilePublicId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUploadComplete = (url, publicId) => {
    setFileUrl(url);
    setFilePublicId(publicId);
    toast.success('File uploaded to Cloudinary!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !subject.trim() || !className.trim() || !term || !week || !fileUrl) {
      toast.error('All fields and file are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/lesson-notes`,
        {
          title,
          subject,
          className,
          term,
          week: Number(week),
          fileUrl,
          filePublicId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      toast.success('Lesson note submitted! Awaiting admin approval');
      // Reset form
      setTitle('');
      setSubject('');
      setClassName('');
      setTerm('');
      setWeek('');
      setFileUrl('');
      setFilePublicId('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit lesson note';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">
          Upload Your Lesson Note
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-center gap-3">
                <AlertCircle size={24} />
                <p>{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                placeholder="e.g. Week 5: Quadratic Equations"
                required
                disabled={loading}
              />
            </div>

            {/* Subject & Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                  placeholder="e.g. Mathematics"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                  placeholder="e.g. SS 1A"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Term & Week */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term *
                </label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-lg"
                  required
                  disabled={loading}
                >
                  <option value="">Select Term</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Week *
                </label>
                <input
                  type="number"
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                  placeholder="1 - 40"
                  min="1"
                  max="40"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Cloudinary Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Lesson Note File (PDF, DOCX) *
              </label>
              <CloudinaryUpload
                onUploadComplete={handleUploadComplete}
                preset={import.meta.env.VITE_CLOUDINARY_LESSON_NOTE_PRESET} // Optional: different preset
                folder="schoolhub/lesson-notes"
                accept=".pdf,.doc,.docx"
                maxSizeMB={15}
                label="Drag & drop or click to upload lesson note"
              />
              {fileUrl && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-700 font-medium flex items-center gap-2">
                    <CheckCircle size={18} />
                    File uploaded successfully!
                  </p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm mt-2 block"
                  >
                    View Uploaded File
                  </a>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !fileUrl}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                loading || !fileUrl
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Submitting...
                </>
              ) : (
                <>
                  Submit for Approval
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}