// controllers/timetableController.js
import Timetable from "../models/class/ClassTimeTable.js";
// Helper function to check for teacher conflicts
export const findTeacherConflicts = async (days, schoolName, excludeTimetableId = null) => {
  const conflicts = [];

  // Flatten all periods with teacher and time info
  const allPeriods = [];
  days.forEach(day => {
    day.periods.forEach(period => {
      if (period.teacher) {
        allPeriods.push({
          teacherId: period.teacher,
          day: day.day,
          startTime: period.startTime,
          endTime: period.endTime,
          className: day.className || 'unknown', // if class is per day
          timetableId: null, // will be filled later
        });
      }
    });
  });

  // Find existing timetables (exclude current one if updating)
  const existingTimetables = await Timetable.find({
    schoolName,
    _id: { $ne: excludeTimetableId },
  }).lean();

  // Flatten all existing periods
  existingTimetables.forEach(tt => {
    tt.days.forEach(day => {
      day.periods.forEach(period => {
        if (period.teacher) {
          allPeriods.push({
            teacherId: period.teacher.toString(),
            day: day.day,
            startTime: period.startTime,
            endTime: period.endTime,
            className: tt.className,
            timetableId: tt._id,
          });
        }
      });
    });
  });

  // Group by teacher + day
  const teacherDayMap = {};

  allPeriods.forEach(p => {
    const key = `${p.teacherId}-${p.day}`;
    if (!teacherDayMap[key]) teacherDayMap[key] = [];
    teacherDayMap[key].push(p);
  });

  // Check overlaps within each teacher-day group
  Object.entries(teacherDayMap).forEach(([key, periods]) => {
    // Sort periods by start time
    periods.sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (let i = 0; i < periods.length - 1; i++) {
      const current = periods[i];
      const next = periods[i + 1];

      // Check if current overlaps with next
      if (current.endTime > next.startTime) {
        conflicts.push({
          teacherId: current.teacherId,
          day: current.day,
          period1: {
            start: current.startTime,
            end: current.endTime,
            class: current.className,
            timetableId: current.timetableId,
          },
          period2: {
            start: next.startTime,
            end: next.endTime,
            class: next.className,
            timetableId: next.timetableId,
          },
        });
      }
    }
  });

  return conflicts;
};

// In createClassTimetable
export const createClassTimetable =async (req, res) => {
  const user = req.user;
  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { className, academicYear, term, days } = req.body;

  // Check for conflicts before saving
  const conflicts = await findTeacherConflicts(days, user.schoolName);

  if (conflicts.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Teacher scheduling conflict detected',
      conflicts,
    });
  }

  const timetable = await Timetable.create({
    className,
    academicYear,
    term,
    days,
    createdBy: user._id,
    schoolName: user.schoolName,
  });

  res.status(201).json({ success: true, timetable });
};

// In updateTimetable (similar check)
export const updateTimetable = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const timetable = await Timetable.findById(id);
  if (!timetable) return res.status(404).json({ success: false, message: 'Not found' });

  const updates = req.body;
  const newDays = updates.days || timetable.days;

  // Check conflicts excluding current timetable
  const conflicts = await findTeacherConflicts(newDays, user.schoolName, id);

  if (conflicts.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Teacher scheduling conflict detected',
      conflicts,
    });
  }

  // Apply updates...
  if (updates.className) timetable.className = updates.className;
  if (updates.academicYear) timetable.academicYear = updates.academicYear;
  if (updates.term) timetable.term = updates.term;
  if (updates.days) timetable.days = updates.days;

  await timetable.save();

  res.json({ success: true, timetable });
};