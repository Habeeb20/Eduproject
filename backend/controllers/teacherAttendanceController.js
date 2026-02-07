// controllers/teacherAttendanceController.js
import TeacherAttendance from '../models/attendance/teacherAttendance.js';
import DailyTeacherQR from '../models/attendance/DailyQRAttendance.js';

import SchoolSettings from '../models/attendance/schoolSettings.js';
import User from '../models/User.js';
import 'colors';

// 1. Generate or Get Today's QR Code (Admin/SuperAdmin only)
export const generateTodayTeacherQR = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if QR already exists for today
    let qr = await DailyTeacherQR.findOne({ date: { $gte: today, $lt: new Date(today.getTime() + 24*60*60*1000) } });

    if (qr) {
      return res.json({
        success: true,
        code: qr.code,
        message: "Today's QR already generated",
        generatedBy: qr.generatedBy
      });
    }

    // Generate new QR code
    const code = `TQR-${today.toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    qr = await DailyTeacherQR.create({
      date: today,
      code,
      generatedBy: req.user._id,
      expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1000) // expires just before midnight
    });

    console.log(`TEACHER QR GENERATED → ${code} by ${req.user.name} (${req.user.role.toUpperCase()})`.bgBlue.white.bold);

    res.status(201).json({
      success: true,
      code,
      message: "New QR code generated for today!",
      expiresAt: qr.expiresAt
    });

  } catch (error) {
    console.error("QR Generation Error:".red, error.message);
    res.status(500).json({ success: false, message: "Failed to generate QR code" });
  }
};

// 2. Teacher Check-In via QR Scan (Self or for a friend)
export const checkInTeacher = async (req, res) => {
  const { qrCode, teacherId } = req.body;
  const scanner = req.user; // logged in user

  if (!qrCode) {
    return res.status(400).json({ success: false, message: "QR code is required" });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate QR Code
    const validQR = await DailyTeacherQR.findOne({
      code: qrCode,
      date: { $gte: today },
      expiresAt: { $gt: new Date() }
    });

    if (!validQR) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired QR code! Please scan today's QR at the school gate."
      });
    }

    // Determine who to mark (self or selected teacher)
    const targetTeacherId = teacherId || scanner._id;
    const teacherToMark = await User.findById(targetTeacherId);

    if (!teacherToMark || teacherToMark.role !== 'teacher') {
      return res.status(404).json({ success: false, message: "Selected teacher not found" });
    }

    // Prevent double check-in
    const alreadyChecked = await TeacherAttendance.findOne({
      teacher: teacherToMark._id,
      date: { $gte: today }
    });

    if (alreadyChecked) {
      return res.status(400).json({
        success: false,
        message: `${teacherToMark.name} is already checked in today at ${alreadyChecked.checkInTime.toLocaleTimeString()}`
      });
    }

    // MARK AS PRESENT
    const attendance = await TeacherAttendance.create({
      date: today,
      teacher: teacherToMark._id,
      teacherId: teacherToMark.teacherId || null,
      name: teacherToMark.name,
      scannedBy: scanner._id,
      scannedByName: scanner.name,
      qrCodeUsed: qrCode,
      schoolName: scanner.schoolName || teacherToMark.schoolName,
      checkInTime: new Date()
    });

    const action = scanner._id.toString() === targetTeacherId.toString()
      ? "self check-in"
      : `checked in by ${scanner.name}`;

    console.log(`TEACHER CHECKED IN → ${teacherToMark.name} (${teacherToMark.teacherId || 'N/A'}) - ${action}`.green.bold);

    res.json({
      success: true,
      message: `${teacherToMark.name} marked PRESENT!`,
      checkedInTeacher: {
        name: teacherToMark.name,
        teacherId: teacherToMark.teacherId,
        time: new Date().toLocaleTimeString()
      },
      scannedBy: scanner.name
    });

  } catch (error) {
    console.error("Check-in Error:".red, error.message);
    res.status(500).json({ success: false, message: "Check-in failed. Try again." });
  }
};

// 3. Get Today's Full Attendance Report (Admin & SuperAdmin)
export const getTodayTeacherAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceList = await TeacherAttendance.find({
      date: { $gte: today }
    })
      .populate('teacher', 'name teacherId phone')
      .populate('scannedBy', 'name')
      .sort({ checkInTime: 1 });

    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const presentCount = attendanceList.length;
    const absentTeachers = await User.find({
      role: 'teacher',
      isActive: true,
      _id: { $nin: attendanceList.map(a => a.teacher) }
    }).select('name teacherId phone');

    console.log(`ATTENDANCE REPORT → ${presentCount}/${totalTeachers} teachers present today`.cyan.bold);

    res.json({
      success: true,
      date: today.toISOString().slice(0, 10),
      summary: {
        totalTeachers,
        present: presentCount,
        absent: totalTeachers - presentCount,
        percentage: totalTeachers > 0 ? Math.round((presentCount / totalTeachers) * 100) : 0
      },
      present: attendanceList,
      absent: absentTeachers.map(t => ({
        name: t.name,
        teacherId: t.teacherId,
        phone: t.phone
      }))
    });

  } catch (error) {
    console.error("Attendance Report Error:".red, error.message);
    res.status(500).json({ success: false, message: "Failed to load attendance" });
  }
};

// BONUS: Get list of teachers for "Scan for Friend" dropdown
export const getTeachersForScan = async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher', 
      isActive: true 
    })
    .select('name teacherId phone')
    .sort('name');

    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const setTiming = async (req, res) => {
 const { lateAfter, teacherCheckInStart, studentCheckInStart } = req.body;
  
  let settings = await SchoolSettings.findOne();
  if (!settings) settings = await SchoolSettings.create({});

  settings.lateAfter = lateAfter || "08:00";
  settings.teacherCheckInStart = teacherCheckInStart || "07:00";
  settings.studentCheckInStart = studentCheckInStart || "07:30";

  await settings.save();

  res.json({ success: true, message: "School timings updated!", settings });
}
