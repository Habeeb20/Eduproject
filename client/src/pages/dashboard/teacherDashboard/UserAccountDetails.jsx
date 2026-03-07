

// // src/pages/UserDashboard.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Loader2, AlertTriangle } from 'lucide-react';
// import { toast } from 'sonner';
// import { Line, Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// export default function UserDashboard() {
//   const [payrolls, setPayrolls] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or specific month

//   // Chart data
//   const [salaryTrend, setSalaryTrend] = useState(null);
//   const [topDeductions, setTopDeductions] = useState(null);

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
//       updateCharts(res.data.payrolls);
//     } catch (err) {
//       toast.error('Failed to load your payrolls');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateCharts = (data) => {
//     // 1. Line Chart: Net Salary Trend over Months
//     const sortedByMonth = data.sort((a, b) => new Date(a.month) - new Date(b.month));
//     const months = sortedByMonth.map(p => p.month);
//     const netSalaries = sortedByMonth.map(p => p.netSalary);

//     setSalaryTrend({
//       labels: months,
//       datasets: [{
//         label: 'Net Salary (₦)',
//         data: netSalaries,
//         borderColor: '#4f46e5',
//         backgroundColor: 'rgba(79, 70, 229, 0.2)',
//         tension: 0.4,
//         fill: true,
//         pointBackgroundColor: '#4f46e5',
//         pointBorderColor: '#fff',
//         pointHoverRadius: 8,
//       }],
//     });

//     // 2. Bar Chart: Top Deductions (highest to lowest)
//     const deductionMap = {};
//     data.forEach(p => {
//       p.deductions.forEach(d => {
//         deductionMap[d.name] = (deductionMap[d.name] || 0) + d.amount;
//       });
//     });

//     const sortedDeductions = Object.entries(deductionMap)
//       .sort(([, a], [, b]) => b - a)
//       .slice(0, 8); // Top 8

//     setTopDeductions({
//       labels: sortedDeductions.map(([name]) => name),
//       datasets: [{
//         label: 'Total Deduction Amount (₦)',
//         data: sortedDeductions.map(([, amount]) => amount),
//         backgroundColor: [
//           '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#6366f1'
//         ],
//         borderColor: '#fff',
//         borderWidth: 1,
//       }],
//     });
//   };

//   // Filtered payrolls based on selected month
//   const filteredPayrolls = selectedMonth === 'all'
//     ? payrolls
//     : payrolls.filter(p => p.month === selectedMonth);

//   const availableMonths = ['all', ...new Set(payrolls.map(p => p.month))].sort().reverse();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-6xl mx-auto space-y-12">
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">
//           My Payroll
//         </h1>

//         {/* Month Filter */}
//         <div className="bg-white rounded-2xl shadow-md p-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Filter by Month
//           </label>
//           <select
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(e.target.value)}
//             className="w-full md:w-64 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//           >
//             {availableMonths.map((month) => (
//               <option key={month} value={month}>
//                 {month === 'all' ? 'All Months' : month}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Line Chart - Salary Trend */}
//           {salaryTrend && (
//             <div className="bg-white rounded-3xl shadow-xl p-6">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                 Net Salary Trend Over Time
//               </h2>
//               <div className="h-80">
//                 <Line
//                   data={salaryTrend}
//                   options={{
//                     responsive: true,
//                     plugins: {
//                       legend: { position: 'top' },
//                       title: { display: true, text: 'Your Salary History' },
//                     },
//                     scales: {
//                       y: { beginAtZero: true },
//                     },
//                   }}
//                 />
//               </div>
//             </div>
//           )}

//           {/* Bar Chart - Top Deductions */}
//           {topDeductions && (
//             <div className="bg-white rounded-3xl shadow-xl p-6">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                 Top Deductions (Highest to Lowest)
//               </h2>
//               <div className="h-80">
//                 <Bar
//                   data={topDeductions}
//                   options={{
//                     responsive: true,
//                     plugins: {
//                       legend: { position: 'top' },
//                       title: { display: true, text: 'Deduction Breakdown' },
//                     },
//                     scales: {
//                       y: { beginAtZero: true },
//                     },
//                   }}
//                 />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Payroll Details */}
//         {payrolls.length === 0 ? (
//           <div className="text-center p-12 bg-indigo-50 rounded-2xl">
//             <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
//             <p className="text-xl font-semibold text-gray-800 mb-2">No Payroll Yet</p>
//             <p className="text-gray-600">The accountant has not published any payroll for you.</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {filteredPayrolls.map((pay) => (
//               <div key={pay._id} className="p-6 bg-indigo-50 rounded-2xl space-y-4">
//                 <h2 className="text-xl font-semibold text-indigo-800">{pay.month}</h2>
//                 <p className="text-gray-700"><strong>Salary:</strong> ₦{pay.salary.toLocaleString()}</p>
//                 <p className="text-gray-700"><strong>Bonuses:</strong> ₦{pay.bonuses.toLocaleString()}</p>
//                 <div>
//                   <p className="font-medium text-gray-800 mb-2">Deductions:</p>
//                   {pay.deductions.map((ded, index) => (
//                     <p key={index} className="text-gray-600 text-sm">
//                       {ded.name}: -₦{ded.amount.toLocaleString()}
//                     </p>
//                   ))}
//                 </div>
//                 <p className="text-2xl font-bold text-green-700 mt-4">
//                   Net Salary: ₦{pay.netSalary.toLocaleString()}
//                 </p>
//               </div>
//             ))}
//             {filteredPayrolls.length === 0 && selectedMonth !== 'all' && (
//               <p className="text-center text-gray-600 py-8">
//                 No payroll published for {selectedMonth}
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };












// src/pages/MyPayrollDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { Line, Bar } from 'react-chartjs-2';
import html2pdf from 'html2pdf.js';

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

