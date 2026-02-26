// src/pages/admin/AdminPayrollDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bar, 
  Line, 
  Pie, 
  Doughnut 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Loader2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPayrollDashboard() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // For modal

  // Charts data
  const [monthlyTotals, setMonthlyTotals] = useState(null);
  const [roleDistribution, setRoleDistribution] = useState(null);
  const [topEarners, setTopEarners] = useState(null);
  const [totalStats, setTotalStats] = useState({
    totalPaid: 0,
    totalEmployees: 0,
    avgSalary: 0,
    highestSalary: 0,
  });

  useEffect(() => {
    fetchAllPayrolls();
  }, []);

  const fetchAllPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/payrolls/all`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPayrolls(res.data.payrolls || []);
      processPayrollData(res.data.payrolls);
    } catch (err) {
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const processPayrollData = (data) => {
    const monthly = {};
    const roleTotals = {};
    let totalPaid = 0;
    const employeeSet = new Set();

    data.forEach(p => {
      // Monthly totals
      monthly[p.month] = (monthly[p.month] || 0) + p.netSalary;

      // Role distribution
      const role = p.employee.role;
      roleTotals[role] = (roleTotals[role] || 0) + p.netSalary;

      // Stats
      totalPaid += p.netSalary;
      employeeSet.add(p.employee._id);
    });

    const sortedMonths = Object.keys(monthly).sort();
    setMonthlyTotals({
      labels: sortedMonths,
      datasets: [{
        label: 'Total Payroll Payout',
        data: sortedMonths.map(m => monthly[m]),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true,
      }],
    });

    setRoleDistribution({
      labels: Object.keys(roleTotals),
      datasets: [{
        data: Object.values(roleTotals),
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        hoverOffset: 20,
      }],
    });

    const sorted = [...data]
      .sort((a, b) => b.netSalary - a.netSalary)
      .slice(0, 10);

    setTopEarners({
      labels: sorted.map(p => p.employee.name),
      datasets: [{
        label: 'Net Salary',
        data: sorted.map(p => p.netSalary),
        backgroundColor: '#6366f1',
        borderRadius: 8,
      }],
    });

    setTotalStats({
      totalPaid,
      totalEmployees: employeeSet.size,
      avgSalary: employeeSet.size ? totalPaid / employeeSet.size : 0,
      highestSalary: sorted[0]?.netSalary || 0,
    });
  };

  const filteredPayrolls = selectedMonth
    ? payrolls.filter(p => p.month === selectedMonth)
    : payrolls.filter(p => p.month.startsWith(selectedYear));

  const months = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1).toString().padStart(2, '0');
    return `${selectedYear}-${m}`;
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { backgroundColor: 'rgba(30, 41, 59, 0.9)' },
    },
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Month', 'Employee', 'Role', 'Salary', 'Bonuses', 'Net Salary'];
    const rows = filteredPayrolls.map(p => [
      p.month,
      p.employee.name,
      p.employee.role,
      p.salary,
      p.bonuses,
      p.netSalary,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll_${selectedMonth || selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('School Payroll Report', 14, 20);

    doc.setFontSize(12);
    doc.text(`Period: ${selectedMonth || `${selectedYear} (All Months)`}`, 14, 30);

    const tableData = filteredPayrolls.map(p => [
      p.month,
      p.employee.name,
      p.employee.role,
      `₦${p.salary.toLocaleString()}`,
      `₦${p.bonuses.toLocaleString()}`,
      `₦${p.netSalary.toLocaleString()}`,
    ]);

    doc.autoTable({
      head: [['Month', 'Employee', 'Role', 'Salary', 'Bonuses', 'Net Salary']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 },
    });

    doc.save(`payroll_${selectedMonth || selectedYear}.pdf`);
    toast.success('PDF exported successfully');
  };

  // Per-employee history modal
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');

  const openEmployeeHistory = (employeeId, employeeName) => {
    const history = payrolls.filter(p => p.employee._id === employeeId);
    setEmployeeHistory(history);
    setSelectedEmployeeName(employeeName);
    setShowEmployeeModal(true);
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
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Payroll Analytics Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Full visibility into school-wide payrolls
            </p>
          </div>

          {/* Filters & Export */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex gap-4">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md"
              >
                <Download size={18} />
                CSV
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md"
              >
                <Download size={18} />
                PDF
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full md:w-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full md:w-40 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Months</option>
                {months.map(m => (
                  <option key={m} value={m}>
                    {new Date(m).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-3xl font-bold text-indigo-700 mt-1">
                  ₦{totalStats.totalPaid.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-indigo-200" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">
                  {totalStats.totalEmployees}
                </p>
              </div>
              <Users className="h-12 w-12 text-purple-200" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Salary</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">
                  ₦{Math.round(totalStats.avgSalary).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-emerald-200" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Highest</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">
                  ₦{totalStats.highestSalary.toLocaleString()}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-amber-200" />
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {monthlyTotals && (
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-indigo-600" />
                Monthly Payroll Trend
              </h2>
              <div className="h-96">
                <Line data={monthlyTotals} options={chartOptions} />
              </div>
            </div>
          )}

          {roleDistribution && (
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-purple-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-600" />
                Payroll by Role
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                  <Pie data={roleDistribution} options={chartOptions} />
                </div>
                <div className="h-80">
                  <Doughnut data={roleDistribution} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {topEarners && (
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-emerald-100 lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
                Top 10 Earners
              </h2>
              <div className="h-96">
                <Bar data={topEarners} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Payroll Table */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-200 overflow-x-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              All Payroll Records {selectedMonth && `(${selectedMonth})`}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full sm:w-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-40 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Months</option>
                {months.map(m => (
                  <option key={m} value={m}>
                    {new Date(m).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredPayrolls.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
              <p className="text-xl font-semibold text-gray-800 mb-2">No Payroll Data</p>
              <p className="text-gray-600">No payroll records found for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <th className="p-4 font-semibold text-indigo-800">Month</th>
                    <th className="p-4 font-semibold text-indigo-800">Employee</th>
                    <th className="p-4 font-semibold text-indigo-800">Role</th>
                    <th className="p-4 font-semibold text-indigo-800">Salary</th>
                    <th className="p-4 font-semibold text-indigo-800">Bonuses</th>
                    <th className="p-4 font-semibold text-indigo-800">Net Salary</th>
                    <th className="p-4 font-semibold text-indigo-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map((pay) => (
                    <tr 
                      key={pay._id} 
                      className="border-t hover:bg-indigo-50/50 transition cursor-pointer"
                      onClick={() => openEmployeeHistory(pay.employee._id, pay.employee.name)}
                    >
                      <td className="p-4">{pay.month}</td>
                      <td className="p-4 font-medium">{pay.employee.name}</td>
                      <td className="p-4 capitalize">{pay.employee.role}</td>
                      <td className="p-4">₦{pay.salary.toLocaleString()}</td>
                      <td className="p-4">₦{pay.bonuses.toLocaleString()}</td>
                      <td className="p-4 font-bold text-green-700">
                        ₦{pay.netSalary.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <button className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
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
      </div>

      {/* Per-Employee History Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
              <h2 className="text-2xl font-bold">
                Payroll History: {selectedEmployeeName}
              </h2>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="p-2 rounded-full hover:bg-indigo-700 transition"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {employeeHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No payroll records for this employee yet.</p>
              ) : (
                <div className="space-y-6">
                  {employeeHistory.map((pay) => (
                    <div key={pay._id} className="p-6 bg-indigo-50 rounded-2xl space-y-4">
                      <h3 className="text-xl font-semibold text-indigo-800">{pay.month}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>Salary:</strong> ₦{pay.salary.toLocaleString()}</p>
                        <p><strong>Bonuses:</strong> ₦{pay.bonuses.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 mb-2">Deductions:</p>
                        {pay.deductions.length > 0 ? (
                          pay.deductions.map((ded, i) => (
                            <p key={i} className="text-gray-600">
                              {ded.name}: -₦{ded.amount.toLocaleString()}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-500">No deductions</p>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        Net Salary: ₦{pay.netSalary.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}