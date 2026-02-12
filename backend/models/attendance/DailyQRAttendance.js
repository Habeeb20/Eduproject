// src/models/Attendance.js
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent'],
    required: true,
  },
  method: {
    type: String,
    enum: ['qr_scan', 'unique_code'],
    required: true,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  ipAddress: String, // For backend IP check
  schoolName: String,
  createdBy: { // If marked by admin/superadmin manually
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);

