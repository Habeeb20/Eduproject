// // src/pages/accountant/AccountantDashboard.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Loader2, Plus, Save, Trash2, AlertTriangle } from 'lucide-react';
// import { toast } from 'sonner';

// export default function AccountantDashboard() {
//   const [payrolls, setPayrolls] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [employees, setEmployees] = useState([]); // Staff, teachers, admins
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [salary, setSalary] = useState(0);
//   const [bonuses, setBonuses] = useState(0);
//   const [deductions, setDeductions] = useState([]); // [{ name: 'Tax', amount: 100 }, ...]
//   const [netSalary, setNetSalary] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [publishing, setPublishing] = useState(false);

//   useEffect(() => {
//     fetchEmployees();
//     fetchPayrolls();
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/staff`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       console.log(res.data)
//       setEmployees(res.data.staff|| []);
//     } catch (err) {
//       toast.error('Failed to load employees');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPayrolls = async () => {
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payrolls`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setPayrolls(res.data.payrolls || []);
//     } catch (err) {
//       toast.error('Failed to load payrolls');
//     }
//   };

//   const addDeduction = () => {
//     setDeductions([...deductions, { name: '', amount: 0 }]);
//   };

//   const updateDeduction = (index, field, value) => {
//     const updated = [...deductions];
//     updated[index][field] = field === 'amount' ? Number(value) : value;
//     setDeductions(updated);
//   };

//   const removeDeduction = (index) => {
//     setDeductions(deductions.filter((_, i) => i !== index));
//   };

//   useEffect(() => {
//     const totalIncome = salary + bonuses;
//     const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
//     setNetSalary(totalIncome - totalDeductions);
//   }, [salary, bonuses, deductions]);

//   const handleSave = async () => {
//     if (!selectedMonth || !selectedEmployee) {
//       toast.error('Select month and employee');
//       return;
//     }

//     setSaving(true);
//     try {
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payrolls`, {
//         month: selectedMonth,
//         employeeId: selectedEmployee,
//         salary,
//         bonuses,
//         deductions,
//         netSalary,
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       toast.success('Payroll saved');
//       resetForm();
//       fetchPayrolls();
//     } catch (err) {
//       toast.error('Failed to save payroll');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handlePublish = async (payrollId) => {
//     setPublishing(true);
//     try {
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payrolls/${payrollId}/publish`, {}, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       toast.success('Payroll published');
//       fetchPayrolls();
//     } catch (err) {
//       toast.error('Failed to publish payroll');
//     } finally {
//       setPublishing(false);
//     }
//   };

//   const resetForm = () => {
//     setSelectedEmployee(null);
//     setSalary(0);
//     setBonuses(0);
//     setDeductions([]);
//     setNetSalary(0);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-10">
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">
//           Accountant Dashboard - Create Payroll
//         </h1>

//         {/* Month Selection */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">Select Month *</label>
//           <input
//             type="month"
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//             required
//           />
//         </div>

//         {/* Employee Selection */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">Select Employee *</label>
//           <select
//             value={selectedEmployee || ''}
//             onChange={(e) => setSelectedEmployee(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//             required
//           >
//             <option value="">Choose Employee</option>
//             {employees.map((emp) => (
//               <option key={emp._id} value={emp._id}>
//                 {emp.name} ({emp.role})
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Incomes */}
//         <div className="space-y-4">
//           <h2 className="text-xl font-semibold text-gray-800">Incomes</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">Salary</label>
//               <input
//                 type="number"
//                 value={salary}
//                 onChange={(e) => setSalary(Number(e.target.value))}
//                 className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                 min="0"
//               />
//             </div>
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">Bonuses</label>
//               <input
//                 type="number"
//                 value={bonuses}
//                 onChange={(e) => setBonuses(Number(e.target.value))}
//                 className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                 min="0"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Deductions */}
//         <div className="space-y-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-gray-800">Deductions</h2>
//             <button
//               type="button"
//               onClick={addDeduction}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
//             >
//               <Plus size={18} />
//               Add Deduction
//             </button>
//           </div>

//           {deductions.map((ded, index) => (
//             <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">Deduction Name</label>
//                 <input
//                   type="text"
//                   value={ded.name}
//                   onChange={(e) => updateDeduction(index, 'name', e.target.value)}
//                   className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                   placeholder="e.g. Tax"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">Amount</label>
//                 <input
//                   type="number"
//                   value={ded.amount}
//                   onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
//                   className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                   min="0"
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={() => removeDeduction(index)}
//                 className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 self-end"
//               >
//                 <Trash2 size={18} />
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Net Salary */}
//         <div className="p-6 bg-indigo-50 rounded-2xl text-center">
//           <h2 className="text-xl font-semibold text-indigo-800 mb-2">Net Salary</h2>
//           <p className="text-4xl font-bold text-indigo-700">N{netSalary.toFixed(2)}</p>
//         </div>

