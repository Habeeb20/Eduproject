// src/components/exam/TimetableDetailsModal.jsx
import { X, Calendar, Clock, BookOpen } from 'lucide-react';

export default function TimetableDetailsModal({ timetable, onClose }) {
  if (!timetable) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-2xl md:text-3xl font-bold">
            {timetable.year} • {timetable.term} Term
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timetable.entries.map((entry, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="text-indigo-600" size={24} />
                  <h4 className="text-xl font-bold text-gray-900">{entry.subject}</h4>
                </div>
                <p className="text-gray-700 mb-2"><strong>Class:</strong> {entry.className}</p>
                <p className="text-gray-700 mb-2">
                  <strong>Date:</strong> {entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}
                </p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <span>{entry.startTime} - {entry.endTime}</span>
                  <span className="ml-2">({entry.durationMinutes} min)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}