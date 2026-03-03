// src/pages/library/LibraryDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Upload, BookOpen, Video, FileText, Users, Layers } from 'lucide-react';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import LibraryUploadModal from './UploadLibrary';
import LibraryView from '../ViewLibrary';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function LibraryDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Stats data
  const [byClassData, setByClassData] = useState(null);
  const [byUserData, setByUserData] = useState(null);
  const [byTypeData, setByTypeData] = useState(null);
  const [sizeData, setSizeData] = useState(null);

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
      updateCharts(data);
    } catch (err) {
      toast.error('Failed to load library resources');
    } finally {
      setLoading(false);
    }
  };

  const updateCharts = (data) => {
    // By Class (Pie)
    const classCounts = data.reduce((acc, r) => {
      acc[r.classLevel] = (acc[r.classLevel] || 0) + 1;
      return acc;
    }, {});
    setByClassData({
      labels: Object.keys(classCounts),
      datasets: [{
        data: Object.values(classCounts),
        backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'],
      }],
    });

    // By Uploaded By (Bar)
    const userCounts = data.reduce((acc, r) => {
      const name = r.uploadedBy?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    setByUserData({
      labels: Object.keys(userCounts),
      datasets: [{
        label: 'Uploaded Resources',
        data: Object.values(userCounts),
        backgroundColor: '#6366f1',
      }],
    });

    // By Type (Pie)
    const typeCounts = data.reduce((acc, r) => {
      acc[r.fileType] = (acc[r.fileType] || 0) + 1;
      return acc;
    }, {});
    setByTypeData({
      labels: Object.keys(typeCounts),
      datasets: [{
        data: Object.values(typeCounts),
        backgroundColor: ['#8b5cf6', '#ec4899'],
      }],
    });

    // Total Size (Bar - approximate size in MB)
    const sizeByClass = data.reduce((acc, r) => {
      // Assume backend returns fileSizeMB or calculate if you store it
      const sizeMB = r.fileSizeMB || 5; // placeholder - add real size in backend
      acc[r.classLevel] = (acc[r.classLevel] || 0) + sizeMB;
      return acc;
    }, {});
    setSizeData({
      labels: Object.keys(sizeByClass),
      datasets: [{
        label: 'Total Size (MB)',
        data: Object.values(sizeByClass),
        backgroundColor: '#10b981',
      }],
    });
  };

  const handleUploadSuccess = () => {
    fetchResources();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-black ">
            School Library Dashboard
          </h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
          >
            <Upload size={20} />
            Upload New Resource
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Resources</p>
                <p className="text-4xl font-bold mt-2">{resources.length}</p>
              </div>
              <BookOpen className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">PDFs</p>
                <p className="text-4xl font-bold mt-2">
                  {resources.filter(r => r.fileType === 'pdf').length}
                </p>
              </div>
              <FileText className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Videos</p>
                <p className="text-4xl font-bold mt-2">
                  {resources.filter(r => r.fileType === 'video').length}
                </p>
              </div>
              <Video className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Uploaded By</p>
                <p className="text-4xl font-bold mt-2">
                  {new Set(resources.map(r => r.uploadedBy?._id)).size}
                </p>
              </div>
              <Users className="h-12 w-12 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {byClassData && (
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
                <Layers size={24} />
                Resources by Class
              </h3>
              <div className="h-80">
                <Pie data={byClassData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          )}

          {byUserData && (
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-3">
                <Users size={24} />
                Resources by Uploaded User
              </h3>
              <div className="h-80">
                <Bar data={byUserData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          )}
        </div>

        {/* Library Resources List */}
        <LibraryView resources={resources} />
      </div>

      {/* Upload Modal */}
      <LibraryUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}