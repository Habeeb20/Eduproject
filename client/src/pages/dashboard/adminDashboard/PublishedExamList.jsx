// src/pages/admin/PublishedExamList.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search, Download, Printer, BookOpen, Users, CheckCircle, CalendarPlus, FileText, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExamTimetableModal from './ExamTimeTableModal';

export default function PublishedExamList() {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTimetableModal, setShowTimetableModal] = useState(false);
const [previewExam, setPreviewExam] = useState(null);

const openPreview = (exam) => {
  setPreviewExam(exam);
};
  useEffect(() => {
    fetchPublishedExams();
  }, []);

  const fetchPublishedExams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/exams/all-published`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setExams(res.data.exams || []);
      setFilteredExams(res.data.exams || []);
    } catch (err) {
      toast.error('Failed to load published exams');
    } finally {
      setLoading(false);
    }
  };


  const downloadExamQuestions = (exam) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Exam: ${exam.title}`, 14, 22);
  doc.setFontSize(12);
  doc.text(`Subject: ${exam.subject} | Class: ${exam.className}`, 14, 32);
  doc.text(`Total Marks: ${exam.totalMarks} | Duration: ${exam.durationMinutes} min`, 14, 40);

  let yPos = 50;

  exam.questions.forEach((q, idx) => {
    doc.setFontSize(14);
    doc.text(`Question ${idx + 1} (${q.marks} marks)`, 14, yPos);
    yPos += 8;

    // Split long question text
    const questionLines = doc.splitTextToSize(q.questionText.replace(/<[^>]+>/g, ''), 180);
    doc.setFontSize(12);
    doc.text(questionLines, 14, yPos);
    yPos += questionLines.length * 7 + 4;

    if (q.type === 'multiple_choice' && q.options.length) {
      doc.text('Options:', 14, yPos);
      yPos += 6;
      q.options.forEach((opt, i) => {
        doc.text(`${i + 1}. ${opt}`, 18, yPos);
        yPos += 6;
      });
      yPos += 4;
    }

    yPos += 10; // spacing
  });

  doc.save(`${exam.title.replace(/\s+/g, '_')}.pdf`);
  toast.success('Exam downloaded as PDF');
};

  // Search/filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = exams.filter(
      (exam) =>
        exam.title.toLowerCase().includes(term) ||
        exam.subject.toLowerCase().includes(term) ||
        exam.className.toLowerCase().includes(term)
    );
    setFilteredExams(filtered);
  }, [searchTerm, exams]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Published Exam Questions Report', 14, 22);

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = ['Title', 'Subject', 'Class', 'Marks', 'Duration', 'CBT', 'Teacher'];
    const tableRows = filteredExams.map((exam) => [
      exam.title,
      exam.subject,
      exam.className,
      exam.totalMarks,
      `${exam.durationMinutes} min`,
      exam.isCBT ? 'Yes' : 'No',
      exam.teacher?.name || 'Unknown',
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 },
    });

    doc.save(`published-exams-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF exported');
  };

  const printTable = () => {
    window.print();
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
            <h1 className="text-2xl md:text-3xl font-bold text-black">
              Published Exams
            </h1>
            <p className="mt-2 text-lg text-gray-700">
              View and manage all teacher-created published exam questions
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
            >
              <Download size={18} />
              Export PDF
            </button>
            <button
              onClick={printTable}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-md"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={() => setShowTimetableModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition shadow-lg"
            >
              <CalendarPlus size={18} />
              Create Timetable
            </button>
            
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title, subject, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Published</p>
                <p className="text-4xl font-bold mt-2">{exams.length}</p>
              </div>
              <BookOpen className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">With CBT</p>
                <p className="text-4xl font-bold mt-2">
                  {exams.filter(e => e.isCBT).length}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Questions</p>
                <p className="text-4xl font-bold mt-2">
                  {exams.reduce((sum, e) => sum + (e.questions?.length || 0), 0)}
                </p>
              </div>
              <FileText className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Subjects Covered</p>
                <p className="text-4xl font-bold mt-2">
                  {new Set(exams.map(e => e.subject)).size}
                </p>
              </div>
              <AlertCircle className="h-12 w-12 opacity-50" />
            </div>
          </div>
        </div>

        {previewExam && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 flex justify-between items-center rounded-t-3xl">
        <h2 className="text-2xl md:text-3xl font-bold line-clamp-1">
          {previewExam.title}
        </h2>
        <button
          onClick={() => setPreviewExam(null)}
          className="p-2 rounded-full hover:bg-white/20 transition"
        >
          <X size={28} />
        </button>
      </div>

      <div className="p-6 md:p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <p><strong>Subject:</strong> {previewExam.subject}</p>
            <p><strong>Class:</strong> {previewExam.className}</p>
          </div>
          <div>
            <p><strong>Total Marks:</strong> {previewExam.totalMarks}</p>
            <p><strong>Duration:</strong> {previewExam.durationMinutes} minutes</p>
            {previewExam.isCBT && (
              <p><strong>CBT Available From:</strong> {new Date(previewExam.cbtAvailableFrom).toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-gray-900">Questions</h3>
          {previewExam.questions.map((q, idx) => (
            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Question {idx + 1} ({q.marks} marks)
                </h4>
                <span className="text-sm text-gray-600 capitalize">{q.type.replace('_', ' ')}</span>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: q.questionText }}
                className="prose max-w-none text-gray-700"
              />
              {q.type === 'multiple_choice' && q.options.length > 0 && (
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  {q.options.map((opt, i) => (
                    <li key={i} className="text-gray-700">{opt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

        {/* Exam Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl shadow-xl">
              <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Published Exams Found</h2>
              <p className="text-gray-600">Teachers have not published any exams yet, or no matches for your search.</p>
            </div>
          ) : (
            filteredExams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{exam.title}</h3>
                    {exam.isCBT && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        <CheckCircle size={14} />
                        CBT
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <p><strong>Subject:</strong> {exam.subject}</p>
                    <p><strong>Class:</strong> {exam.className}</p>
                    <p><strong>Marks:</strong> {exam.totalMarks}</p>
                    <p><strong>Duration:</strong> {exam.durationMinutes} min</p>
                    {exam.isCBT && (
                      <p><strong>Available From:</strong> {new Date(exam.cbtAvailableFrom).toLocaleString()}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t flex gap-3">
                  <button
  onClick={() => openPreview(exam)}
  className="flex-1 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition"
>
  View Details
</button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                      <Printer size={18} />
                    </button>
                    <button
  onClick={() => downloadExamQuestions(exam)}
  className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition flex items-center gap-2"
>
  <Download size={18} />
  Download PDF
</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Timetable Creation Modal */}
      <ExamTimetableModal
        isOpen={showTimetableModal}
        onClose={() => setShowTimetableModal(false)}
        onSave={() => {
          toast.success('Timetable created!');
          // Optional: refresh any timetable list if you have one
        }}
      />
    </div>
  );
}