//         {/* Actions */}
//         <div className="flex gap-4">
//           <button
//             type="button"
//             onClick={handleSave}
//             disabled={saving || !selectedMonth || !selectedEmployee}
//             className="flex-1 p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
//           >
//             <Save size={20} />
//             {saving ? 'Saving...' : 'Save Payroll'}
//           </button>
//         </div>
//       </div>

//       {/* Published Payrolls List */}
//       <div className="mt-12">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Payrolls</h2>
//         <div className="space-y-4">
//           {payrolls.map((pay) => (
//             <div key={pay._id} className="p-6 bg-white rounded-2xl shadow-md flex justify-between items-center">
//               <div>
//                 <p className="font-semibold">{pay.month} - {pay.employee.name}</p>
//                 <p className="text-sm text-gray-600">Net Salary: N{pay.netSalary}</p>
//               </div>
//               <button
//                 onClick={() => handlePublish(pay._id)}
//                 disabled={publishing || pay.published}
//                 className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
//               >
//                 {pay.published ? 'Published' : 'Publish'}
//               </button>
//             </div>
//           ))}
//           {payrolls.length === 0 && <p className="text-gray-500 text-center py-8">No payrolls saved yet</p>}
//         </div>
//       </div>
//     </div>
//   );
// };


// src/pages/accountant/AccountantDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Save, Trash2, AlertTriangle, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
);

