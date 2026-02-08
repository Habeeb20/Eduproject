// // src/components/dashboard/SuperadminUsersStats.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Pie, Doughnut } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
// } from 'chart.js';
// import { RefreshCw, AlertCircle } from 'lucide-react';

// // Register Chart.js components
// ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

// const COLORS = [
//   '#1890ff',   // primary blue
//   '#36A2EB',
//   '#FF6384',
//   '#FFCE56',
//   '#4BC0C0',
//   '#9966FF',
//   '#FF9F40',
// ];

// export default function SuperadminUsersStats() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/admin/users/all-with-passwords`,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         }
//       );

//       setUsers(res.data.users || []);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to load user statistics');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Prepare chart data
//   const getRoleStats = () => {
//     const roleCount = users.reduce((acc, user) => {
//       const role = user.role || 'unknown';
//       acc[role] = (acc[role] || 0) + 1;
//       return acc;
//     }, {});

//     const labels = Object.keys(roleCount);
//     const data = Object.values(roleCount);

//     return { labels, data };
//   };

//   const { labels, data } = getRoleStats();

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: 'Users by Role',
//         data,
//         backgroundColor: COLORS.slice(0, labels.length),
//         borderColor: COLORS.slice(0, labels.length),
//         borderWidth: 1,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: { font: { size: 14 } },
//       },
//       tooltip: {
//         callbacks: {
//           label: (context) => `${context.label}: ${context.raw} users`,
//         },
//       },
//     },
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-center gap-3">
//         <AlertCircle size={24} />
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-10">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">User Statistics</h1>
//           <p className="text-gray-600 mt-1">
//             Overview of all users created in the system ({users.length} total)
//           </p>
//         </div>
//         <button
//           onClick={fetchUsers}
//           className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//         >
//           <RefreshCw size={18} />
//           Refresh Data
//         </button>
//       </div>

//       {/* Charts – side by side on larger screens */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Pie Chart */}
//         <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
//             Pie Chart – Role Distribution
//           </h2>
//           <div className="h-80">
//             <Pie data={chartData} options={chartOptions} />
//           </div>
//         </div>

//         {/* Doughnut Chart */}
//         <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
//             Doughnut Chart – Role Distribution
//           </h2>
//           <div className="h-80">
//             <Doughnut data={chartData} options={chartOptions} />
//           </div>
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
//         <div className="p-6 border-b border-gray-100">
//           <h2 className="text-xl font-semibold text-gray-900">
//             Detailed User List ({users.length})
//           </h2>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full min-w-max">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">School</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Temp Password</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Password Change</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created At</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {users.length === 0 ? (
//                 <tr>
//                   <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
//                     No users found
//                   </td>
//                 </tr>
//               ) : (
//                 users.map((user, idx) => (
//                   <tr key={idx} className="hover:bg-blue-50/30 transition">
//                     <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
//                     <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
//                     <td className="px-6 py-4 text-sm font-medium capitalize text-gray-800">
//                       {user.role}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-700">{user.schoolName}</td>
//                     <td className="px-6 py-4 text-sm font-mono text-gray-900">
//                       {user.temporaryPassword || '(changed)'}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-700">
//                       {user.lastPasswordChange || 'Never changed'}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {new Date(user.createdAt).toLocaleDateString()}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/components/dashboard/SuperadminUsersStats.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { RefreshCw, AlertCircle, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'sonner';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#1890ff', '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

export default function SuperadminUsersStats() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/users/school`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUsers(res.data.users || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load users';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (userId) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // ────────────────────── Delete User ──────────────────────
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // ────────────────────── Open Edit Modal ──────────────────────
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  // ────────────────────── Handle Edit Form Change ──────────────────────
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // ────────────────────── Submit Edit ──────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/admin/users/${selectedUser._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Update local state
      setUsers(prev => prev.map(u => (u._id === selectedUser._id ? res.data.user : u)));

      toast.success('User updated successfully');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  // ────────────────────── Chart Data ──────────────────────
  const roleCount = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(roleCount),
    datasets: [{
      data: Object.values(roleCount),
      backgroundColor: COLORS.slice(0, Object.keys(roleCount).length),
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  if (loading) return <div className="text-center py-10">Loading users...</div>;
  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          All Users in Your School ({users.length})
        </h1>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">Pie Chart – Role Distribution</h2>
          <div className="h-80">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">Doughnut Chart – Role Breakdown</h2>
          <div className="h-80">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Temp Password</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Password Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created By</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created By Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm capitalize font-medium">{user.role}</td>
                  <td className="px-6 py-4 text-sm font-mono">
                    {showPasswords[user._id] ? (
                      <span>{user.temporaryPassword || 'N/A'}</span>
                    ) : (
                      <span>••••••••</span>
                    )}
                    <button
                      onClick={() => togglePassword(user._id)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords[user._id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {user.temporaryPassword ? (
                      <span className="text-green-600">Unchanged</span>
                    ) : (
                      <span className="text-gray-500">Changed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.createdBy?.name || 'Superadmin'}<br />
                    <span className="text-xs text-gray-500">({user.createdBy?.email || 'direct'})</span>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize font-medium">
                    {user.createdBy?.role || 'superadmin'}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit user"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Edit User: {selectedUser.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="accountant">Accountant</option>
                  <option value="librarian">Librarian</option>
                </select>
              </div>

              {/* Optional: Password Reset */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter new password"
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If filled, user will need to log in with this new password
                </p>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}