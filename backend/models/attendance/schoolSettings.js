// src/models/SchoolSettings.js (new model for school-wide settings like late time)
import mongoose from 'mongoose';

const schoolSettingsSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    unique: true,
  },
  lateTime: {
    type: String, // e.g., '08:30' (HH:MM in 24-hour format)
    default: '08:30',
  },
  location: {
    latitude: Number,
    longitude: Number,
    radius: Number, // in meters, e.g., 100m around school
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

schoolSettingsSchema.add({
  allowTeacherMarkAny: { type: Boolean, default: false }, // true: any class/subject; false: only assigned
});

export default mongoose.model('SchoolSettings', schoolSettingsSchema);