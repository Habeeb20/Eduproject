// models/DailyTeacherQR.js
import mongoose from 'mongoose';

const dailyTeacherQRSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  code: { type: String, required: true }, // e.g. "TQR-20250405"
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date }
});

export default mongoose.model('DailyTeacherQR', dailyTeacherQRSchema);