export default function AccountantDashboard() {
  const [payrolls, setPayrolls] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salary, setSalary] = useState(0);
  const [bonuses, setBonuses] = useState(0);
  const [deductions, setDeductions] = useState([]);
  const [netSalary, setNetSalary] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null); // For edit mode

  // Charts data
  const [roleDistribution, setRoleDistribution] = useState(null);
  const [topEarners, setTopEarners] = useState(null);
  const [monthlyTotals, setMonthlyTotals] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/staff`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEmployees(res.data.staff || []);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payrolls`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPayrolls(res.data.payrolls || []);
      updateCharts(res.data.payrolls);
    } catch (err) {
      toast.error('Failed to load payrolls');
    }
  };

  const updateCharts = (payrollData) => {
    // 1. Pie Chart: Role distribution of total net salaries
    const roleTotals = {};
    payrollData.forEach((p) => {
      const role = p.employee.role;
      roleTotals[role] = (roleTotals[role] || 0) + p.netSalary;
    });

    setRoleDistribution({
      labels: Object.keys(roleTotals),
      datasets: [{
        label: 'Total Net Salary by Role',
        data: Object.values(roleTotals),
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        hoverOffset: 20,
      }],
    });

    // 2. Bar Chart: Top earners (highest to lowest) for current month
    const currentMonthData = payrollData.filter(p => p.month === selectedMonth);
    const sorted = currentMonthData
      .sort((a, b) => b.netSalary - a.netSalary)
      .slice(0, 10); // Top 10

    setTopEarners({
      labels: sorted.map(p => p.employee.name),
      datasets: [{
        label: 'Net Salary',
        data: sorted.map(p => p.netSalary),
        backgroundColor: '#4f46e5',
      }],
    });

    // 3. Line Chart: Total net salary per month
    const monthly = {};
    payrollData.forEach(p => {
      monthly[p.month] = (monthly[p.month] || 0) + p.netSalary;
    });

    const sortedMonths = Object.keys(monthly).sort();
    setMonthlyTotals({
      labels: sortedMonths,
      datasets: [{
        label: 'Total Monthly Payout',
        data: sortedMonths.map(m => monthly[m]),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
      }],
    });
  };

  const addDeduction = () => {
    setDeductions([...deductions, { name: '', amount: 0 }]);
  };

  const updateDeduction = (index, field, value) => {
    const updated = [...deductions];
    updated[index][field] = field === 'amount' ? Number(value) : value;
    setDeductions(updated);
  };

  const removeDeduction = (index) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const totalIncome = salary + bonuses;
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    setNetSalary(totalIncome - totalDeductions);
  }, [salary, bonuses, deductions]);

  const handleSave = async () => {
    if (!selectedMonth || !selectedEmployee) {
      toast.error('Select month and employee');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        month: selectedMonth,
        employeeId: selectedEmployee,
        salary,
        bonuses,
        deductions,
        netSalary,
      };

      if (editingPayroll) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/payrolls/${editingPayroll._id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Payroll updated');
        setEditingPayroll(null);
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/payrolls`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Payroll saved');
      }

      resetForm();
      fetchPayrolls();
    } catch (err) {
      toast.error('Failed to save payroll');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (payroll) => {
    setEditingPayroll(payroll);
    setSelectedMonth(payroll.month);
    setSelectedEmployee(payroll.employee._id);
    setSalary(payroll.salary);
    setBonuses(payroll.bonuses);
    setDeductions(payroll.deductions || []);
    setNetSalary(payroll.netSalary);
  };

  const handleDelete = async (payrollId) => {
    if (!window.confirm('Delete this payroll?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/payrolls/${payrollId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Payroll deleted');
      fetchPayrolls();
    } catch (err) {
      toast.error('Failed to delete payroll');
    }
  };

  const handlePublish = async (payrollId) => {
    setPublishing(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/payrolls/${payrollId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Payroll published');
      fetchPayrolls();
    } catch (err) {
      toast.error('Failed to publish payroll');
    } finally {
      setPublishing(false);
    }
  };

  const resetForm = () => {
    setEditingPayroll(null);
    setSelectedEmployee(null);
    setSalary(0);
    setBonuses(0);
    setDeductions([]);
    setNetSalary(0);
    setSelectedMonth('');
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Payroll Insights' },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">
          Accountant Dashboard - Payroll Management
        </h1>

        {/* Create / Edit Form */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editingPayroll ? 'Edit Payroll' : 'Create New Payroll'}
          </h2>

          {/* Month Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Month *</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Employee *</label>
            <select
              value={selectedEmployee || ''}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Choose Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          {/* Incomes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Incomes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Bonuses</label>
                <input
                  type="number"
                  value={bonuses}
                  onChange={(e) => setBonuses(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Deductions</h2>
              <button
                type="button"
                onClick={addDeduction}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Add Deduction
              </button>
            </div>

            {deductions.map((ded, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Deduction Name</label>
                  <input
                    type="text"
                    value={ded.name}
                    onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Tax"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    value={ded.amount}
                    onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDeduction(index)}
                  className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 self-end"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Net Salary */}
          <div className="p-6 bg-indigo-50 rounded-2xl text-center">
            <h2 className="text-xl font-semibold text-indigo-800 mb-2">Net Salary</h2>
            <p className="text-4xl font-bold text-indigo-700">₦{netSalary.toFixed(2)}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedMonth || !selectedEmployee}
              className="flex-1 p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : editingPayroll ? 'Update Payroll' : 'Save Payroll'}
            </button>

            {editingPayroll && (
              <button
                type="button"
                onClick={resetForm}
                className="p-4 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 flex items-center gap-2"
              >
                <X size={20} />
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart - Role Distribution */}
          {roleDistribution && (
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Net Salary by Role</h2>
              <div className="h-80">
                <Pie data={roleDistribution} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Bar Chart - Top Earners */}
          {topEarners && (
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Top Earners ({selectedMonth || 'All Time'})
              </h2>
              <div className="h-80">
                <Bar data={topEarners} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Line Chart - Monthly Totals */}
        {monthlyTotals && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Total Monthly Payroll Payout
            </h2>
            <div className="h-96">
              <Line data={monthlyTotals} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Payroll List */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Payrolls</h2>
          <div className="space-y-6">
            {payrolls.map((pay) => (
              <div
                key={pay._id}
                className="p-6 bg-gray-50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2">
                  <p className="font-semibold text-lg">
                    {pay.month} - {pay.employee.name} ({pay.employee.role})
                  </p>
                  <p className="text-sm text-gray-600">
                    Net Salary: ₦{pay.netSalary.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(pay.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(pay)}
                    className="p-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 flex items-center gap-2"
                  >
                    <Edit size={18} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(pay._id)}
                    className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>

                  <button
                    onClick={() => handlePublish(pay._id)}
                    disabled={publishing || pay.published}
                    className={`p-3 rounded-xl text-white flex items-center gap-2 ${
                      pay.published
                        ? 'bg-green-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {pay.published ? 'Published' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}

            {payrolls.length === 0 && (
              <p className="text-gray-500 text-center py-12">No payrolls created yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}