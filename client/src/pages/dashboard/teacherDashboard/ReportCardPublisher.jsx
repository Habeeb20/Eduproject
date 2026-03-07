// src/pages/teacher/ReportCardPublisher.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Eye, Download, Printer, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const REPORT_FORMATS = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional table-based layout with clean lines.',
    colors: { primary: '#1f2937', secondary: '#f3f4f6', accent: '#4b5563' },
    previewStructure: 'Table with borders, header row, and totals.',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Card-based with charts and modern typography.',
    colors: { primary: '#4f46e5', secondary: '#eef2ff', accent: '#6366f1' },
    previewStructure: 'Cards for each subject, pie chart for overall performance.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, whitespace-focused design for easy reading.',
    colors: { primary: '#111827', secondary: '#ffffff', accent: '#374151' },
    previewStructure: 'Simple list with bold subjects and scores, no borders.',
  },
];

export default function ReportCardPublisher() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [term, setTerm] = useState('First Term 2025');
  const [studentMarks, setStudentMarks] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('modern');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setClasses(res.data.classes || []);
      } catch (err) {
        toast.error('Failed to load classes');
      }
    };
    fetchClasses();
  }, []);

  // Fetch students when class changes
  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/students?className=${selectedClass}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStudents(res.data.students || []);
      } catch (err) {
        console.log(err)
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // Fetch marks when student/term changes
  useEffect(() => {
    if (!selectedStudent || !term) return;
    const fetchMarks = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/marks/student/${selectedStudent}?term=${term}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStudentMarks(res.data.marks || []);
      } catch (err) {
        toast.error('Failed to load student marks');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [selectedStudent, term]);

  const handlePublish = async () => {
    if (!selectedStudent || !term || !studentMarks.length) {
      toast.error('Please select student, term, and ensure scores are loaded');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/computed-score/report/publish`,
        {
          studentId: selectedStudent,
          term,
          format: selectedFormat,
          marks: studentMarks,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Report card published successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!studentMarks.length) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Report Card', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text(`Student: ${students.find(s => s._id === selectedStudent)?.name || 'Student'}`, 20, 40);
    doc.text(`Class: ${selectedClass}`, 20, 50);
    doc.text(`Term: ${term}`, 20, 60);

    const tableData = studentMarks.map(m => [
      m.subject,
      m.marks.firstTest,
      m.marks.secondTest,
      m.marks.thirdTest,
      m.marks.midTerm,
      m.marks.examination,
      m.marks.total,
      m.marks.position,
    ]);

    doc.autoTable({
      head: [['Subject', '1st Test', '2nd Test', '3rd Test', 'Mid Term', 'Exam', 'Total', 'Position']],
      body: tableData,
      startY: 70,
      theme: selectedFormat === 'minimal' ? 'plain' : 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: selectedFormat === 'modern' ? [99, 102, 241] : [55, 65, 81] },
    });

    doc.save(`report_${selectedStudent}_${term}.pdf`);
  };

  const getChartData = () => {
    return {
      labels: studentMarks.map(m => m.subject),
      datasets: [{
        data: studentMarks.map(m => m.marks.total),
        backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'],
      }],
    };
  };

  const renderPreview = () => {
    if (!previewOpen) return null;

    const format = REPORT_FORMATS.find(f => f.id === selectedFormat);
    const studentName = students.find(s => s._id === selectedStudent)?.name || 'Student Name';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-8" style={{ background: format.colors.secondary }}>
          <button onClick={() => setPreviewOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full">
            <X size={24} />
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: format.colors.primary }}>
            Preview: {format.name} Report Card
          </h2>

          <p className="text-center mb-8 text-lg" style={{ color: format.colors.accent }}>
            {studentName} - {selectedClass} - {term}
          </p>

          {/* Format-specific rendering */}
          {selectedFormat === 'classic' && (
            <table className="w-full border-collapse mb-8">
              <thead>
                <tr style={{ background: format.colors.primary, color: 'white' }}>
                  <th className="p-3 border">Subject</th>
                  <th className="p-3 border">1st Test</th>
                  <th className="p-3 border">2nd Test</th>
                  <th className="p-3 border">3rd Test</th>
                  <th className="p-3 border">Mid Term</th>
                  <th className="p-3 border">Exam</th>
                  <th className="p-3 border">Total</th>
                  <th className="p-3 border">Position</th>
                </tr>
              </thead>
              <tbody>
                {studentMarks.map((m, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">{m.subject}</td>
                    <td className="p-3 text-center">{m.marks.firstTest}</td>
                    <td className="p-3 text-center">{m.marks.secondTest}</td>
                    <td className="p-3 text-center">{m.marks.thirdTest}</td>
                    <td className="p-3 text-center">{m.marks.midTerm}</td>
                    <td className="p-3 text-center">{m.marks.examination}</td>
                    <td className="p-3 text-center font-bold">{m.marks.total}</td>
                    <td className="p-3 text-center">{m.marks.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedFormat === 'modern' && (
            <div className="space-y-6 mb-8">
              {studentMarks.map((m, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl shadow-md" style={{ borderLeft: `4px solid ${format.colors.accent}` }}>
                  <h3 className="text-xl font-bold" style={{ color: format.colors.primary }}>{m.subject}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">1st Test</p>
                      <p className="font-bold">{m.marks.firstTest}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">2nd Test</p>
                      <p className="font-bold">{m.marks.secondTest}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">3rd Test</p>
                      <p className="font-bold">{m.marks.thirdTest}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Mid Term</p>
                      <p className="font-bold">{m.marks.midTerm}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Exam</p>
                      <p className="font-bold">{m.marks.examination}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-indigo-600">{m.marks.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedFormat === 'minimal' && (
            <div className="space-y-4 mb-8">
              {studentMarks.map((m, i) => (
                <div key={i} className="flex justify-between border-b py-3">
                  <span className="font-medium">{m.subject}</span>
                  <span>{m.marks.total} ({m.marks.position})</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8" style={{ width: 300, margin: '0 auto' }}>
            <Pie data={getChartData()} />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-10">
        <h1 className="text-3xl font-bold text-center text-indigo-700">Publish Report Card</h1>

        {/* Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              disabled={!selectedClass}
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option>First Term 2025</option>
              <option>Second Term 2025</option>
              <option>Third Term 2025</option>
            </select>
          </div>
        </div>

        {/* Loaded Marks */}
        {studentMarks.length > 0 && (
          <div className="p-6 bg-gray-50 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Loaded Scores</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-3">Subject</th>
                  <th className="p-3">1st Test</th>
                  <th className="p-3">2nd Test</th>
                  <th className="p-3">3rd Test</th>
                  <th className="p-3">Mid Term</th>
                  <th className="p-3">Exam</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {studentMarks.map((m) => (
                  <tr key={m._id} className="border-b">
                    <td className="p-3">{m.subject}</td>
                    <td className="p-3 text-center">{m.marks.firstTest}</td>
                    <td className="p-3 text-center">{m.marks.secondTest}</td>
                    <td className="p-3 text-center">{m.marks.thirdTest}</td>
                    <td className="p-3 text-center">{m.marks.midTerm}</td>
                    <td className="p-3 text-center">{m.marks.examination}</td>
                    <td className="p-3 text-center font-bold">{m.marks.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Format Selection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Select Report Card Format</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REPORT_FORMATS.map((fmt) => (
              <motion.div
                key={fmt.id}
                whileHover={{ scale: 1.05 }}
                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                  selectedFormat === fmt.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setSelectedFormat(fmt.id)}
              >
                <h3 className="text-xl font-bold mb-2" style={{ color: fmt.colors.primary }}>{fmt.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{fmt.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewOpen(true);
                  }}
                  className="w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  Preview
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Publish Button */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePublish}
            disabled={loading || !studentMarks.length}
            className={`px-10 py-4 rounded-2xl text-white font-semibold shadow-lg transition-all flex items-center gap-3 ${
              loading || !studentMarks.length ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            {loading ? 'Publishing...' : 'Publish Report Card'}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={!studentMarks.length}
            className="px-10 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition flex items-center gap-3 shadow-lg"
          >
            <Download size={22} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && renderPreview()}
    </div>
  );
}