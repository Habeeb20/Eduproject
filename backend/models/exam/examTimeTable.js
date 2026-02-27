import mongoose from 'mongoose';

const examTimetableSchema = new mongoose.Schema(
  {
    year: { type: String, required: true }, // e.g. "2025/2026"
    term: { type: String, enum: ['First', 'Second', 'Third'], required: true },
    entries: [
      {
        subject: { type: String, required: true },
        className: { type: String, required: true },
        date: { type: Date, required: true },
        startTime: { type: String, required: true }, // "09:00"
        endTime: { type: String, required: true }, // "11:00"
        durationMinutes: { type: Number, required: true },
        examQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamQuestion' }, // optional link
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('ExamTimetable', examTimetableSchema);