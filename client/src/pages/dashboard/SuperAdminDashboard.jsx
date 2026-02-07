// src/components/dashboard/SuperadminDashboardOverview.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Users, UserPlus, BookOpen, Briefcase, AlertCircle, CheckCircle, X,
} from 'lucide-react';
import CreateAdminForm from './Create/CreateAdminForm';
import CreateTeacherForm from './Create/CreateTeacherForm';
import CreateStudentParentForm from './Create/CreateStudentParentForm';
import CreateStaffForm from './Create/CreateStaffForm';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PRIMARY_BLUE = '#1890ff';
const SECONDARY_BLUE = '#0d6fe6';

export default function SuperadminDashboardOverview() {
  const [stats, setStats] = useState({
    admins: 0,
    teachers: 0,
    students: 0,
    parents: 0,
    accountants: 0,
    librarians: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [activeForm, setActiveForm] = useState(null); // null | 'admin' | 'teacher' | 'student' | 'staff'

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // You can create this endpoint in backend or use aggregation
      // For now we assume you have an endpoint that returns these counts
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/superadmin-stats`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setStats(response.data.stats || {
        admins: 0,
        teachers: 0,
        students: 0,
        parents: 0,
        accountants: 0,
        librarians: 0,
      });
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const chartData = {
    labels: ['Admins', 'Teachers', 'Students', 'Parents', 'Accountants', 'Librarians'],
    datasets: [
      {
        label: 'Created by you',
        data: [
          stats.admins,
          stats.teachers,
          stats.students,
          stats.parents,
          stats.accountants,
          stats.librarians,
        ],
        backgroundColor: PRIMARY_BLUE,
        borderColor: SECONDARY_BLUE,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'School Personnel Overview', font: { size: 18 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const closeModal = () => setActiveForm(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Superadmin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage all school accounts and view statistics</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Refresh Stats
        </button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={<UserPlus size={28} />}
            title="School Admins"
            value={stats.admins}
            color={PRIMARY_BLUE}
            onClick={() => setActiveForm('admin')}
          />
          <StatCard
            icon={<BookOpen size={28} />}
            title="Teachers"
            value={stats.teachers}
            color={PRIMARY_BLUE}
            onClick={() => setActiveForm('teacher')}
          />
          <StatCard
            icon={<Users size={28} />}
            title="Students"
            value={stats.students}
            color={PRIMARY_BLUE}
            onClick={() => setActiveForm('student')}
          />
          <StatCard
            icon={<Users size={28} />}
            title="Parents"
            value={stats.parents}
            color={PRIMARY_BLUE}
            onClick={() => setActiveForm('student')} // same form
          />
          <StatCard
            icon={<Briefcase size={28} />}
            title="Accountants"
            value={stats.accountants}
            color={PRIMARY_BLUE}
            onClick={() => setActiveForm('staff')}
          />
          <StatCard
            icon={<Briefcase size={28} />}
            title="Librarians"
            value={stats.librarians}
            color={PRIMARY_BLUE}
            onClick={() => setActiveForm('staff')}
          />
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Creation Modals */}
      {activeForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {activeForm === 'admin' && 'Create School Admin'}
                {activeForm === 'teacher' && 'Create Teacher'}
                {activeForm === 'student' && 'Create Student & Parent'}
                {activeForm === 'staff' && 'Create Staff Member'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6">
              {activeForm === 'admin' && <CreateAdminForm onSuccess={closeModal} />}
              {activeForm === 'create-teacher' && <CreateTeacherForm onSuccess={closeModal} />}
              {activeForm === 'student' && <CreateStudentParentForm onSuccess={closeModal} />}
              {activeForm === 'staff' && <CreateStaffForm onSuccess={closeModal} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Stat Card
function StatCard({ icon, title, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 text-left group"
    >
      <div className="flex items-center justify-between">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4 group-hover:text-[#1890ff] transition-colors">
        Click to create new →
      </p>
    </button>
  );
}