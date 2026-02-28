// src/components/exam/TimetableCard.jsx
import { Calendar, Clock, BookOpen } from 'lucide-react';

export default function TimetableCard({ timetable, onViewDetails }) {
  const { year, term, entries = [], createdBy } = timetable;

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100">
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {year} • {term} Term
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Created by {createdBy?.name || 'Admin'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            <Calendar size={14} />
            {entries.length} Exams
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.slice(0, 4).map((entry, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="text-indigo-600" size={18} />
                <p className="font-medium text-gray-900">{entry.subject}</p>
              </div>
              <p className="text-sm text-gray-600">{entry.className}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>{entry.date ? new Date(entry.date).toLocaleDateString() : '-'}</span>
                <span>•</span>
                <span>{entry.startTime} - {entry.endTime}</span>
              </div>
            </div>
          ))}
        </div>

        {entries.length > 4 && (
          <p className="text-sm text-center text-gray-500">
            + {entries.length - 4} more exams
          </p>
        )}

        <button
          onClick={onViewDetails}
          className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
        >
          View Full Timetable
        </button>
      </div>
    </div>
  );
}