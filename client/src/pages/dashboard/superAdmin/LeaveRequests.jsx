// // src/pages/admin/AdminRequestTemplates.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Loader2, Plus, Edit2, Trash2, Save, X, CheckCircle, XCircle,
//   FileText, Clock, AlertTriangle, BarChart2, PieChart, Eye,
//   Square, CheckSquare,
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { Pie, Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// const TABS = ['templates', 'requests'];

// export default function AdminRequestTemplates() {
//   const [activeTab, setActiveTab] = useState('templates');
//   const [templates, setTemplates] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedType, setSelectedType] = useState('leave');
//   const [editingTemplate, setEditingTemplate] = useState(null);
//   const [formData, setFormData] = useState({
//     type: 'leave',
//     title: '',
//     category: '',
//     content: '',
//     isActive: true,
//   });

//   // Request management
//   const [selectedRequests, setSelectedRequests] = useState([]);
//   const [detailModal, setDetailModal] = useState(null); // { request, open: boolean }
// const [creatingNew, setCreatingNew] = useState(false);
//   // Chart data
//   const [requestStats, setRequestStats] = useState(null);
//   const [requestTrend, setRequestTrend] = useState(null);

//   useEffect(() => {
//     if (activeTab === 'templates') {
//       fetchTemplates();
//     } else {
//       fetchRequests();
//     }
//   }, [activeTab, selectedType]);

//   const fetchTemplates = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/request/request-templates?type=${selectedType}`,
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       setTemplates(res.data.templates || []);
//       console.log('Templates loaded:', res.data.templates);
//     } catch (err) {
//       console.error('Template fetch error:', err);
//       toast.error('Failed to load templates');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRequests = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/request/requests/pending`,
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       const data = res.data.requests || [];
//       setRequests(data);
//       updateRequestCharts(data);
//     } catch (err) {
//       console.error('Requests fetch error:', err);
//       toast.error('Failed to load requests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateRequestCharts = (data) => {
//     if (!data?.length) return;

//     // Pie: Requests by Type
//     const typeCounts = data.reduce((acc, r) => {
//       acc[r.type] = (acc[r.type] || 0) + 1;
//       return acc;
//     }, {});

//     setRequestStats({
//       labels: Object.keys(typeCounts),
//       datasets: [{
//         data: Object.values(typeCounts),
//         backgroundColor: ['#6366f1', '#ec4899', '#10b981'],
//         borderWidth: 1,
//       }],
//     });

//     // Bar: Requests over time
//     const monthlyCounts = {};
//     data.forEach(r => {
//       const month = new Date(r.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
//       monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
//     });

//     const sortedMonths = Object.keys(monthlyCounts).sort((a, b) => new Date(a) - new Date(b));

//     setRequestTrend({
//       labels: sortedMonths,
//       datasets: [{
//         label: 'Number of Requests',
//         data: sortedMonths.map(m => monthlyCounts[m]),
//         backgroundColor: '#4f46e5',
//         borderRadius: 6,
//       }],
//     });
//   };

//   // Template CRUD handlers
//   const handleCreateOrUpdate = async () => {
//     if (!formData.title.trim() || !formData.content.trim()) {
//       return toast.error('Title and content are required');
//     }

//     setLoading(true);
//     try {
//       const payload = { ...formData };

//       if (editingTemplate) {
//         await axios.put(
//           `${import.meta.env.VITE_BACKEND_URL}/request/request-templates/${editingTemplate._id}`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );
//         toast.success('Template updated');
//       } else {
//         await axios.post(
//           `${import.meta.env.VITE_BACKEND_URL}/request/request-templates`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );
//         toast.success('Template created');
//       }

//       setEditingTemplate(null);
//       setFormData({
//         type: selectedType,
//         title: '',
//         category: '',
//         content: '',
//         isActive: true,
//       });
//       fetchTemplates();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save template');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (template) => {
//     setEditingTemplate(template);
//     setFormData({
//       type: template.type,
//       title: template.title,
//       category: template.category || '',
//       content: template.content,
//       isActive: template.isActive,
//     });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this template permanently?')) return;

//     try {
//       await axios.delete(
//         `${import.meta.env.VITE_BACKEND_URL}/request/request-templates/${id}`,
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       toast.success('Template deleted');
//       fetchTemplates();
//     } catch (err) {
//       toast.error('Failed to delete template');
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingTemplate(null);
//     setFormData({
//       type: selectedType,
//       title: '',
//       category: '',
//       content: '',
//       isActive: true,
//     });
//   };

//   // Request Actions
//   const handleRequestAction = async (requestId, action, comment = '') => {
//     try {
//       await axios.put(
//         `${import.meta.env.VITE_BACKEND_URL}/request/requests/${requestId}/review`,
//         { status: action, reviewComment: comment },
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );

