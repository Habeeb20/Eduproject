// src/pages/teacher/RequestsDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Send, Edit2, Eye, X, AlertTriangle, FileText,
  CheckCircle, XCircle, Clock, PieChart, List,
} from 'lucide-react';
import { toast } from 'sonner';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TABS = [
  { id: 'new', label: 'New Request' },
  { id: 'my-requests', label: 'My Requests' },
];

export default function RequestsDashboard() {
  const [activeTab, setActiveTab] = useState('new');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    startDate: '',
    endDate: '',
    lastWorkingDay: '',
    isAnonymous: false,
  });
  const [myRequests, setMyRequests] = useState([]);
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
const [detailModal, setDetailModal]= useState(false)
  // Chart data
  const [statusChart, setStatusChart] = useState(null);

  useEffect(() => {
    if (activeTab === 'new') fetchTemplates();
    else fetchMyRequests();
  }, [activeTab]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/request/request-templates?type=leave,resignation,report`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.log(err)
      toast.error('Failed to load request templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/request/requests/my`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const requests = res.data.requests || [];
      setMyRequests(requests);
      updateStatusChart(requests);
    } catch (err) {
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatusChart = (requests) => {
    if (!requests.length) return;

    const statusCounts = requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    setStatusChart({
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#f59e0b', // pending - yellow
          '#10b981', // approved - green
          '#ef4444', // declined - red
          '#3b82f6', // acknowledged/reviewed - blue
        ],
        borderWidth: 1,
      }],
    });
  };

  const filteredRequests = myRequests.filter(r => {
    if (requestStatusFilter === 'all') return true;
    return r.status === requestStatusFilter;
  });

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      subject: template.title || 'Untitled Request',
      body: template.content || '',
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return toast.error('Please select a template');
    if (!formData.subject.trim() || !formData.body.trim()) return toast.error('Subject and body are required');

    if (activeTab === 'leave' && (!formData.startDate || !formData.endDate)) {
      return toast.error('Start and end dates are required');
    }

    if (activeTab === 'resignation' && !formData.lastWorkingDay) {
      return toast.error('Last working day is required');
    }

    setSubmitting(true);
    try {
      const payload = {
        templateId: selectedTemplate._id,
        type: activeTab,
        subject: formData.subject.trim(),
        body: formData.body.trim(),
      };

      if (activeTab === 'leave') {
        payload.startDate = formData.startDate;
        payload.endDate = formData.endDate;
      } else if (activeTab === 'resignation') {
        payload.lastWorkingDay = formData.lastWorkingDay;
      } else if (activeTab === 'report') {
        payload.isAnonymous = formData.isAnonymous;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/request/requests/submit`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success('Request submitted successfully');
      setSelectedTemplate(null);
      setFormData({
        subject: '',
        body: '',
        startDate: '',
        endDate: '',
        lastWorkingDay: '',
        isAnonymous: false,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter subject line"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Message / Letter Body</label>
        <textarea
          name="body"
          value={formData.body}
          onChange={handleInputChange}
          rows={12}
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-y font-mono whitespace-pre-wrap"
          placeholder="Edit the template content here..."
          required
        />
      </div>

      {activeTab === 'leave' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
      )}

      {activeTab === 'resignation' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Proposed Last Working Day</label>
          <input
            type="date"
            name="lastWorkingDay"
            value={formData.lastWorkingDay}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      )}

      {activeTab === 'report' && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="anonymous"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleInputChange}
            className="h-5 w-5 text-indigo-600 rounded border-gray-300"
          />
          <label htmlFor="anonymous" className="text-gray-700 cursor-pointer">
            Submit anonymously
          </label>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-4 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 text-center"
        >
          Requests & Letters
        </motion.h1>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-medium text-base transition-all shadow-sm ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'new' ? (
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-indigo-600 h-12 w-12" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16">
                <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  No Templates Available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your school administrator has not created any request templates yet.
                </p>
              </div>
            ) : (
              <>
                {/* Template Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {templates.map(template => (
                    <motion.div
                      key={template._id}
                      whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                        selectedTemplate?._id === template._id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-lg'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{template.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-4 mb-4">
                        {template.content.substring(0, 180)}...
                      </p>
                      {template.category && (
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {template.category}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Form */}
                <AnimatePresence>
                  {selectedTemplate && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-gradient-to-br from-gray-50 to-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-inner space-y-8"
                    >
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                          {selectedTemplate.title}
                        </h2>
                        <button
                          onClick={() => setSelectedTemplate(null)}
                          className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      {renderFormFields()}

                      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className={`flex-1 py-4 px-6 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-3 shadow-md ${
                            submitting
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
                          }`}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="animate-spin" size={20} />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send size={20} />
                              Submit Request
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setPreviewOpen(true)}
                          className="px-8 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition flex items-center justify-center gap-2 font-medium"
                        >
                          <Eye size={20} />
                          Preview
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        ) : (
          // My Requests Tab
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText size={28} className="text-indigo-600" />
                My Requests
              </h2>

              <select
                value={requestStatusFilter}
                onChange={e => setRequestStatusFilter(e.target.value)}
                className="w-full md:w-48 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>

            {/* Status Chart */}
            {statusChart && (
              <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart size={20} className="text-purple-600" />
                  Request Status Overview
                </h3>
                <div className="h-72 md:h-80">
                  <Pie data={statusChart} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            )}

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  No Requests Found
                </h3>
                <p>
                  {requestStatusFilter === 'all'
                    ? 'You haven’t submitted any requests yet.'
                    : `No ${requestStatusFilter} requests found.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map(req => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {req.subject}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          req.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : req.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {req.body.substring(0, 150)}...
                    </p>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Type: <span className="capitalize font-medium">{req.type}</span></p>
                      <p>Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                      {req.startDate && (
                        <p>Period: {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                      )}
                      {req.lastWorkingDay && (
                        <p>Last Day: {new Date(req.lastWorkingDay).toLocaleDateString()}</p>
                      )}
                      {req.isAnonymous && (
                        <p className="text-red-600 font-medium">Anonymous Submission</p>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setDetailModal({ request: req, open: true })}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview Modal (for new request) */}
        <AnimatePresence>
          {previewOpen && selectedTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setPreviewOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="absolute top-6 right-6 p-3 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  <X size={28} />
                </button>

                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center border-b pb-6">
                  {formData.subject || 'Untitled Request'}
                </h2>

                <div className="prose prose-lg max-w-none text-gray-800">
                  <div dangerouslySetInnerHTML={{ __html: formData.body.replace(/\n/g, '<br/>') }} />
                </div>

                <div className="mt-12 pt-8 border-t text-sm text-gray-600 space-y-2">
                  {activeTab === 'leave' && (
                    <p><strong>Period:</strong> {formData.startDate} to {formData.endDate}</p>
                  )}
                  {activeTab === 'resignation' && (
                    <p><strong>Last Working Day:</strong> {formData.lastWorkingDay}</p>
                  )}
                  {activeTab === 'report' && formData.isAnonymous && (
                    <p className="text-red-600 font-medium">This will be submitted anonymously.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Request Detail Modal */}
        <AnimatePresence>
          {detailModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setDetailModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setDetailModal(null)}
                  className="absolute top-6 right-6 p-3 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  <X size={28} />
                </button>

                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center border-b pb-6">
                  {detailModal.request.subject}
                </h2>

                <div className="space-y-6 text-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium capitalize">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            detailModal.request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : detailModal.request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : detailModal.request.status === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {detailModal.request.status}
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="font-medium">
                        {new Date(detailModal.request.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {detailModal.request.type === 'leave' && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="font-medium">
                            {new Date(detailModal.request.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="font-medium">
                            {new Date(detailModal.request.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    )}

                    {detailModal.request.type === 'resignation' && (
                      <div>
                        <p className="text-sm text-gray-600">Last Working Day</p>
                        <p className="font-medium">
                          {new Date(detailModal.request.lastWorkingDay).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {detailModal.request.isAnonymous && (
                      <div>
                        <p className="text-sm text-gray-600">Submission Type</p>
                        <p className="font-medium text-red-600">Anonymous</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Full Message</p>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 whitespace-pre-wrap text-sm">
                      {detailModal.request.body}
                    </div>
                  </div>

                  {detailModal.request.reviewComment && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Admin Comment</p>
                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-sm">
                        {detailModal.request.reviewComment}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}