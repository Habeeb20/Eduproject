// // src/pages/student/StudentReportCard.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Loader2, Download } from 'lucide-react';
// import { toast } from 'sonner';
// import { Pie, Doughnut } from 'react-chartjs-2';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { FileText, Printer } from 'lucide-react';

// export default function StudentReportCard() {
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [term, setTerm] = useState('First');

//   useEffect(() => {
//     fetchReport();
//   }, [term]);

//   const fetchReport = async () => {
//     setLoading(true);
//     try {
//     const res = await axios.get(
//   `${import.meta.env.VITE_BACKEND_URL}/computed-score/report/my`,
//   { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
// );

// setReport(res.data.report);
//     } catch (err) {
//         console.log(err)
//       toast.error('Failed to load report card');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getChartData = () => {
//     if (!report) return null;
//     const labels = report.marks.map(m => m.subject);
//     const data = report.marks.map(m => m.marks.total);

//     return {
//       labels,
//       datasets: [{
//         data,
//         backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'],
//       }],
//     };
//   };

//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(20);
//     doc.text(`Report Card - ${report.student.name}`, 20, 20);

//     // Add table
//     doc.autoTable({
//       startY: 30,
//       head: [['Subject', '1st Test', '2nd Test', '3rd Test', 'Mid Term', 'Exam', 'Total', 'Position']],
//       body: report.marks.map(m => [
//         m.subject,
//         m.marks.firstTest,
//         m.marks.secondTest,
//         m.marks.thirdTest,
//         m.marks.midTerm,
//         m.marks.examination,
//         m.marks.total,
//         m.marks.position,
//       ]),
//     });

//     // Add overall position
//     doc.setFontSize(14);
//     doc.text(`Overall Position: ${report.overallPosition}`, 20, doc.lastAutoTable.finalY + 20);

//     doc.save(`${report.student.name}_report_${term}.pdf`);
//   };

