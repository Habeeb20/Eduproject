// controllers/classController.js
import Class from '../models/class/classModel.js';
import User from '../models/User.js';





import 'colors';



import asyncHandler from 'express-async-handler';

// ──────────────────────────────────────────────
// Create a new class (superadmin / admin)
// ──────────────────────────────────────────────
export const createClass = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { name, level } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Class name is required' });
  }

  const existing = await Class.findOne({ name, schoolName: req.user.schoolName });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Class already exists' });
  }

  const newClass = await Class.create({
    name,
    level: level || null,
    schoolName: req.user.schoolName,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Class created successfully',
    class: newClass
  });
});

// ──────────────────────────────────────────────
// Get all classes in the school
// ──────────────────────────────────────────────
export const getAllClasses = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const classes = await Class.find({ schoolName: req.user.schoolName })
    .populate('students', 'name email')
    .populate('subjects.teacher', 'name email');

  res.json({ success: true, classes });
});

// ──────────────────────────────────────────────
// Add subject to class (and optionally assign teacher)
// ──────────────────────────────────────────────
export const addSubjectToClass = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { classId, subjectName, teacherId } = req.body;

  const classDoc = await Class.findById(classId);
  if (!classDoc || classDoc.schoolName !== req.user.schoolName) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }

  // Check if subject already exists
  if (classDoc.subjects.some(s => s.subjectName === subjectName)) {
    return res.status(400).json({ success: false, message: 'Subject already added to this class' });
  }

  let teacher = null;
  if (teacherId) {
    teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher' || teacher.schoolName !== req.user.schoolName) {
      return res.status(400).json({ success: false, message: 'Invalid teacher' });
    }
  }

  classDoc.subjects.push({
    subjectName,
    teacher: teacher ? teacher._id : null
  });

  await classDoc.save();

  res.json({
    success: true,
    message: 'Subject added to class',
    class: classDoc
  });
});

// ──────────────────────────────────────────────
// Assign teacher to a subject in a class
// ──────────────────────────────────────────────
export const assignTeacherToSubject = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { classId, subjectName, teacherId } = req.body;

  const classDoc = await Class.findById(classId);
  if (!classDoc || classDoc.schoolName !== req.user.schoolName) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }

  const subjectIndex = classDoc.subjects.findIndex(s => s.subjectName === subjectName);
  if (subjectIndex === -1) {
    return res.status(404).json({ success: false, message: 'Subject not found in this class' });
  }

  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== 'teacher' || teacher.schoolName !== req.user.schoolName) {
    return res.status(400).json({ success: false, message: 'Invalid teacher' });
  }

  classDoc.subjects[subjectIndex].teacher = teacher._id;
  await classDoc.save();

  res.json({
    success: true,
    message: 'Teacher assigned to subject',
    class: classDoc
  });
});



// Get all students in a specific class
export const getStudentsInClass = asyncHandler(async (req, res) => {
  const { className } = req.params;

  if (!className) {
    return res.status(400).json({ success: false, message: 'Class name is required' });
  }

  // Only superadmin, admin, or teachers should access this
  if (!['superadmin', 'admin', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  // Find the class
  const classDoc = await Class.findOne({
    name: className,
    schoolName: req.user.schoolName,
  }).populate('students', 'name email role studentId rollNumber class profilePicture');

  console.log( classDoc)
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: `Class '${className}' not found in your school`,
    });
  }

  res.json({
    success: true,
    class: {
      name: classDoc.name,
      level: classDoc.level,
      studentCount: classDoc.students.length,
    },
    students: classDoc.students || [],
  });
});