export default function MyPayrollDashboard() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [salaryTrend, setSalaryTrend] = useState(null);
  const [deductionBreakdown, setDeductionBreakdown] = useState(null);
  const [bonusTrend, setBonusTrend] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchMyPayrolls();
  }, []);

  const fetchMyPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payrolls/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = res.data.payrolls || [];
      setPayrolls(data);
      updateCharts(data);
    } catch (err) {
      toast.error('Failed to load your payrolls');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCharts = (data) => {
    if (!data.length) return;

    // Sort by month (assuming month is in 'YYYY-MM' format)
    const sorted = [...data].sort((a, b) => new Date(a.month) - new Date(b.month));

    const months = sorted.map(p => new Date(p.month).toLocaleString('default', { month: 'short', year: 'numeric' }));
    const netSalaries = sorted.map(p => p.netSalary);
    const bonuses = sorted.map(p => p.bonuses || 0);

    // Salary Trend (Line Chart)
    setSalaryTrend({
      labels: months,
      datasets: [
        {
          label: 'Net Salary (₦)',
          data: netSalaries,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#4f46e5',
          pointHoverRadius: 6,
          pointRadius: 4,
        },
      ],
    });

    // Bonus Trend (Line Chart)
    setBonusTrend({
      labels: months,
      datasets: [
        {
          label: 'Bonuses (₦)',
          data: bonuses,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#10b981',
          pointHoverRadius: 6,
          pointRadius: 4,
        },
      ],
    });

    // Deduction Breakdown (Bar Chart)
    const deductionMap = {};
    data.forEach(p => {
      p.deductions?.forEach(d => {
        deductionMap[d.name] = (deductionMap[d.name] || 0) + d.amount;
      });
    });

    const sortedDeductions = Object.entries(deductionMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    setDeductionBreakdown({
      labels: sortedDeductions.map(([name]) => name),
      datasets: [{
        label: 'Total Deduction (₦)',
        data: sortedDeductions.map(([, amount]) => amount),
        backgroundColor: [
          '#ef4444', '#f97316', '#f59e0b', '#eab308',
          '#84cc16', '#22c55e', '#10b981', '#06b6d4'
        ],
        borderRadius: 6,
      }],
    });
  };

  const filteredPayrolls = selectedMonth === 'all'
    ? payrolls
    : payrolls.filter(p => p.month === selectedMonth);

  const availableMonths = ['all', ...new Set(payrolls.map(p => p.month))].sort().reverse();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 13 } } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 12 } } },
      x: { ticks: { font: { size: 12 } } },
    },
  };

  const handleDownloadPDF = () => {
    if (!contentRef.current) {
      toast.error('Dashboard content not ready');
      return;
    }

    const element = contentRef.current;
    const opt = {
      margin: [0.4, 0.4, 0.4, 0.4],
      filename: `My_Payroll_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
    toast.success('Payroll dashboard downloaded as PDF');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-8">
      <div ref={contentRef} className="max-w-7xl mx-auto space-y-10 print:space-y-6">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            My Payroll Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            View your salary, bonuses, and deductions history
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 text-indigo-700">
              <Filter size={20} />
              <span className="font-medium">Filter by Month</span>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-64 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white shadow-sm"
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month === 'all' ? 'All Months' : new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {salaryTrend && (
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                Net Salary Trend
              </h2>
              <div className="h-72 md:h-80">
                <Line data={salaryTrend} options={chartOptions} />
              </div>
            </div>
          )}

          {bonusTrend && (
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Bonus Trend
              </h2>
              <div className="h-72 md:h-80">
                <Line data={bonusTrend} options={chartOptions} />
              </div>
            </div>
          )}

          {deductionBreakdown && (
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingDown size={20} className="text-red-600" />
                Top Deductions
              </h2>
              <div className="h-80 md:h-96">
                <Bar data={deductionBreakdown} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Payroll Receipts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar size={24} className="text-indigo-600" />
            Payroll History
          </h2>

          {filteredPayrolls.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-10 text-center border border-gray-100">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {selectedMonth === 'all' ? 'No Payroll Records Yet' : `No Payroll for ${selectedMonth}`}
              </h3>
              <p className="text-gray-600">
                Your payroll has not been published yet. Please check back later or contact HR.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPayrolls.map((pay) => (
                <motion.div
                  key={pay._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Receipt Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {new Date(pay.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <p className="text-sm opacity-90 mt-1">Payroll Receipt</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-90">Net Pay</p>
                        <p className="text-xl font-bold">
                          ₦{pay.netSalary.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Body */}
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Gross Salary</p>
                        <p className="text-base font-semibold text-gray-900">
                          ₦{pay.salary.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Bonuses</p>
                        <p className="text-base font-semibold text-green-600">
                          +₦{pay.bonuses?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TrendingDown size={18} className="text-red-600" />
                        Deductions
                      </h4>
                      <div className="space-y-2 text-sm">
                        {pay.deductions?.length > 0 ? (
                          pay.deductions.map((ded, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-700">{ded.name}</span>
                              <span className="text-red-600 font-medium">
                                -₦{ded.amount.toLocaleString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm italic">No deductions this month</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-5 border-t-2 border-indigo-100 mt-5">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-gray-900">Net Salary</span>
                        <span className="text-indigo-700 text-xl">
                          ₦{pay.netSalary.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-indigo-50/50 p-3 text-center text-xs text-gray-600 border-t">
                    Generated on {new Date().toLocaleDateString()} • Lagos International School
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <button
            onClick={handleDownloadPDF}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition flex items-center justify-center gap-2 shadow-md font-medium"
          >
            <Download size={18} />
            Download PDF
          </button>

          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-md font-medium"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}