//       toast.success(`Request ${action}`);
//       fetchRequests();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Action failed');
//     }
//   };

//   // Bulk Actions
//   const handleBulkAction = async (action) => {
//     if (selectedRequests.length === 0) {
//       return toast.warning('No requests selected');
//     }

//     if (!window.confirm(`Are you sure you want to ${action} ${selectedRequests.length} request(s)?`)) return;

//     setLoading(true);
//     try {
//       await Promise.all(
//         selectedRequests.map(id =>
//           axios.put(
//             `${import.meta.env.VITE_BACKEND_URL}/request/requests/${id}/review`,
//             { status: action },
//             { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//           )
//         )
//       );

//       toast.success(`Bulk ${action} completed`);
//       setSelectedRequests([]);
//       fetchRequests();
//     } catch (err) {
//       toast.error('Bulk action failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSelectRequest = (id) => {
//     setSelectedRequests(prev =>
//       prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
//     );
//   };

//   const selectAll = () => {
//     if (selectedRequests.length === requests.length) {
//       setSelectedRequests([]);
//     } else {
//       setSelectedRequests(requests.map(r => r._id));
//     }
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { position: 'top' },
//     },
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-10">
//       <div className="max-w-7xl mx-auto space-y-10">
//         {/* Header */}
//         <div className="text-center md:text-left">
//           <h1 className="text-3xl md:text-4xl font-bold text-indigo-700">
//             Request & Letter Management
//           </h1>
//           <p className="mt-2 text-gray-600">
//             Manage templates and review teacher submissions
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
//           {TABS.map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-6 py-3 rounded-full font-medium transition-all text-base ${
//                 activeTab === tab
//                   ? 'bg-indigo-600 text-white shadow-lg'
//                   : 'bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50'
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Charts (Requests tab only) */}
//         {activeTab === 'requests' && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
//             {requestStats && (
//               <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <PieChart size={20} className="text-purple-600" />
//                   Requests by Type
//                 </h3>
//                 <div className="h-72 md:h-80">
//                   <Pie data={requestStats} options={chartOptions} />
//                 </div>
//               </div>
//             )}

//             {requestTrend && (
//               <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <BarChart2 size={20} className="text-indigo-600" />
//                   Request Trend
//                 </h3>
//                 <div className="h-72 md:h-80">
//                   <Bar data={requestTrend} options={chartOptions} />
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Main Content */}
//         {loading ? (
//           <div className="flex justify-center py-20">
//             <Loader2 className="animate-spin text-indigo-600 h-12 w-12" />
//           </div>
//         ) : activeTab === 'templates' ? (
//           <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
//               <h2 className="text-2xl font-bold text-gray-900">
//                 {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Templates
//               </h2>

//               <div className="flex gap-3">
//                 <select
//                   value={selectedType}
//                   onChange={(e) => {
//                     setSelectedType(e.target.value);
//                     handleCancelEdit();
//                   }}
//                   className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                 >
//                   {['leave', 'resignation', 'report'].map(t => (
//                     <option key={t} value={t}>
//                       {t.charAt(0).toUpperCase() + t.slice(1)}
//                     </option>
//                   ))}
//                 </select>

