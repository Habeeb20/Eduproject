// src/pages/teacher/TeacherScorePublisher.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Save, FileText, Eye, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { SCHOOL_SUBJECTS } from '../../../subject';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion } from 'framer-motion';

export default function TeacherScorePublisher() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('First Term 2025');
  const [marks, setMarks] = useState({
    firstTest: 0,
    secondTest: 0,
    thirdTest: 0,
    midTerm: 0,
    examination: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [reportFormat, setReportFormat] = useState('modern');
  const [previewReport, setPreviewReport] = useState(null);

  const handlePublishReport = async () => {
  if (!selectedStudent || !selectedTerm) {
    toast.error('Please select a student and term first');
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/report/publish`,
      {
        studentId: selectedStudent,
        term: selectedTerm,
        format: reportFormat, // or whatever format you're using
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );

    toast.success('Report card published successfully!');
    console.log('Published report:', res.data);
    // Optional: refresh data or show preview
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to publish report card');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

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
    if (!selectedClass) {
      setStudents([]);
      setSelectedStudent('');
      return;
    }

    const fetchStudents = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/users/students?className=${selectedClass}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setStudents(res.data.students || []);
      } catch (err) {
        toast.error('Failed to load students');
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // Prefill marks when student + subject + term selected
 // Prefill marks when student + subject + term selected
useEffect(() => {
  if (!selectedStudent || !selectedSubject || !selectedTerm) return;

  const prefillScores = async () => {
    try {
      // Reset marks to default while loading
      setMarks({
        firstTest: 0,
        secondTest: 0,
        thirdTest: 0,
        midTerm: 0,
        examination: 0,
        total: 0,
      });

      console.log('Prefilling scores for:', {
        student: selectedStudent,
        subject: selectedSubject,
        term: selectedTerm,
      });

      // 1. Check manual marks (Mark schema)
      const markRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/marks/student/${selectedStudent}?subject=${selectedSubject}&term=${selectedTerm}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      console.log('Mark API full response:', markRes.data);

      // The response has { marks: [ { ..., marks: { firstTest: 20, ... } } ] }
      if (markRes.data?.marks?.length > 0) {
        const firstMark = markRes.data.marks[0]; // take the first (and only) matching record
        const existingMarks = firstMark.marks || {}; // get the inner marks object

        console.log('Loaded manual marks:', existingMarks);

        setMarks(existingMarks);
        toast.info('Loaded existing manual scores');
        return; // stop here — we found manual marks
      } else {
        console.log('No manual mark found for this student/subject/term');
      }

      // 2. If no manual mark, try CBT attempts (fallback)
      const attemptRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/tests/student/${selectedStudent}?subject=${selectedSubject}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      console.log('Attempt API response:', attemptRes.data);

      if (attemptRes.data?.attempts?.length > 0) {
        const attempts = attemptRes.data.attempts;
        const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
        const avgPercentage = attempts.length 
          ? Number((totalScore / attempts.length).toFixed(1)) 
          : 0;

        console.log('CBT average percentage:', avgPercentage);

        setMarks(prev => ({
          ...prev,
          examination: avgPercentage,
          total: avgPercentage + (prev.firstTest || 0) + (prev.secondTest || 0) + (prev.thirdTest || 0) + (prev.midTerm || 0),
        }));

        toast.info('Prefilled from CBT attempts');
      } else {
        console.log('No CBT attempts found');
      }
    } catch (err) {
      console.error('Prefill error:', err.response?.data || err.message);
      toast.error('Could not load previous scores');
    }
  };

  prefillScores();
}, [selectedStudent, selectedSubject, selectedTerm]);

  const handleMarkChange = (field, value) => {
    const numValue = Number(value) || 0;
    setMarks(prev => {
      const newMarks = { ...prev, [field]: numValue };
      newMarks.total = 
        (newMarks.firstTest || 0) +
        (newMarks.secondTest || 0) +
        (newMarks.thirdTest || 0) +
        (newMarks.midTerm || 0) +
        (newMarks.examination || 0);
      return newMarks;
    });
  };

  const handlePublishScores = async () => {
    if (!selectedStudent || !selectedSubject || !selectedClass) {
      toast.error('Please select student, subject, and class');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/computed-score/marks/compute`,
        {
          studentId: selectedStudent,
          subject: selectedSubject,
          className: selectedClass,
          term: selectedTerm,
          ...marks,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Scores published successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish scores');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewReport = () => {
    if (!selectedStudent || !selectedTerm) {
      toast.error('Select student and term first');
      return;
    }

    // Mock preview data (you can fetch real data here)
    const preview = {
      student: { name: 'Selected Student', className: selectedClass },
      term: selectedTerm,
      marks: [{ subject: selectedSubject, marks }],
      overallPosition: 5, // placeholder
      format: reportFormat,
    };
    setPreviewReport(preview);
  };

  const downloadReportPDF = (format) => {
    const doc = new jsPDF();

    if (format === 'classic') {
      doc.setFontSize(18);
      doc.text(`Report Card - ${previewReport.student.name}`, 20, 20);
      doc.autoTable({
        startY: 30,
        head: [['Subject', '1st', '2nd', '3rd', 'Mid', 'Exam', 'Total', 'Pos']],
        body: previewReport.marks.map(m => [
          m.subject,
          m.marks.firstTest,
          m.marks.secondTest,
          m.marks.thirdTest,
          m.marks.midTerm,
          m.marks.examination,
          m.marks.total,
          m.marks.position || '-',
        ]),
      });
    } else if (format === 'modern') {
      doc.setFontSize(20);
      doc.text('Modern Report Card', 20, 20);
      // You can add canvas chart images here using html2canvas if desired
      doc.text(`Overall Position: ${previewReport.overallPosition}`, 20, 100);
    } else if (format === 'minimal') {
      doc.setFontSize(16);
      doc.text(`Minimal Report - ${previewReport.term}`, 20, 20);
      doc.autoTable({
        startY: 30,
        theme: 'plain',
        styles: { fontSize: 10 },
        head: [['Subject', 'Total']],
        body: previewReport.marks.map(m => [m.subject, m.marks.total]),
      });
    }

    doc.save(`${previewReport.student.name}_report_${previewReport.term}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 text-center mb-10">
          Score Computation & Report Card Publisher
        </h1>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
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
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Subject</option>
              {SCHOOL_SUBJECTS.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option>First Term 2025</option>
              <option>Second Term 2025</option>
              <option>Third Term 2025</option>
            </select>
          </div>
        </div>

        {/* Marks Input Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
          {['firstTest', 'secondTest', 'thirdTest', 'midTerm', 'examination'].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 capitalize mb-2">
                {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={marks[field]}
                onChange={(e) => handleMarkChange(field, e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <div className="col-span-2 md:col-span-1 flex items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
              <div className="p-3 border rounded-xl bg-gray-50 font-bold text-center">
                {marks.total}
              </div>
            </div>
          </div>
        </div>

        {/* Publish Scores */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handlePublishScores}
            disabled={loading}
            className={`px-10 py-4 rounded-2xl text-white font-semibold shadow-lg transition-all flex items-center gap-3 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            {loading ? 'Publishing...' : 'Publish Scores'}
          </button>
        </div>

        {/* Report Card Publishing Section */}
        {/* <div className="border-t pt-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Publish Full Report Card
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {['classic', 'modern', 'minimal'].map(fmt => (
              <motion.div
                key={fmt}
                whileHover={{ scale: 1.05 }}
                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                  reportFormat === fmt
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setReportFormat(fmt)}
              >
                <h3 className="text-xl font-bold capitalize mb-4">{fmt}</h3>
                <p className="text-sm text-gray-600">
                  {fmt === 'classic' && 'Traditional table format - perfect for printing'}
                  {fmt === 'modern' && 'Modern cards + charts - visual & engaging'}
                  {fmt === 'minimal' && 'Clean & elegant - minimalistic print design'}
                </p>
                <button
                  onClick={() => handlePreviewReport()}
                  className="mt-4 w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  Preview
                </button>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={handlePublishReport}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-lg flex items-center gap-3"
            >
              <Save size={20} />
              Publish Report Card
            </button>

            {previewReport && (
              <button
                onClick={() => downloadReportPDF(reportFormat)}
                className="px-10 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition shadow-lg flex items-center gap-3"
              >
                <Download size={20} />
                Download PDF
              </button>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
}