//   const downloadCSV = () => {
//     if (!report) return;
//     const headers = 'Subject,1st Test,2nd Test,3rd Test,Mid Term,Exam,Total,Position\n';
//     const rows = report.marks.map(m => 
//       `${m.subject},${m.marks.firstTest},${m.marks.secondTest},${m.marks.thirdTest},${m.marks.midTerm},${m.marks.examination},${m.marks.total},${m.marks.position}`
//     ).join('\n');
//     const csv = headers + rows;
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${report.student.name}_report_${term}.csv`;
//     link.click();
//   };

//   if (loading) return <Loader2 className="animate-spin" size={48} />;

//   if (!report) return <div className="text-center text-gray-600">No report card available for this term.</div>;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 md:p-10">
//       <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12">
//         <div className="text-center mb-10">
//           <h1 className="text-4xl font-bold text-indigo-700">Report Card</h1>
//           <p className="text-lg text-gray-600 mt-2">
//             {report.student.name} • {report.student.className} • {term} Term
//           </p>
//         </div>

//         {/* Format Selection (only if teacher, but hidden for student) */}
//         {/* <div className="mb-8">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Report Format</label>
//           <select className="w-full p-3 border rounded-lg">
//             <option>Modern (Charts)</option>
//             <option>Classic</option>
//             <option>Minimal</option>
//           </select>
//         </div> */}

//         {/* Scores Table */}
//         <div className="overflow-x-auto mb-10">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-indigo-600 text-white">
//                 <th className="p-4 text-left">Subject</th>
//                 <th className="p-4">1st Test</th>
//                 <th className="p-4">2nd Test</th>
//                 <th className="p-4">3rd Test</th>
//                 <th className="p-4">Mid Term</th>
//                 <th className="p-4">Examination</th>
//                 <th className="p-4">Total</th>
//                 <th className="p-4">Position</th>
//               </tr>
//             </thead>
//             <tbody>
//               {report.marks.map((m, i) => (
//                 <tr key={i} className="border-b hover:bg-gray-50">
//                   <td className="p-4 font-medium">{m.subject}</td>
//                   <td className="p-4 text-center">{m.marks.firstTest}</td>
//                   <td className="p-4 text-center">{m.marks.secondTest}</td>
//                   <td className="p-4 text-center">{m.marks.thirdTest}</td>
//                   <td className="p-4 text-center">{m.marks.midTerm}</td>
//                   <td className="p-4 text-center">{m.marks.examination}</td>
//                   <td className="p-4 text-center font-bold">{m.marks.total}</td>
//                   <td className="p-4 text-center">{m.marks.position}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
//           <div className="bg-white p-6 rounded-2xl shadow-lg">
//             <h3 className="text-lg font-bold text-center mb-4">Subject Performance</h3>
//             <Pie data={getChartData()} options={{ responsive: true }} />
//           </div>

//           <div className="bg-white p-6 rounded-2xl shadow-lg">
//             <h3 className="text-lg font-bold text-center mb-4">Overall Grade Distribution</h3>
//             <Doughnut data={getChartData()} options={{ responsive: true }} />
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <button
//             onClick={downloadPDF}
//             className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
//           >
//             <Download size={20} />
//             Download PDF
//           </button>

//           <button
//             onClick={downloadCSV}
//             className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-md"
//           >
//             <FileText size={20} />
//             Export CSV
//           </button>

//           <button
//             onClick={() => window.print()}
//             className="px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition flex items-center justify-center gap-2 shadow-md"
//           >
//             <Printer size={20} />
//             Print
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




// src/pages/student/StudentReportCard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Loader2, Download, Printer, FileText, Filter, X, BarChart2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
} from 'chart.js';
import { Pie, Doughnut, Bar, Line, Radar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale
);

export default function StudentReportCard() {
  const [report, setReport] = useState(null);
  const [filteredReport, setFilteredReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('First Term 2025');
  const [year, setYear] = useState('2025');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    fetchReport();
  }, [term, year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/computed-score/report/my?term=${encodeURIComponent(term)}&year=${year}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = res.data.report;
      setReport(data);
      applyFilters(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your report card');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    if (!data) return;

    let filteredMarks = data.marks || [];

    if (subject) {
      filteredMarks = filteredMarks.filter(m => m.subject === subject);
    }

    setFilteredReport({
      ...data,
      marks: filteredMarks,
    });
  };

  useEffect(() => {
    if (report) applyFilters(report);
  }, [subject, report]);

  const getChartData = () => {
    if (!filteredReport?.marks?.length) return { labels: [], datasets: [] };

    const labels = filteredReport.marks.map(m => m.subject);
    const totals = filteredReport.marks.map(m => m.marks.total);

    return {
      labels,
      datasets: [{
        label: 'Total Score',
        data: totals,
        backgroundColor: [
          '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
          '#f59e0b', '#10b981', '#3b82f6', '#ef4444'
        ],
      }],
    };
  };

  const getTestBarData = () => {
    if (!filteredReport?.marks?.length) return { labels: [], datasets: [] };

    const labels = filteredReport.marks.map(m => m.subject);
    return {
      labels,
      datasets: [
        { label: '1st Test', data: filteredReport.marks.map(m => m.marks.firstTest), backgroundColor: '#6366f1' },
        { label: '2nd Test', data: filteredReport.marks.map(m => m.marks.secondTest), backgroundColor: '#8b5cf6' },
        { label: '3rd Test', data: filteredReport.marks.map(m => m.marks.thirdTest), backgroundColor: '#ec4899' },
        { label: 'Mid Term', data: filteredReport.marks.map(m => m.marks.midTerm), backgroundColor: '#f59e0b' },
        { label: 'Exam', data: filteredReport.marks.map(m => m.marks.examination), backgroundColor: '#10b981' },
      ],
    };
  };

  const getProgressionData = () => {
    if (!filteredReport?.marks?.length) return { labels: [], datasets: [] };

    const labels = ['1st Test', '2nd Test', '3rd Test', 'Mid Term', 'Exam'];
    const datasets = filteredReport.marks.map(m => ({
      label: m.subject,
      data: [
        m.marks.firstTest,
        m.marks.secondTest,
        m.marks.thirdTest,
        m.marks.midTerm,
        m.marks.examination,
      ],
      borderColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'][Math.floor(Math.random() * 5)],
      tension: 0.4,
      fill: false,
    }));

    return { labels, datasets };
  };

  const getRadarData = () => {
    if (!filteredReport?.marks?.length) return { labels: [], datasets: [] };

    return {
      labels: filteredReport.marks.map(m => m.subject),
      datasets: [{
        label: 'Performance',
        data: filteredReport.marks.map(m => m.marks.total),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
      }],
    };
  };

//   const downloadPDF = () => {
//     if (!filteredReport) return toast.error('No report data');

//     const doc = new jsPDF();
//     doc.setFontSize(22);
//     doc.setTextColor(79, 70, 229);
//     doc.text('Report Card', 105, 20, null, null, 'center');

//     doc.setFontSize(14);
//     doc.setTextColor(0);
//     doc.text(`Student: ${filteredReport.student?.name || 'Student'}`, 20, 35);
//     doc.text(`Class: ${filteredReport.student?.className || 'N/A'}`, 20, 45);
//     doc.text(`Term: ${term}`, 20, 55);

//     doc.autoTable({
//       startY: 65,
//       head: [['Subject', '1st Test', '2nd Test', '3rd Test', 'Mid Term', 'Exam', 'Total', 'Position']],
//       body: filteredReport.marks.map(m => [
//         m.subject,
//         m.marks.firstTest,
//         m.marks.secondTest,
//         m.marks.thirdTest,
//         m.marks.midTerm,
//         m.marks.examination,
//         m.marks.total,
//         m.marks.position || 'N/A',
//       ]),
//       theme: 'grid',
//       headStyles: { fillColor: [79, 70, 229], textColor: 255 },
//       styles: { fontSize: 10, cellPadding: 4 },
//     });

//     doc.setFontSize(12);
//     doc.text(`Overall Position: ${filteredReport.overallPosition || 'N/A'}`, 20, doc.lastAutoTable.finalY + 20);

//     doc.save(`${filteredReport.student?.name || 'student'}_report_${term}.pdf`);
//   };
const downloadPDF = () => {
  if (!report || !filteredReport?.marks?.length) {
    toast.error('No report data available to download');
    return;
  }

  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text('Report Card', 105, 20, null, null, 'center');

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Student: ${report.student?.name || 'Student'}`, 20, 35);
  doc.text(`Class: ${report.student?.className || 'N/A'}`, 20, 45);
  doc.text(`Term: ${term}`, 20, 55);

  // Table
  if (typeof doc.autoTable !== 'function') {
    console.error('autoTable is not available - check jspdf-autotable import');
    toast.error('PDF generation failed - library not loaded');
    return;
  }

  doc.autoTable({
    startY: 65,
    head: [['Subject', '1st Test', '2nd Test', '3rd Test', 'Mid Term', 'Exam', 'Total', 'Position']],
    body: filteredReport.marks.map(m => [
      m.subject,
      m.marks.firstTest ?? 0,
      m.marks.secondTest ?? 0,
      m.marks.thirdTest ?? 0,
      m.marks.midTerm ?? 0,
      m.marks.examination ?? 0,
      m.marks.total ?? 0,
      m.marks.position ?? 'N/A',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: [243, 244, 246] },
  });

  // Footer / Summary
  doc.setFontSize(12);
  doc.text(`Overall Position: ${filteredReport.overallPosition || 'N/A'}`, 20, doc.lastAutoTable.finalY + 20);

  doc.save(`${report.student?.name || 'student'}_report_${term.replace(/\s+/g, '_')}.pdf`);
};
  const downloadCSV = () => {
    if (!filteredReport) return;

    const headers = 'Subject,1st Test,2nd Test,3rd Test,Mid Term,Exam,Total,Position\n';
    const rows = filteredReport.marks.map(m =>
      `${m.subject},${m.marks.firstTest},${m.marks.secondTest},${m.marks.thirdTest},${m.marks.midTerm},${m.marks.examination},${m.marks.total},${m.marks.position || 'N/A'}`
    ).join('\n');

    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filteredReport.student?.name || 'student'}_report_${term}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={64} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl">
        No report card available for the selected filters.
      </div>
    );
  }

  const filteredMarks = report.marks || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Elegant Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-8 md:p-12 text-white text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">Report Card</h1>
          <div className="text-xl md:text-2xl opacity-90">
            {report.student?.name || 'Student Name'} • {report.student?.className || 'Class'} • {term}
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 md:p-8 border-b bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="First Term 2025">First Term 2025</option>
                <option value="Second Term 2025">Second Term 2025</option>
                <option value="Third Term 2025">Third Term 2025</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Filter</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="">All Subjects</option>
                {report.marks?.map(m => m.subject)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scores Breakdown - Beautiful Cards */}
        <div className="p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <FileText className="text-indigo-600" size={32} />
            Scores Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarks.map((m, i) => (
              <motion.div
                key={m._id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-indigo-700 mb-4">{m.subject}</h3>
                <div className="space-y-3 text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600">1st Test</span>
                    <span className="font-semibold">{m.marks.firstTest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">2nd Test</span>
                    <span className="font-semibold">{m.marks.secondTest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">3rd Test</span>
                    <span className="font-semibold">{m.marks.thirdTest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mid Term</span>
                    <span className="font-semibold">{m.marks.midTerm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Examination</span>
                    <span className="font-semibold">{m.marks.examination}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span className="text-indigo-700">{m.marks.total}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>Position</span>
                    <span>{m.marks.position || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="p-6 md:p-8 bg-gray-50">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <BarChart2 className="text-purple-600" size={32} />
            Performance Analytics
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie - Overall */}
            <div className="bg-white p-6 rounded-2xl shadow-lg h-96">
              <h3 className="text-xl font-bold text-center mb-6">Subject Performance</h3>
              <Pie data={getChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>

            {/* Doughnut - Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-lg h-96">
              <h3 className="text-xl font-bold text-center mb-6">Grade Distribution</h3>
              <Doughnut data={getChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>

            {/* Bar - Test Comparison */}
            <div className="bg-white p-6 rounded-2xl shadow-lg h-96 lg:col-span-2">
              <h3 className="text-xl font-bold text-center mb-6">Test Scores Comparison</h3>
              <Bar data={getTestBarData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>

            {/* Line - Progression */}
            <div className="bg-white p-6 rounded-2xl shadow-lg h-96">
              <h3 className="text-xl font-bold text-center mb-6">Assessment Progression</h3>
              <Line data={getProgressionData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>

            {/* Radar - Strengths */}
            <div className="bg-white p-6 rounded-2xl shadow-lg h-96">
              <h3 className="text-xl font-bold text-center mb-6">Subject Strengths</h3>
              <Radar data={getRadarData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-4 justify-center border-t">
          <button
            onClick={downloadPDF}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Download size={20} />
            Download PDF
          </button>

          <button
            onClick={downloadCSV}
            className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <FileText size={20} />
            Export CSV
          </button>

          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Printer size={20} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}