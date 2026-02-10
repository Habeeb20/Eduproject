// src/pages/dashboard/AllDigitalIds.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import DigitalIdCard from '../DigitalCard';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
export default function AllDigitalIds() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/users/school`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setUsers(res.data.users || []);
      setFilteredUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load digital IDs');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  useEffect(() => {
    let result = users;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.digitalId?.uniqueCode?.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Digital ID Cards
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage all digital identities in your school
            </p>
          </div>
          <button
            onClick={fetchAllUsers}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by name, email or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="accountant">Accountant</option>
              <option value="librarian">Librarian</option>
            </select>
          </div>
        </div>

        {/* Grid of Cards */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading digital IDs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">No matching digital IDs</h3>
            <p className="text-gray-600 mt-2">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
            {filteredUsers.map((user) => (
              <DigitalIdCard key={user._id} user={user} isAdminView={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}