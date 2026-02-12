// controllers/resultController.js
import Mark  from '../models/class/resultModel.js';
import User from '../models/User.js';
import Class from '../models/class/classModel.js';
import SchoolSettings from '../models/attendance/schoolSettings.js';
import asyncHandler from "express-async-handler"
// ──────────────────────────────────────────────
// Controllers (attendanceController.js or new markController.js)
// ──────────────────────────────────────────────

// Set Mark Settings (toggle allowTeacherMarkAny)
export const setMarkSettings = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { allowTeacherMarkAny } = req.body;

  let settings = await SchoolSettings.findOne({ schoolName: req.user.schoolName });
  if (!settings) {
    settings = new SchoolSettings({ schoolName: req.user.schoolName, createdBy: req.user._id });
  }

  settings.allowTeacherMarkAny = allowTeacherMarkAny;
  await settings.save();

  res.json({ success: true, settings });
});

// Assign Subjects to Teacher (admin/superadmin)
export const assignSubjectsToTeacher = asyncHandler(async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { teacherId, subjects } = req.body;

  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(404).json({ success: false, message: 'Teacher not found' });
  }

  teacher.subjects = subjects;
  await teacher.save();

  res.json({ success: true, message: 'Subjects assigned' });
});

// Add/Update Marks (teacher)
export const addMarks = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Only teachers can add marks' });
  }

  const { studentId, subject, term, marks, autoPosition } = req.body;

  // Check settings
  const settings = await SchoolSettings.findOne({ schoolName: req.user.schoolName });
  if (!settings.allowTeacherMarkAny && !req.user.subjects.includes(subject)) {
    return res.status(403).json({ success: false, message: 'Not authorized for this subject' });
  }

  let mark = await Mark.findOne({ student: studentId, subject, term });

  if (!mark) {
    mark = new Mark({
      student: studentId,
      subject,
      className: (await User.findById(studentId)).class, // assume student has class field
      term,
      teacher: req.user._id,
      schoolName: req.user.schoolName,
    });
  }

  mark.marks.firstTest = marks.firstTest;
  mark.marks.secondTest = marks.secondTest;
  mark.marks.thirdTest = marks.thirdTest;
  mark.marks.midTerm = marks.midTerm;
  mark.marks.examination = marks.examination;
  mark.marks.total = 
    marks.firstTest + marks.secondTest + marks.thirdTest + marks.midTerm + marks.examination;
  mark.autoPosition = autoPosition;

  await mark.save();

  // If autoPosition true, calculate rank
  if (autoPosition) {
    await calculatePositions(mark.className, subject, term);
  }

  res.json({ success: true, message: 'Marks updated', mark });
});

// Calculate Positions for Class/Subject/Term
async function calculatePositions(className, subject, term) {
  const marks = await Mark.find({ className, subject, term }).sort({ 'marks.total': -1 });

  let position = 1;
  let previousTotal = null;
  let positionIncrement = 1;

  for (const mark of marks) {
    if (previousTotal === mark.marks.total) {
      // Tie - same position as previous
      positionIncrement++;
    } else {
      position += positionIncrement;
      positionIncrement = 1;
    }

    mark.marks.position = position;
    previousTotal = mark.marks.total;
    await mark.save();
  }
}

// Get Marks for Student (student/parent view)
export const getStudentMarks = asyncHandler(async (req, res) => {
  const { studentId } = req.params; // optional for parent

  let targetId = req.user._id;

  if (studentId) {
    if (req.user.role === 'parent') {
      const child = await User.findOne({ _id: studentId, parent: req.user._id });
      if (!child) return res.status(403).json({ success: false, message: 'Not your child' });
      targetId = studentId;
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
  } else if (req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can view their marks' });
  }

  const marks = await Mark.find({ student: targetId });
  res.json({ success: true, marks });
});

// Get All Marks for Class (admin/superadmin/teacher)
export const getClassMarks = asyncHandler(async (req, res) => {
  const { className, subject, term } = req.query;

  if (!['superadmin', 'admin', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const query = { className, term };
  if (subject) query.subject = subject;

  if (req.user.role === 'teacher') {
    query.teacher = req.user._id;
  }

  const marks = await Mark.find(query)
    .populate('student', 'name');

  res.json({ success: true, marks });
});

// Get Teachers for Subjects (admin/superadmin)
export const getTeachersForSubjects = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const teachers = await User.find({ role: 'teacher', schoolName: req.user.schoolName })
    .select('name subjects');

  res.json({ success: true, teachers });
});