//                 {!editingTemplate && (
//                   <button
//                     onClick={() => {
//                       setEditingTemplate(null);
//                       setCreatingNew(true);
//                       setFormData({
//                         type: selectedType,
//                         title: '',
//                         category: '',
//                         content: '',
//                         isActive: true,
//                       });
//                     }}
//                     className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"
//                   >
//                     <Plus size={18} />
//                     New Template
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Template Form */}
//             {(editingTemplate || creatingNew || formData.title) && (
//               <div className="bg-indigo-50/30 p-6 rounded-2xl mb-10 border border-indigo-100">
//                 <h3 className="text-xl font-bold text-gray-800 mb-6">
//                   {editingTemplate ? 'Edit Template' : 'Create New Template'}
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
//                     <input
//                       type="text"
//                       value={formData.title}
//                       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                       className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
//                       placeholder="e.g. Sick Leave Request"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Category (optional)</label>
//                     <input
//                       type="text"
//                       value={formData.category}
//                       onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                       className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
//                       placeholder="e.g. incident, suggestion"
//                     />
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Content / Letter Body</label>
//                   <textarea
//                     rows={10}
//                     value={formData.content}
//                     onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//                     className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 resize-y font-mono whitespace-pre-wrap"
//                     placeholder="Write the default letter content here..."
//                   />
//                 </div>

//                 <div className="flex items-center gap-3 mb-6">
//                   <input
//                     type="checkbox"
//                     id="isActive"
//                     checked={formData.isActive}
//                     onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                     className="h-5 w-5 text-indigo-600 rounded"
//                   />
//                   <label htmlFor="isActive" className="text-gray-700 cursor-pointer">
//                     Active (visible to teachers)
//                   </label>
//                 </div>

//                 <div className="flex gap-4">
//                   <button
//                     onClick={handleCreateOrUpdate}
//                     disabled={loading}
//                     className={`flex-1 py-3 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
//                       loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
//                     }`}
//                   >
//                     {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
//                     {editingTemplate ? 'Update' : 'Create'}
//                   </button>

