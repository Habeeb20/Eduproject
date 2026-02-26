// // src/pages/UserDashboard.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Loader2, AlertTriangle } from 'lucide-react';
// import { toast } from 'sonner';

// export default function UserDashboard() {
//   const [payrolls, setPayrolls] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchMyPayrolls();
//   }, []);

//   const fetchMyPayrolls = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payrolls/my`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setPayrolls(res.data.payrolls || []);
//     } catch (err) {
//       toast.error('Failed to load your payrolls');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-10">
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">
//           My Payroll
//         </h1>

//         {payrolls.length === 0 ? (
//           <div className="text-center p-12 bg-indigo-50 rounded-2xl">
//             <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
//             <p className="text-xl font-semibold text-gray-800 mb-2">No Payroll Yet</p>
//             <p className="text-gray-600">The accountant has not published any payroll for you.</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {payrolls.map((pay) => (
//               <div key={pay._id} className="p-6 bg-indigo-50 rounded-2xl space-y-4">
//                 <h2 className="text-xl font-semibold text-indigo-800">{pay.month}</h2>
//                 <p className="text-gray-700"><strong>Salary:</strong> N{pay.salary}</p>
//                 <p className="text-gray-700"><strong>Bonuses:</strong> N{pay.bonuses}</p>
//                 <div>
//                   <p className="font-medium text-gray-800 mb-2">Deductions:</p>
//                   {pay.deductions.map((ded, index) => (
//                     <p key={index} className="text-gray-600 text-sm">
//                       {ded.name}: -${ded.amount}
//                     </p>
//                   ))}
//                 </div>
//                 <p className="text-2xl font-bold text-green-700 mt-4">Net Salary: N{pay.netSalary}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };



// src/pages/UserDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function UserDashboard() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or specific month

  // Chart data
  const [salaryTrend, setSalaryTrend] = useState(null);
  const [topDeductions, setTopDeductions] = useState(null);

  useEffect(() => {
    fetchMyPayrolls();
  }, []);

  const fetchMyPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payrolls/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPayrolls(res.data.payrolls || []);
      updateCharts(res.data.payrolls);
    } catch (err) {
      toast.error('Failed to load your payrolls');
    } finally {
      setLoading(false);
    }
  };

  const updateCharts = (data) => {
    // 1. Line Chart: Net Salary Trend over Months
    const sortedByMonth = data.sort((a, b) => new Date(a.month) - new Date(b.month));
    const months = sortedByMonth.map(p => p.month);
    const netSalaries = sortedByMonth.map(p => p.netSalary);

    setSalaryTrend({
      labels: months,
      datasets: [{
        label: 'Net Salary (₦)',
        data: netSalaries,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      }],
    });

    // 2. Bar Chart: Top Deductions (highest to lowest)
    const deductionMap = {};
    data.forEach(p => {
      p.deductions.forEach(d => {
        deductionMap[d.name] = (deductionMap[d.name] || 0) + d.amount;
      });
    });

    const sortedDeductions = Object.entries(deductionMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8); // Top 8

    setTopDeductions({
      labels: sortedDeductions.map(([name]) => name),
      datasets: [{
        label: 'Total Deduction Amount (₦)',
        data: sortedDeductions.map(([, amount]) => amount),
        backgroundColor: [
          '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#6366f1'
        ],
        borderColor: '#fff',
        borderWidth: 1,
      }],
    });
  };

  // Filtered payrolls based on selected month
  const filteredPayrolls = selectedMonth === 'all'
    ? payrolls
    : payrolls.filter(p => p.month === selectedMonth);

  const availableMonths = ['all', ...new Set(payrolls.map(p => p.month))].sort().reverse();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">
          My Payroll
        </h1>

        {/* Month Filter */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full md:w-64 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month === 'all' ? 'All Months' : month}
              </option>
            ))}
          </select>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart - Salary Trend */}
          {salaryTrend && (
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Net Salary Trend Over Time
              </h2>
              <div className="h-80">
                <Line
                  data={salaryTrend}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Your Salary History' },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Bar Chart - Top Deductions */}
          {topDeductions && (
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Top Deductions (Highest to Lowest)
              </h2>
              <div className="h-80">
                <Bar
                  data={topDeductions}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Deduction Breakdown' },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Payroll Details */}
        {payrolls.length === 0 ? (
          <div className="text-center p-12 bg-indigo-50 rounded-2xl">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
            <p className="text-xl font-semibold text-gray-800 mb-2">No Payroll Yet</p>
            <p className="text-gray-600">The accountant has not published any payroll for you.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPayrolls.map((pay) => (
              <div key={pay._id} className="p-6 bg-indigo-50 rounded-2xl space-y-4">
                <h2 className="text-xl font-semibold text-indigo-800">{pay.month}</h2>
                <p className="text-gray-700"><strong>Salary:</strong> ₦{pay.salary.toLocaleString()}</p>
                <p className="text-gray-700"><strong>Bonuses:</strong> ₦{pay.bonuses.toLocaleString()}</p>
                <div>
                  <p className="font-medium text-gray-800 mb-2">Deductions:</p>
                  {pay.deductions.map((ded, index) => (
                    <p key={index} className="text-gray-600 text-sm">
                      {ded.name}: -₦{ded.amount.toLocaleString()}
                    </p>
                  ))}
                </div>
                <p className="text-2xl font-bold text-green-700 mt-4">
                  Net Salary: ₦{pay.netSalary.toLocaleString()}
                </p>
              </div>
            ))}
            {filteredPayrolls.length === 0 && selectedMonth !== 'all' && (
              <p className="text-center text-gray-600 py-8">
                No payroll published for {selectedMonth}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};