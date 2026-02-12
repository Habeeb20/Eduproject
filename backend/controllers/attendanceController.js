// controllers/attendanceController.js
import asyncHandler from 'express-async-handler';
import Attendance from '../models/attendance/DailyQRAttendance.js'
import SchoolSettings from '../models/attendance/schoolSettings.js';
import User from '../models/User.js';

import geoip from 'geoip-lite'; // Install: npm install geoip-lite

// ──────────────────────────────────────────────
// Create/Update School Settings (superadmin/admin)
// ──────────────────────────────────────────────
export const setSchoolSettings = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { lateTime, latitude, longitude, radius } = req.body;

  let settings = await SchoolSettings.findOne({ schoolName: req.user.schoolName });

  if (settings) {
    // Update
    settings.lateTime = lateTime || settings.lateTime;
    settings.location.latitude = latitude || settings.location.latitude;
    settings.location.longitude = longitude || settings.location.longitude;
    settings.location.radius = radius || settings.location.radius;
    await settings.save();
  } else {
    // Create new
    settings = await SchoolSettings.create({
      schoolName: req.user.schoolName,
      lateTime: lateTime || '08:30',
      location: { latitude, longitude, radius: radius || 100 },
      createdBy: req.user._id,
    });
  }

  res.json({
    success: true,
    message: 'School settings updated',
    settings,
  });
});

// ──────────────────────────────────────────────
// Mark Attendance (using QR or unique code)
// ──────────────────────────────────────────────
export const markAttendance = asyncHandler(async (req, res) => {
  const { method, code, latitude, longitude } = req.body; // code = uniqueCode or QR data

  // Find user by unique code or QR (assume QR sends uniqueCode)
  const user = await User.findOne({ 'digitalId.uniqueCode': code });
  if (!user) {
    return res.status(404).json({ success: false, message: 'Invalid code' });
  }

  // Get school settings
  const settings = await SchoolSettings.findOne({ schoolName: user.schoolName });
  if (!settings) {
    return res.status(400).json({ success: false, message: 'School settings not found' });
  }

  // Anti-cheat: Geolocation check (must be within school radius)
  if (latitude && longitude && settings.location.latitude && settings.location.longitude) {
    const distance = getDistance(
      latitude,
      longitude,
      settings.location.latitude,
      settings.location.longitude
    );
    if (distance > settings.location.radius) {
      return res.status(403).json({ success: false, message: 'Attendance can only be marked from school premises' });
    }
  } else {
    // Fallback: Backend IP geolocation (rough check)
    const geo = geoip.lookup(req.ip);
    if (geo && geo.ll) {
      const distance = getDistance(
        geo.ll[0],
        geo.ll[1],
        settings.location.latitude,
        settings.location.longitude
      );
      if (distance > 10000) { // 10km example
        return res.status(403).json({ success: false, message: 'Location mismatch - attendance must be marked from school' });
      }
    }
  }

  // Anti-cheat: Time window (e.g., only between 7-9 AM)
  const now = new Date();
  if (now.getHours() < 6 || now.getHours() > 12) {
    return res.status(403).json({ success: false, message: 'Attendance can only be marked during school hours' });
  }

  // Check if already marked today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const existing = await Attendance.findOne({
    user: user._id,
    date: { $gte: todayStart },
  });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Attendance already marked today' });
  }

  // Determine status (present or late)
  const [hours, minutes] = settings.lateTime.split(':').map(Number);
  const lateTime = new Date();
  lateTime.setHours(hours, minutes, 0, 0);

  const status = now <= lateTime ? 'present' : 'late';

  // Save attendance
  const attendance = await Attendance.create({
    user: user._id,
    status,
    method,
    location: { latitude, longitude },
    ipAddress: req.ip,
    schoolName: user.schoolName,
  });

  res.json({
    success: true,
    message: 'Attendance marked successfully',
    attendance,
  });
});

// ──────────────────────────────────────────────
// Get Attendance History (own or child's)
// ──────────────────────────────────────────────
export const getAttendanceHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params; // optional - for admin/superadmin/parent viewing specific user

  let targetUserId = req.user._id;

  if (userId) {
    if (['superadmin', 'admin'].includes(req.user.role)) {
      targetUserId = userId;
    } else if (req.user.role === 'parent') {
      const child = await User.findOne({ _id: userId, parent: req.user._id });
      if (!child) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this user' });
      }
      targetUserId = userId;
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
  }

  const history = await Attendance.find({ user: targetUserId })
    .sort({ date: -1 })
    .limit(30); // last 30 days

  res.json({
    success: true,
    history,
  });
});

// ──────────────────────────────────────────────
// Get All Attendance (superadmin/admin)
// ──────────────────────────────────────────────
export const getAllAttendance = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { date, role } = req.query; // filters

  const query = { schoolName: req.user.schoolName };
  if (date) query.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };
  if (role) query['user.role'] = role; // populate or use aggregate if needed

  const attendance = await Attendance.find(query)
    .populate('user', 'name role')
    .sort({ date: -1 });

  res.json({
    success: true,
    attendance,
  });
});

// ──────────────────────────────────────────────
// Helper: Calculate distance (Haversine formula)
// ──────────────────────────────────────────────
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}


export const getSchoolSettings = asyncHandler(async (req, res) => {
    console.log(req.user)
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const settings = await SchoolSettings.findOne({ schoolName: req.user.schoolName });

  if (!settings) {
    return res.status(404).json({
      success: false,
      message: 'School settings not configured yet',
      defaultLateTime: '08:30', // fallback
    });
  }

  res.json({
    success: true,
    settings: {
      lateTime: settings.lateTime,
      location: settings.location,
    },
  });
});