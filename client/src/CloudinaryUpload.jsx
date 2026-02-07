// src/components/CloudinaryUpload.jsx
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CloudinaryUpload = ({
  onUploadComplete,
  preset = CLOUDINARY_UPLOAD_PRESET, 
  folder = 'tasksphere/verification',
  accept = 'image/*,.pdf',
  maxSizeMB = 10,
  label = 'Upload document or photo',
  currentUrl,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Size validation
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum ${maxSizeMB}MB allowed.`);
      return;
    }

    setFile(selectedFile);

    // Create preview (only for images)
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null); // PDF or other → no preview
    }
  }, [maxSizeMB]);

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    if (folder) formData.append('folder', folder);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            toast.success('Upload successful!');
            onUploadComplete(data.secure_url, data.public_id);
            setPreview(data.secure_url);
          } else {
            throw new Error('No secure_url returned');
          }
        } else {
          throw new Error(`Upload failed: ${xhr.statusText}`);
        }
      };

      xhr.onerror = () => {
        toast.error('Network error during upload');
      };

      xhr.send(formData);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(currentUrl || null);
  };

  return (
    <div className="space-y-4">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {/* Preview area */}
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {file?.type.startsWith('image/') || preview.startsWith('data:image') ? (
            <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Document uploaded (PDF or other format)
            </div>
          )}

          <button
            onClick={clearFile}
            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white shadow-sm"
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-gray-500">
              {accept.includes('pdf') ? 'PNG, JPG, PDF (max 10MB)' : 'PNG, JPG (max 10MB)'}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}

      {/* Progress & Upload button */}
      {file && !preview && (
        <div className="flex items-center gap-4">
          <button
            onClick={uploadFile}
            disabled={uploading}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading... {progress}%
              </div>
            ) : (
              'Upload Now'
            )}
          </button>

          <button
            onClick={clearFile}
            className="p-3 text-gray-500 hover:text-gray-700 rounded-lg"
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;