import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  className: { type: String, required: true }, // e.g. "SS1 A"
  academicYear: { type: String, required: true }, // "2025/2026"
  term: { type: String, enum: ['First', 'Second', 'Third'], required: true },
  days: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    periods: [{
      startTime: String,     // "08:00"
      endTime: String,       // "09:00"
      subject: String,
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:false },
      venue: String,         // optional
    }]
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schoolName: String,
}, { timestamps: true });
timetableSchema.path('days.periods.teacher').validate(function(value) {
  if (!value) return true; // allow empty
  return mongoose.Types.ObjectId.isValid(value);
}, 'Invalid teacher ObjectId');

export default mongoose.model('Timetable', timetableSchema);