//                   {editingTemplate && (
//                     <button
//                       onClick={handleCancelEdit}
//                       className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
//                     >
//                       Cancel
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Template List */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {templates.length === 0 ? (
//                 <div className="col-span-full text-center py-12 text-gray-600">
//                   No {selectedType} templates found yet.
//                 </div>
//               ) : (
//                 templates.map((template) => (
//                   <div
//                     key={template._id}
//                     className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
//                   >
//                     <div className="flex justify-between items-start mb-3">
//                       <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           template.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                         }`}
//                       >
//                         {template.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </div>

//                     {template.category && (
//                       <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs mb-3">
//                         {template.category}
//                       </span>
//                     )}

//                     <p className="text-gray-600 text-sm line-clamp-4 mb-4">
//                       {template.content.substring(0, 150)}...
//                     </p>

//                     <div className="flex gap-3 mt-4">
//                       <button
//                         onClick={() => handleEdit(template)}
//                         className="flex-1 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition flex items-center justify-center gap-2 text-sm"
//                       >
//                         <Edit2 size={16} />
//                         Edit
//                       </button>

//                       <button
//                         onClick={() => handleDelete(template._id)}
//                         className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         ) : (
//           // Requests Tab
//           <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//               <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
//                 <FileText size={24} className="text-indigo-600" />
//                 Teacher Requests
//               </h2>

//               {selectedRequests.length > 0 && (
//                 <div className="flex gap-3 flex-wrap">
//                   <button
//                     onClick={() => handleBulkAction('approved')}
//                     className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
//                   >
//                     <CheckCircle size={16} />
//                     Approve ({selectedRequests.length})
//                   </button>

//                   <button
//                     onClick={() => handleBulkAction('declined')}
//                     className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm"
//                   >
//                     <XCircle size={16} />
//                     Decline ({selectedRequests.length})
//                   </button>
//                 </div>
//               )}
//             </div>

//             {requests.length === 0 ? (
//               <div className="text-center py-12 text-gray-600">
//                 No pending or recent requests at this time.
//               </div>
//             ) : (
//               <>
//                 {/* Bulk Select All */}
//                 <div className="mb-4 flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={selectedRequests.length === requests.length}
//                     onChange={selectAll}
//                     className="h-5 w-5 text-indigo-600 rounded border-gray-300"
//                   />
//                   <span className="text-sm text-gray-700">
//                     Select All ({requests.length})
//                   </span>
//                 </div>

//                 <div className="overflow-x-auto rounded-lg border border-gray-200">
//                   <table className="w-full min-w-max">
//                     <thead>
//                       <tr className="bg-indigo-600 text-white text-left">
//                         <th className="p-4 w-10"></th>
//                         <th className="p-4">Teacher</th>
//                         <th className="p-4">Type</th>
//                         <th className="p-4">Subject</th>
//                         <th className="p-4">Date</th>
//                         <th className="p-4">Status</th>
//                         <th className="p-4 text-center">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {requests.map((req) => (
//                         <tr key={req._id} className="border-b hover:bg-gray-50 transition">
//                           <td className="p-4">
//                             <input
//                               type="checkbox"
//                               checked={selectedRequests.includes(req._id)}
//                               onChange={() => toggleSelectRequest(req._id)}
//                               className="h-5 w-5 text-indigo-600 rounded border-gray-300"
//                             />
//                           </td>
//                           <td className="p-4">
//                             {req.isAnonymous ? 'Anonymous' : req.teacher?.name || 'Unknown'}
//                           </td>
//                           <td className="p-4 capitalize">{req.type}</td>
//                           <td className="p-4">{req.subject}</td>
//                           <td className="p-4 text-sm text-gray-600">
//                             {new Date(req.createdAt).toLocaleDateString()}
//                           </td>
//                           <td className="p-4">
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                 req.status === 'pending'
//                                   ? 'bg-yellow-100 text-yellow-800'
//                                   : req.status === 'approved'
//                                   ? 'bg-green-100 text-green-800'
//                                   : req.status === 'declined'
//                                   ? 'bg-red-100 text-red-800'
//                                   : 'bg-blue-100 text-blue-800'
//                               }`}
//                             >
//                               {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
//                             </span>
//                           </td>
//                           <td className="p-4 text-center">
//                             {req.status === 'pending' && (
//                               <div className="flex justify-center gap-3">
//                                 <button
//                                   onClick={() => handleRequestAction(req._id, 'approved')}
//                                   className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
//                                   title="Approve"
//                                 >
//                                   <CheckCircle size={18} />
//                                 </button>

//                                 <button
//                                   onClick={() => handleRequestAction(req._id, 'declined')}
//                                   className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
//                                   title="Decline"
//                                 >
//                                   <XCircle size={18} />
//                                 </button>

//                                 <button
//                                   onClick={() => setDetailModal({ request: req, open: true })}
//                                   className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
//                                   title="View Details"
//                                 >
//                                   <Eye size={18} />
//                                 </button>
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </>
//             )}
//           </div>
//         )}

//         {/* Detail Modal */}
//         <AnimatePresence>
//           {detailModal && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
//               onClick={() => setDetailModal(null)}
//             >
//               <motion.div
//                 initial={{ scale: 0.9, y: 20 }}
//                 animate={{ scale: 1, y: 0 }}
//                 exit={{ scale: 0.9, y: 20 }}
//                 className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-8 md:p-12"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <button
//                   onClick={() => setDetailModal(null)}
//                   className="absolute top-6 right-6 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition"
//                 >
//                   <X size={28} />
//                 </button>

//                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
//                   Request Details
//                 </h2>

//                 <div className="space-y-6 text-gray-800">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <p className="text-sm text-gray-600">Teacher</p>
//                       <p className="font-medium">
//                         {detailModal.request.isAnonymous
//                           ? 'Anonymous'
//                           : detailModal.request.teacher?.name || 'Unknown'}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-sm text-gray-600">Type</p>
//                       <p className="font-medium capitalize">{detailModal.request.type}</p>
//                     </div>

//                     <div>
//                       <p className="text-sm text-gray-600">Subject</p>
//                       <p className="font-medium">{detailModal.request.subject}</p>
//                     </div>

//                     <div>
//                       <p className="text-sm text-gray-600">Submitted On</p>
//                       <p className="font-medium">
//                         {new Date(detailModal.request.createdAt).toLocaleString()}
//                       </p>
//                     </div>

//                     {detailModal.request.type === 'leave' && (
//                       <>
//                         <div>
//                           <p className="text-sm text-gray-600">Start Date</p>
//                           <p className="font-medium">
//                             {detailModal.request.startDate
//                               ? new Date(detailModal.request.startDate).toLocaleDateString()
//                               : 'N/A'}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">End Date</p>
//                           <p className="font-medium">
//                             {detailModal.request.endDate
//                               ? new Date(detailModal.request.endDate).toLocaleDateString()
//                               : 'N/A'}
//                           </p>
//                         </div>
//                       </>
//                     )}

//                     {detailModal.request.type === 'resignation' && (
//                       <div>
//                         <p className="text-sm text-gray-600">Last Working Day</p>
//                         <p className="font-medium">
//                           {detailModal.request.lastWorkingDay
//                             ? new Date(detailModal.request.lastWorkingDay).toLocaleDateString()
//                             : 'N/A'}
//                         </p>
//                       </div>
//                     )}

//                     <div className="md:col-span-2">
//                       <p className="text-sm text-gray-600 mb-2">Full Message</p>
//                       <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 whitespace-pre-wrap text-sm">
//                         {detailModal.request.body}
//                       </div>
//                     </div>

//                     {detailModal.request.reviewComment && (
//                       <div className="md:col-span-2">
//                         <p className="text-sm text-gray-600 mb-2">Admin Comment</p>
//                         <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 text-sm">
//                           {detailModal.request.reviewComment}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {detailModal.request.status === 'pending' && (
//                   <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
//                     <button
//                       onClick={() => {
//                         handleRequestAction(detailModal.request._id, 'approved');
//                         setDetailModal(null);
//                       }}
//                       className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
//                     >
//                       <CheckCircle size={18} />
//                       Approve
//                     </button>

//                     <button
//                       onClick={() => {
//                         handleRequestAction(detailModal.request._id, 'declined');
//                         setDetailModal(null);
//                       }}
//                       className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
//                     >
//                       <XCircle size={18} />
//                       Decline
//                     </button>
//                   </div>
//                 )}
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }







// src/pages/admin/AdminRequestTemplates.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Plus, Edit2, Trash2, Save, X, CheckCircle, XCircle,
  FileText, Clock, AlertTriangle, BarChart2, PieChart, Eye,
  Square, CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TABS = ['templates', 'pending-requests', 'all-requests'];

export default function AdminRequestTemplates() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('leave');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [formData, setFormData] = useState({
    type: 'leave',
    title: '',
    category: '',
    content: '',
    isActive: true,
  });

  // Request management
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [detailModal, setDetailModal] = useState(null); // { request, open: boolean }

  // Chart data
  const [requestStats, setRequestStats] = useState(null);
  const [requestTrend, setRequestTrend] = useState(null);

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'pending-requests') {
      fetchPendingRequests();
    } else if (activeTab === 'all-requests') {
      fetchAllRequests();
    }
  }, [activeTab, selectedType]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/request/request-templates?type=${selectedType}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTemplates(res.data.templates || []);
      console.log('Templates loaded:', res.data.templates);
    } catch (err) {
      console.error('Template fetch error:', err.response?.data || err.message);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/request/requests/pending`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = res.data.requests || [];
      setPendingRequests(data);
      updateRequestCharts(data);
    } catch (err) {
      console.error('Pending requests error:', err);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/request/requests/all`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = res.data.requests || [];
      setAllRequests(data);
      console.log(data)
    } catch (err) {
      console.error('All requests error:', err);
      toast.error('Failed to load all requests history');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestCharts = (data) => {
    if (!data?.length) return;

    const typeCounts = data.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    setRequestStats({
      labels: Object.keys(typeCounts),
      datasets: [{
        data: Object.values(typeCounts),
        backgroundColor: ['#6366f1', '#ec4899', '#10b981'],
        borderWidth: 1,
      }],
    });

    const monthlyCounts = {};
    data.forEach(r => {
      const month = new Date(r.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthlyCounts).sort((a, b) => new Date(a) - new Date(b));

    setRequestTrend({
      labels: sortedMonths,
      datasets: [{
        label: 'Number of Requests',
        data: sortedMonths.map(m => monthlyCounts[m]),
        backgroundColor: '#4f46e5',
        borderRadius: 6,
      }],
    });
  };

  // Template CRUD
  const handleCreateOrUpdate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return toast.error('Title and content are required');
    }

    setLoading(true);
    try {
      const payload = { ...formData };

      if (editingTemplate) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/request/request-templates/${editingTemplate._id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Template updated');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/request/request-templates`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Template created');
      }

      setEditingTemplate(null);
      setCreatingNew(false);
      setFormData({
        type: selectedType,
        title: '',
        category: '',
        content: '',
        isActive: true,
      });
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setCreatingNew(false);
    setFormData({
      type: template.type,
      title: template.title,
      category: template.category || '',
      content: template.content,
      isActive: template.isActive,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template permanently?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/request/request-templates/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Template deleted');
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setCreatingNew(true);
    setFormData({
      type: selectedType,
      title: '',
      category: '',
      content: '',
      isActive: true,
    });
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setCreatingNew(false);
    setFormData({
      type: selectedType,
      title: '',
      category: '',
      content: '',
      isActive: true,
    });
  };

  // Request Actions
  const handleRequestAction = async (requestId, action, comment = '') => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/request/requests/${requestId}/review`,
        { status: action, reviewComment: comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success(`Request ${action}`);
      if (activeTab === 'pending-requests') fetchPendingRequests();
      else fetchAllRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedRequests.length === 0) return toast.warning('No requests selected');

    if (!window.confirm(`Are you sure you want to ${action} ${selectedRequests.length} request(s)?`)) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedRequests.map(id =>
          axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/request/requests/${id}/review`,
            { status: action },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          )
        )
      );

      toast.success(`Bulk ${action} completed`);
      setSelectedRequests([]);
      if (activeTab === 'pending-requests') fetchPendingRequests();
      else fetchAllRequests();
    } catch (err) {
      toast.error('Bulk action failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectRequest = (id) => {
    setSelectedRequests(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const currentList = activeTab === 'pending-requests' ? pendingRequests : allRequests;
    if (selectedRequests.length === currentList.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(currentList.map(r => r._id));
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-1xl md:text-2xl font-bold text-indigo-700">
            Request & Letter Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage templates and review all teacher submissions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-medium transition-all text-base ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Charts (for requests tabs) */}
        {(activeTab === 'pending-requests' || activeTab === 'all-requests') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {requestStats && (
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart size={20} className="text-purple-600" />
                  Requests by Type
                </h3>
                <div className="h-72 md:h-80">
                  <Pie data={requestStats} options={chartOptions} />
                </div>
              </div>
            )}

            {requestTrend && (
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart2 size={20} className="text-indigo-600" />
                  Request Trend
                </h3>
                <div className="h-72 md:h-80">
                  <Bar data={requestTrend} options={chartOptions} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 h-12 w-12" />
          </div>
        ) : activeTab === 'templates' ? (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Templates
              </h2>

              <div className="flex gap-3">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    handleCancelEdit();
                  }}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {['leave', 'resignation', 'report'].map(t => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setCreatingNew(true);
                    setFormData({
                      type: selectedType,
                      title: '',
                      category: '',
                      content: '',
                      isActive: true,
                    });
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Template
                </button>
              </div>
            </div>

            {/* Form */}
            {(editingTemplate || creatingNew) && (
              <div className="bg-indigo-50/30 p-6 rounded-2xl mb-10 border border-indigo-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Sick Leave Request"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category (optional)</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. incident, suggestion"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content / Letter Body</label>
                  <textarea
                    rows={10}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 resize-y font-mono whitespace-pre-wrap"
                    placeholder="Write the default letter content here..."
                  />
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 text-indigo-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-gray-700 cursor-pointer">
                    Active (visible to teachers)
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleCreateOrUpdate}
                    disabled={loading}
                    className={`flex-1 py-3 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {editingTemplate ? 'Update' : 'Create'}
                  </button>

                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Template List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-600">
                  No {selectedType} templates found yet.
                </div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template._id}
                    className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          template.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {template.category && (
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs mb-3">
                        {template.category}
                      </span>
                    )}

                    <p className="text-gray-600 text-sm line-clamp-4 mb-4">
                      {template.content.substring(0, 150)}...
                    </p>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleEdit(template)}
                        className="flex-1 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(template._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'pending-requests' ? (
  <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <Clock size={24} className="text-yellow-600" />
        Pending Requests
      </h2>

      {selectedRequests.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleBulkAction('approved')}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm shadow-sm"
          >
            <CheckCircle size={16} />
            Approve ({selectedRequests.length})
          </button>

          <button
            onClick={() => handleBulkAction('declined')}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm shadow-sm"
          >
            <XCircle size={16} />
            Decline ({selectedRequests.length})
          </button>
        </div>
      )}
    </div>

    {pendingRequests.length === 0 ? (
      <div className="text-center py-16 text-gray-600">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          No Pending Requests
        </h3>
        <p className="max-w-md mx-auto">
          All teacher requests have been processed or none are pending at this time.
        </p>
      </div>
    ) : (
      <>
        {/* Bulk Select All */}
        <div className="mb-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedRequests.length === pendingRequests.length}
            onChange={selectAll}
            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700 font-medium">
            Select All ({pendingRequests.length})
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-indigo-600 text-white text-left">
                <th className="p-4 w-10"></th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((req) => (
                <tr key={req._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(req._id)}
                      onChange={() => toggleSelectRequest(req._id)}
                      className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-4 font-medium">
                    {req.isAnonymous ? (
                      <span className="text-red-600">Anonymous</span>
                    ) : (
                      req.teacher?.name || 'Unknown'
                    )}
                  </td>
                  <td className="p-4 capitalize">{req.type}</td>
                  <td className="p-4 font-medium">{req.subject}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        req.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Pending
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleRequestAction(req._id, 'approved')}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>

                      <button
                        onClick={() => handleRequestAction(req._id, 'declined')}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        title="Decline"
                      >
                        <XCircle size={18} />
                      </button>

                      <button
                        onClick={() => setDetailModal({ request: req, open: true })}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        title="View Full Details"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </div>
) : (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText size={24} className="text-indigo-600" />
              All Requests History
            </h2>

            {allRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No requests have been submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="bg-indigo-600 text-white text-left">
                      <th className="p-4">Teacher</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRequests.map((req) => (
                      <tr key={req._id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-4">
                          {req.isAnonymous ? 'Anonymous' : req.teacher?.name || 'Unknown'}
                        </td>
                        <td className="p-4 capitalize">{req.type}</td>
                        <td className="p-4">{req.subject}</td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
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
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setDetailModal({ request: req, open: true })}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
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
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-8 md:p-12"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setDetailModal(null)}
                  className="absolute top-6 right-6 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                >
                  <X size={28} />
                </button>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
                  {detailModal.request.subject}
                </h2>

                <div className="space-y-6 text-gray-800">
                 <div className="space-y-6 text-gray-800">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Teacher / Anonymity */}
    <div>
      <p className="text-sm text-gray-600 font-medium">Submitted By</p>
      <p className="font-semibold text-gray-900 mt-1">
        {detailModal.request.isAnonymous 
          ? 'Anonymous Submission' 
          : detailModal.request.teacher?.name || 'Unknown Teacher'}
      </p>
      {detailModal.request.isAnonymous && (
        <p className="text-xs text-red-600 mt-1 italic">
          Teacher chose to remain anonymous
        </p>
      )}
    </div>

    {/* Request Type */}
    <div>
      <p className="text-sm text-gray-600 font-medium">Request Type</p>
      <p className="font-semibold capitalize text-gray-900 mt-1">
        {detailModal.request.type}
      </p>
    </div>

    {/* Subject */}
    <div>
      <p className="text-sm text-gray-600 font-medium">Subject / Title</p>
      <p className="font-semibold text-gray-900 mt-1">
        {detailModal.request.subject}
      </p>
    </div>

    {/* Submitted Date */}
    <div>
      <p className="text-sm text-gray-600 font-medium">Submitted On</p>
      <p className="font-semibold text-gray-900 mt-1">
        {new Date(detailModal.request.createdAt).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>

    {/* Leave-specific fields */}
    {detailModal.request.type === 'leave' && (
      <>
        <div>
          <p className="text-sm text-gray-600 font-medium">Start Date</p>
          <p className="font-semibold text-gray-900 mt-1">
            {detailModal.request.startDate
              ? new Date(detailModal.request.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Not specified'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 font-medium">End Date</p>
          <p className="font-semibold text-gray-900 mt-1">
            {detailModal.request.endDate
              ? new Date(detailModal.request.endDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Not specified'}
          </p>
        </div>
      </>
    )}

    {/* Resignation-specific field */}
    {detailModal.request.type === 'resignation' && (
      <div>
        <p className="text-sm text-gray-600 font-medium">Last Working Day</p>
        <p className="font-semibold text-gray-900 mt-1">
          {detailModal.request.lastWorkingDay
            ? new Date(detailModal.request.lastWorkingDay).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Not specified'}
        </p>
      </div>
    )}

    {/* Full Message */}
    <div className="md:col-span-2">
      <p className="text-sm text-gray-600 font-medium mb-2">Full Message / Letter Body</p>
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
        {detailModal.request.body || 'No message content available'}
      </div>
    </div>

    {/* Admin Review Comment (if exists) */}
    {detailModal.request.reviewComment && (
      <div className="md:col-span-2">
        <p className="text-sm text-gray-600 font-medium mb-2">Admin Review Comment</p>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-sm leading-relaxed">
          {detailModal.request.reviewComment}
        </div>
      </div>
    )}

    {/* Status & Reviewed By */}
    <div className="md:col-span-2 pt-4 border-t">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-600 font-medium">Current Status</p>
          <span
            className={`inline-block px-4 py-1.5 mt-1 rounded-full text-sm font-medium ${
              detailModal.request.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : detailModal.request.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : detailModal.request.status === 'declined'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {detailModal.request.status.charAt(0).toUpperCase() + detailModal.request.status.slice(1)}
          </span>
        </div>

        {detailModal.request.reviewedBy && (
          <div className="text-right">
            <p className="text-sm text-gray-600 font-medium">Reviewed By</p>
            <p className="font-medium text-gray-900 mt-1">
              {detailModal.request.reviewedBy?.name || 'Admin'}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Action Buttons (only show if still pending) */}
  {detailModal.request.status === 'pending' && (
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
      <button
        onClick={() => {
          handleRequestAction(detailModal.request._id, 'approved');
          setDetailModal(null);
        }}
        className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition flex items-center justify-center gap-2 shadow-md font-medium"
      >
        <CheckCircle size={18} />
        Approve Request
      </button>

      <button
        onClick={() => {
          handleRequestAction(detailModal.request._id, 'declined');
          setDetailModal(null);
        }}
        className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition flex items-center justify-center gap-2 shadow-md font-medium"
      >
        <XCircle size={18} />
        Decline Request
      </button>
    </div>
  )}
</div>
                </div>

                {detailModal.request.status === 'pending' && (
                  <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                      onClick={() => {
                        handleRequestAction(detailModal.request._id, 'approved');
                        setDetailModal(null);
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>

                    <button
                      onClick={() => {
                        handleRequestAction(detailModal.request._id, 'declined');
                        setDetailModal(null);
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Decline
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}