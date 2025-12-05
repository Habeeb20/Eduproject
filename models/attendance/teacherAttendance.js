// models/TeacherAttendance.js
import mongoose from 'mongoose';

const teacherAttendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: String,
  name: String,
  role: { type: String, default: 'teacher' },
  
  // Who scanned for them
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scannedByName: String,

  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  qrCodeUsed: String, // for audit
  schoolName: String
}, {
  timestamps: true,
  unique: true, // one entry per teacher per day
});

export default mongoose.model('TeacherAttendance', teacherAttendanceSchema);