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

// controllers/markController.js
export const addMarks = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Only teachers can add marks' });
  }

  const { className, subject, term, marks, autoPosition } = req.body;

  // Validate required fields
  if (!className || !subject || !term || !marks || typeof marks !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid payload: class, subject, term, and marks object required' });
  }

  // Check settings for autoPosition
  const settings = await SchoolSettings.findOne({ schoolName: req.user.schoolName });
  if (autoPosition && !settings?.allowTeacherMarkAny) {
    return res.status(403).json({
      success: false,
      message: 'Automatic position calculation is disabled by Admin',
    });
  }

  const updatedMarks = [];

  // Loop through each student in the marks object
  for (const [studentId, studentMarks] of Object.entries(marks)) {
    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      console.warn(`Student ${studentId} not found`);
      continue; // Skip invalid student
    }

    // Validate student belongs to the class
    if (student.class !== className || student.schoolName !== req.user.schoolName) {
      console.warn(`Student ${studentId} not in class ${className}`);
      continue;
    }

    let mark = await Mark.findOne({ student: studentId, subject, term });

    if (!mark) {
      mark = new Mark({
        student: studentId,
        subject,
        className,
        term,
        teacher: req.user._id,
        schoolName: req.user.schoolName,
      });
    }

    // Update marks
    mark.marks.firstTest = studentMarks.firstTest || 0;
    mark.marks.secondTest = studentMarks.secondTest || 0;
    mark.marks.thirdTest = studentMarks.thirdTest || 0;
    mark.marks.midTerm = studentMarks.midTerm || 0;
    mark.marks.examination = studentMarks.examination || 0;
    mark.marks.total =
      mark.marks.firstTest +
      mark.marks.secondTest +
      mark.marks.thirdTest +
      mark.marks.midTerm +
      mark.marks.examination;

    mark.autoPosition = autoPosition || false;

    await mark.save();
    updatedMarks.push(mark);
  }

  // If autoPosition enabled, recalculate ranks for the whole class/subject/term
  if (autoPosition) {
    await calculatePositions(className, subject, term);
  }

  res.json({
    success: true,
    message: `Marks updated for ${updatedMarks.length} students`,
    updatedCount: updatedMarks.length,
  });
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
    if (req.user.role === 'parent' || req.user.role === 'teacher' || req.user.role === 'superadmin') {
      const child = await User.findOne({ _id: studentId, parent: req.user._id });
      if (!child) return res.status(400).json({ success: false, message: 'Not your child' });
      targetId = studentId;
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
  } 

  const marks = await Mark.find({ student: targetId });
  console.log(marks)
  res.json({ success: true, marks });
});

// Get All Marks for Class (admin/superadmin/teacher)
export const getClassMarks = asyncHandler(async (req, res) => {
  const { className, subject, term } = req.query;

  // Debug logs (remove in production)
  console.log('Query params received:', { className, subject, term });
  console.log('User role:', req.user.role);
  console.log('User schoolName:', req.user.schoolName);
  console.log('User ID:', req.user._id?.toString());

  if (!['superadmin', 'admin', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  // Required parameters
  if (!className?.trim() || !term?.trim()) {
    console.log('error')
    return res.status(400).json({ 
      success: false, 
      message: 'className and term are required query parameters' 
    });
  }

  // Build query with schoolName ALWAYS included
  const query = {
    className: className.trim(),
    term: term.trim(),
    schoolName: req.user.schoolName,  // ← This restricts results to the current user's school
  };

  // Optional subject filter
  if (subject?.trim()) {
    query.subject = subject.trim();
  }

  // For teachers: only see marks they personally entered
  if (req.user.role === 'teacher') {
    query.teacher = req.user._id;
    console.log('Teacher restriction applied → filtering by teacher ID:', req.user._id.toString());
  }

  console.log('Final MongoDB query:', query);

  const marks = await Mark.find(query)
    .populate('student', 'name studentId rollNumber class profilePicture') // more fields for frontend
    .sort({ 'marks.total': -1 }) // highest score first
    .lean();

  console.log('Found marks count:', marks.length);
  if (marks.length > 0) {
    console.log('First mark sample:', marks[0]);
  } else {
    console.log('No marks found matching this exact query');
  }

  res.json({
    success: true,
    queryUsed: query,
    count: marks.length,
    marks,
  });
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