import Timetable from "../models/class/ClassTimeTable.js";
import { findTeacherConflicts } from "../utils/helper.js";
import mongoose from "mongoose";
// controllers/timetableController.js
export const createClassTimetable = async (req, res) => {
  const user = req.user;

  // Authorization
  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only admins or superadmins can create timetables',
    });
  }

  try {
    const { className, academicYear, term, days } = req.body;

    // 1. Required fields
    if (!className || !academicYear || !term || !Array.isArray(days)) {
      return res.status(400).json({
        success: false,
        message: 'className, academicYear, term, and days array are required',
      });
    }

    // 2. Validate term using schema enum
    const VALID_TERMS = Timetable.schema.path('term').enumValues;
    if (!VALID_TERMS.includes(term)) {
      return res.status(400).json({
        success: false,
        message: `Invalid term. Must be one of: ${VALID_TERMS.join(', ')}`,
      });
    }

    // 3. Validate days structure
    for (const dayEntry of days) {
      if (!dayEntry.day || !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(dayEntry.day)) {
        return res.status(400).json({
          success: false,
          message: `Invalid day: ${dayEntry.day}`,
        });
      }

      if (!Array.isArray(dayEntry.periods)) {
        return res.status(400).json({
          success: false,
          message: `Periods must be an array for day: ${dayEntry.day}`,
        });
      }

      for (const period of dayEntry.periods) {
        if (!period.startTime || !period.endTime || !period.subject) {
          return res.status(400).json({
            success: false,
            message: 'Each period must have startTime, endTime, and subject',
          });
        }

        // Allow teacher to be empty or valid ObjectId
        if (period.teacher && !mongoose.Types.ObjectId.isValid(period.teacher)) {
          return res.status(400).json({
            success: false,
            message: `Invalid teacher ID: ${period.teacher}`,
          });
        }
      }
    }

    // 4. Optional conflict check
    let conflicts = [];
    if (typeof findTeacherConflicts === 'function') {
      conflicts = await findTeacherConflicts(days, user.schoolName);
    }

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Teacher scheduling conflicts detected',
        conflicts,
      });
    }

    // 5. Create
    const timetable = await Timetable.create({
      className,
      academicYear,
      term,
      days,
      createdBy: user._id,
      schoolName: user.schoolName || 'Unknown School',
    });

    // 6. Return populated version
    const populated = await Timetable.findById(timetable._id)
      .populate('days.periods.teacher', 'firstName lastName phoneNumber profilePicture')
      .populate('createdBy', 'firstName lastName role')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Timetable created successfully',
      timetable: populated,
    });
  } catch (error) {
    console.error('Error creating timetable:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating timetable',
      error: error.message,
    });
  }
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

export const getTimetableByClass = async (req, res) => {
  const { className } = req.query;
  const user = req.user;

  let filter = { schoolName: user.schoolName };

  if (user.role === 'student' || user.role === 'parent') {
    const studentClass = user.className || (user.role === 'parent' && user.student?.className);
    if (!studentClass) return res.status(400).json({ message: 'Class not found' });
    filter.className = studentClass;
  } else if (user.role === 'teacher') {
    // Teachers see timetables where they are assigned
    filter['days.periods.teacher'] = user._id;
  }

  const timetables = await Timetable.find(filter)
    .populate('days.periods.teacher', 'name')
    .sort({ academicYear: -1, term: 1 });

  res.json({ success: true, timetables });
};


export const checkConflicts = async (req, res) => {
  const { days } = req.body;
  const user = req.user;

  const conflicts = await findTeacherConflicts(days, user.schoolName);

  res.json({ success: true, conflicts });
};