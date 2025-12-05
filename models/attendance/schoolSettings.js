// models/SchoolSettings.js
import mongoose from 'mongoose';

const schoolSettingsSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  // models/SchoolSettings.js → ADD THESE
teacherCheckInStart: { type: String, default: "07:00" }, 
studentCheckInStart: { type: String, default: "07:30" },
lateAfter: { type: String, default: "08:00" }, 
  teacherQRMode: {
    type: String,
    enum: ['daily', 'permanent'],
    default: 'permanent'  
  },
  permanentQRCode: { type: String }, 
  currentDailyQR: { type: String },
  dailyQRDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('SchoolSettings', schoolSettingsSchema);