// src/pages/admin/UserManagementDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, User, Shield, Ban, Trash2, CheckCircle, XCircle,
  AlertTriangle, BarChart2, PieChart, Grid, List,
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

const ROLES = [
  { id: 'student', label: 'Students', icon: User },
  { id: 'teacher', label: 'Teachers', icon: Shield },
  { id: 'parent', label: 'Parents', icon: User },
];

export default function UserManagementDashboard() {
  const [activeRole, setActiveRole] = useState('student');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  // Chart data
  const [userStats, setUserStats] = useState(null);
  const [registrationTrend, setRegistrationTrend] = useState(null);
  const [statusCounts, setStatusCounts] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [activeRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/users?role=${activeRole}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = res.data.users || [];
      setUsers(data);
      updateCharts(data);
    } catch (err) {
      toast.error('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCharts = (data) => {
    if (!data.length) return;

    // Pie: Status Breakdown (active/blocked/deactivated)
    const statusCount = data.reduce((acc, u) => {
      const status = u.isDeactivated ? 'deactivated' : u.isBlocked ? 'blocked' : 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    setStatusCounts({
      labels: Object.keys(statusCount),
      datasets: [{
        data: Object.values(statusCount),
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], // active green, blocked red, deactivated orange
        borderWidth: 1,
      }],
    });

    // Bar: Registration Trend (monthly)
    const monthlyRegs = data.reduce((acc, u) => {
      const month = new Date(u.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyRegs).sort((a, b) => new Date(a) - new Date(b));

    setRegistrationTrend({
      labels: sortedMonths,
      datasets: [{
        label: 'Registrations',
        data: sortedMonths.map(m => monthlyRegs[m]),
        backgroundColor: '#6366f1',
        borderRadius: 6,
      }],
    });

    // Overall stats (for all roles - optional, fetch separately if needed)
  };

  // User Actions
  const handleToggleBlock = async (userId, isBlocked) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/admin/${userId}/block`,
        { block: !isBlocked },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleToggleDeactivate = async (userId, isDeactivated) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/admin/${userId}/deactivate`,
        { deactivate: !isDeactivated },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`User ${isDeactivated ? 'reactivated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/admin/${userId}/delete`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return toast.warning('No users selected');

    try {
      await Promise.all(selectedUsers.map(id => {
        if (action === 'block') return handleToggleBlock(id, false); // block active
        if (action === 'unblock') return handleToggleBlock(id, true); // unblock blocked
        if (action === 'deactivate') return handleToggleDeactivate(id, false);
        if (action === 'reactivate') return handleToggleDeactivate(id, true);
        if (action === 'delete') return handleDelete(id);
      }));
      toast.success(`Bulk ${action} completed for ${selectedUsers.length} users`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      toast.error('Bulk action failed');
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 h-16 w-16" />
    </div>
  );

  return (
    <div className="min-h-screen  p-6 md:p-10">
      <div className="max-w-7xl mx-auto  rounded-3xl shadow-2xl p-6 md:p-10 space-y-10">
        <h1 className="text-1xl md:text-2xl font-bold  text-center md:text-left">
          User Management Dashboard
        </h1>

        {/* Role Navigation */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                activeRole === role.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <role.icon size={18} />
              {role.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <List size={20} />
          </button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statusCounts && (
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PieChart size={20} className="text-purple-600" />
                Status Breakdown
              </h3>
              <Pie data={statusCounts} options={{ responsive: true }} />
            </div>
          )}

          {registrationTrend && (
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart2 size={20} className="text-indigo-600" />
                Registration Trend
              </h3>
              <Bar data={registrationTrend} options={{ responsive: true }} />
            </div>
          )}
        </div>

        {/* Bulk Actions (if selected) */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-50 p-4 rounded-xl flex flex-wrap gap-3 items-center border border-indigo-100"
          >
            <span className="text-sm font-medium text-gray-700">
              Selected {selectedUsers.length} users
            </span>

            <button
              onClick={() => handleBulkAction('block')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 text-sm"
            >
              <Ban size={16} />
              Block
            </button>

            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm"
            >
              <XCircle size={16} />
              Deactivate
            </button>

            <button
              onClick={() => handleBulkAction('delete')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>

            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
            >
              Clear Selection
            </button>
          </motion.div>
        )}

        {/* Users Grid / List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}s
          </h2>

          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No {activeRole}s found in your school.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(user => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleSelectUser(user._id)}
                      className="h-5 w-5 text-indigo-600 rounded border-gray-300"
                    />
                  </div>

                  <div className="space-y-3 text-sm">
                    <p>
                      <span className="font-medium">Role:</span> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                    <p>
                      <span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                          user.isDeactivated ? 'bg-orange-100 text-orange-800' : user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.isDeactivated ? 'Deactivated' : user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                      className="flex-1 py-2 text-sm rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
                      style={{ backgroundColor: user.isBlocked ? '#10b981' : '#f59e0b', color: 'white' }}
                    >
                      <Ban size={16} />
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>

                    <button
                      onClick={() => handleToggleDeactivate(user._id, user.isDeactivated)}
                      className="flex-1 py-2 text-sm rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
                      style={{ backgroundColor: user.isDeactivated ? '#10b981' : '#ef4444', color: 'white' }}
                    >
                      <XCircle size={16} />
                      {user.isDeactivated ? 'Reactivate' : 'Deactivate'}
                    </button>

                    <button
                      onClick={() => handleDelete(user._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    <th className="p-4 w-10"></th>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Joined</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleSelectUser(user._id)}
                          className="h-5 w-5 text-indigo-600 rounded border-gray-300"
                        />
                      </td>
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 text-sm text-gray-600">{user.email}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.isDeactivated ? 'bg-orange-100 text-orange-800' : user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.isDeactivated ? 'Deactivated' : user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                            className="p-2 rounded-lg transition"
                            style={{ backgroundColor: user.isBlocked ? '#10b981' : '#f59e0b', color: 'white' }}
                            title={user.isBlocked ? 'Unblock' : 'Block'}
                          >
                            <Ban size={18} />
                          </button>

                          <button
                            onClick={() => handleToggleDeactivate(user._id, user.isDeactivated)}
                            className="p-2 rounded-lg transition"
                            style={{ backgroundColor: user.isDeactivated ? '#10b981' : '#ef4444', color: 'white' }}
                            title={user.isDeactivated ? 'Reactivate' : 'Deactivate'}
                          >
                            <XCircle size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}