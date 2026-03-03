// src/components/library/LibraryUploadModal.jsx
import { useState } from 'react';
import axios from 'axios';
import { Loader2, Upload, X, FileText, Video } from 'lucide-react';
import { toast } from 'sonner';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;

export default function LibraryUploadModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(''); // 'pdf' or 'video'
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
const [loading, setLoading] = useState(false)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type === 'application/pdf') {
      setFileType('pdf');
    } else if (selectedFile.type.startsWith('video/')) {
      setFileType('video');
    } else {
      toast.error('Only PDF or Video files are allowed');
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('video/')) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const uploadToCloudinary = async () => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      setUploading(true);
      const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
      setUploading(false);
      return res.data.secure_url; // or res.data.url
    } catch (err) {
      setUploading(false);
      toast.error('Upload failed');
      console.error(err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true)

    if (!title || !subject || !classLevel || !file) {
      toast.error('Please fill all required fields and select a file');
      return;
    }

    const cloudinaryUrl = await uploadToCloudinary();
    if (!cloudinaryUrl) {
      setUploading(false);
      return;
    }
    try {
      const payload = {
        title,
        author: author || undefined,
        subject,
        classLevel,
        fileType,
        fileUrl: cloudinaryUrl,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/library/resources`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success('Resource uploaded successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to save resource');
    } finally {
        setUploading(false)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 flex justify-between items-center rounded-t-3xl z-10">
          <h2 className="text-2xl md:text-3xl font-bold">Upload New Library Resource</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="e.g. Mathematics for SS1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author (optional)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Prof. Adebayo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="e.g. Mathematics, Physics, Literature"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Level *
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Class</option>
                <option value="JSS 1">JSS 1</option>
                <option value="JSS 2">JSS 2</option>
                <option value="JSS 3">JSS 3</option>
                <option value="SSS 1">SSS 1</option>
                <option value="SSS 2">SSS 2</option>
                <option value="SSS 3">SSS 3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (PDF or Video) *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition">
              <div className="space-y-1 text-center">
                {file ? (
                  <div className="flex flex-col items-center">
                    {fileType === 'pdf' ? (
                      <FileText className="h-12 w-12 text-indigo-600" />
                    ) : (
                      <Video className="h-12 w-12 text-purple-600" />
                    )}
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="application/pdf,video/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF or Video up to 100MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {previewUrl && fileType === 'video' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Preview
              </label>
              <video
                src={previewUrl}
                controls
                className="w-full rounded-xl shadow-md max-h-80"
              />
            </div>
          )}

         <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
            <button
              type="submit"
              disabled={uploading || !file || !title || !subject || !classLevel}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                uploading || !file || !title || !subject || !classLevel
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={22} />
                  Upload Resource
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition"
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

































