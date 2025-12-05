// models/StudentAttendance.js
import mongoose from 'mongoose';

const studentAttendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: () => new Date().setHours(0,0,0,0) },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: String,
  name: String,
  class: String,
  section: String,
  
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late'], 
    default: 'present' 
  },
  checkInTime: { type: Date, default: Date.now },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // teacher/admin who scanned
  qrCodeUsed: String,
  notifiedParent: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('StudentAttendance', studentAttendanceSchema);