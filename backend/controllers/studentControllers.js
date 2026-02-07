
import User from '../models/User.js';
import SchoolSettings from '../models/attendance/schoolSettings.js';
import DailyTeacherQR from "../models/attendance/DailyQRAttendance.js"
import StudentAttendance from '../models/attendance/studentAttendance.js';

import 'colors';

// Reuse same QR as teachers OR make separate later
export const checkInStudent = async (req, res) => {
  const { qrCode, studentId } = req.body;
  const scanner = req.user;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate QR (using same as teacher for simplicity)
    const validQR = await DailyTeacherQR.findOne({
      code: qrCode,
      date: { $gte: today }
    });

    if (!validQR) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code! Scan at school gate only."
      });
    }

    const student = await User.findById(studentId || scanner._id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Prevent double scan
    const already = await StudentAttendance.findOne({
      student: student._id,
      date: { $gte: today }
    });
    if (already) {
      return res.status(400).json({
        success: false,
        message: `${student.name} already checked in!`
      });
    }

    // Get school late time
    const settings = await SchoolSettings.findOne() || {};
    const lateTime = settings.lateAfter || "08:00";
    const [h, m] = lateTime.split(':');
    const lateLimit = new Date();
    lateLimit.setHours(parseInt(h), parseInt(m), 0, 0);

    const isLate = new Date() > lateLimit;
    const status = isLate ? 'late' : 'present';

    // MARK ATTENDANCE
    const attendance = await StudentAttendance.create({
      student: student._id,
      studentId: student.studentId,
      name: student.name,
      class: student.class,
      section: student.section,
      status,
      scannedBy: scanner._id,
      qrCodeUsed: qrCode
    });

    // NOTIFY PARENT
    const parent = await User.findOne({ children: student._id });
    if (parent && !attendance.notifiedParent) {
      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const msg = `${student.name} has arrived school ${isLate ? 'LATE ' : ''}at ${time} ✅`;
      
      console.log(`PARENT NOTIFIED → ${parent.name}: ${msg}`.bgMagenta.white);

      // In real app: send SMS/email/push
      attendance.notifiedParent = true;
      await attendance.save();
    }

    console.log(`${isLate ? 'LATE' : 'PRESENT'} → ${student.name} (${student.studentId}) Class ${student.class}-${student.section}`[isLate ? 'red' : 'green'].bold);

    res.json({
      success: true,
      message: `${student.name} marked ${status.toUpperCase()}!`,
      status,
      time: new Date().toLocaleTimeString()
    });

  } catch (error) {
    console.error("Student Check-in Error:".red, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};