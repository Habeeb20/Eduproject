// src/components/exam/ExamTimetableModal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, Plus, Save, Download, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Trash2 } from 'lucide-react';
import {SCHOOL_SUBJECTS} from '../../../subject'

import { Loader2 } from 'lucide-react';
export default function ExamTimetableModal({ isOpen, onClose, onSave, initialData = null }) {
  const [mode, setMode] = useState('manual');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [term, setTerm] = useState('First');
  const [entries, setEntries] = useState([]);
  const [publishedExams, setPublishedExams] = useState([]);
  const [loading, setLoading] = useState(false);
const [subject, setSubject] = useState(initialData?.subject || '');
  

  useEffect(() => {
    if (isOpen && mode === 'auto') {
      fetchPublishedExams();
    }
  }, [isOpen, mode]);

  const [classes, setClasses] = useState([]);

useEffect(() => {
  const fetchClasses = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/classes`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setClasses(res.data.classes || []);
    } catch (err) {
      toast.error('Failed to load classes');
    }
  };
  fetchClasses();
}, []);
  const fetchPublishedExams = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/exams/all-published`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPublishedExams(res.data.exams || []);
    } catch (err) {
      toast.error('Failed to load published exams');
    }
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        subject: '',
        className: '',
        date: null,
        startTime: '',
        endTime: '',
        durationMinutes: '',
        examQuestionId: mode === 'auto' ? '' : null,
      },
    ]);
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    if (field === 'examQuestionId' && mode === 'auto') {
      const selected = publishedExams.find(e => e._id === value);
      if (selected) {
        updated[index].durationMinutes = selected.durationMinutes || '';
        updated[index].subject = selected.subject || '';
      }
    }
    updated[index][field] = value;
    setEntries(updated);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!year || !term || entries.length === 0) {
      toast.error('Please fill year, term, and at least one entry');
      return;
    }

    setLoading(true);
    try {
      const payload = { year, term, entries };
      const endpoint = mode === 'auto' ? '/timetable' : '/timetable/manual';

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/exams${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success('Timetable created successfully!');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create timetable');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Exam Timetable – ${year} ${term} Term`, 14, 22);

    const tableColumn = ['Subject', 'Class', 'Date', 'Start', 'End', 'Duration'];
    const tableRows = entries.map(entry => [
      entry.subject,
      entry.className,
      entry.date ? new Date(entry.date).toLocaleDateString() : '',
      entry.startTime,
      entry.endTime,
      entry.durationMinutes ? `${entry.durationMinutes} min` : '',
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`timetable-${year}-${term}.pdf`);
    toast.success('PDF downloaded');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 md:px-10 py-5 flex justify-between items-center z-10 rounded-t-3xl">
          <h2 className="text-2xl md:text-3xl font-bold">Create Exam Timetable</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition"
          >
            <X size={28} />
          </button>
        </div>

        {/* Mode Tabs */}
       <div className="p-6 md:p-10 border-b">
  <div className="flex justify-center gap-6 bg-gray-100 p-2 rounded-2xl max-w-md mx-auto">
    <button
      onClick={() => setMode('manual')}
      className={`flex-1 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm ${
        mode === 'manual'
          ? 'bg-white text-indigo-700 shadow-md'
          : 'text-gray-600 hover:bg-white/80'
      }`}
    >
      Manual Entry
    </button>
    <button
      onClick={() => {
        setMode('auto');
        if (publishedExams.length === 0) fetchPublishedExams();
      }}
      className={`flex-1 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm ${
        mode === 'auto'
          ? 'bg-white text-indigo-700 shadow-md'
          : 'text-gray-600 hover:bg-white/80'
      }`}
    >
      Automated (from Published Exams)
    </button>
  </div>
</div>

        {/* Form */}
        <div className="p-6 md:p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2025/2026"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="First">First Term</option>
                <option value="Second">Second Term</option>
                <option value="Third">Third Term</option>
              </select>
            </div>
          </div>

          {/* Entries List */}
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-6 relative">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Entry {index + 1}</h3>
                  <button
                    onClick={() => removeEntry(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    {mode === 'auto' ? (
                      <select
                        value={entry.examQuestionId || ''}
                        onChange={(e) => updateEntry(index, 'examQuestionId', e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Exam</option>
                        {publishedExams.map(ex => (
                          <option key={ex._id} value={ex._id}>
                            {ex.title} ({ex.subject})
                          </option>
                        ))}
                      </select>
                    ) : (
                <select
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    required
  >
    <option value="">Select Subject</option>
    {SCHOOL_SUBJECTS.map((sub) => (
      <option key={sub} value={sub}>
        {sub}
      </option>
    ))}
  </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
               <select

    value={entry.className || ''}
    onChange={(e) => updateEntry(index, 'className', e.target.value)}
    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
    required
  >
    <option value="">Select Class</option>
    {classes.map((cls) => (
      <option key={cls._id || cls.name} value={cls.name || cls._id}>
        {cls.name}
      </option>
    ))}
  </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <DatePicker
                      selected={entry.date}
                      onChange={(date) => updateEntry(index, 'date', date)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={entry.startTime}
                      onChange={(e) => updateEntry(index, 'startTime', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                    <input
                      type="number"
                      value={entry.durationMinutes}
                      readOnly={mode === 'auto'}
                      onChange={(e) => mode !== 'auto' && updateEntry(index, 'durationMinutes', Number(e.target.value))}
                      className={`w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                        mode === 'auto' ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      min="1"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addEntry}
              className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center gap-3 shadow-md"
            >
              <Plus size={20} />
              Add Timetable Entry
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className={`flex-1 p-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
              {loading ? 'Creating...' : 'Create Timetable'}
            </button>

            <div className="flex gap-4">
              <button
                onClick={exportToPDF}
                className="px-6 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition flex items-center gap-2 shadow-md"
              >
                <Download size={20} />
                Export PDF
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-4 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition flex items-center gap-2 shadow-md"
              >
                <Printer size={20} />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}