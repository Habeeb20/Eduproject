
import Mark from "../models/class/resultModel.js"
import TestAttempt from '../models/test/testAttempt.js';
import asyncHandler from 'express-async-handler'
import Test from "../models/test/test.js";
import User from "../models/User.js";

// 1. Teacher computes & publishes scores for a student in their subject
export const computeAndPublishScore = asyncHandler(async (req, res) => {
  const teacher = req.user;
  if (!['teacher'].includes(teacher.role)) {
    return res.status(403).json({ success: false, message: 'Only teachers can compute scores' });
  }

  const { studentId, subject, className, term, firstTest, secondTest, thirdTest, midTerm, examination } = req.body;

  // Validate input
  if (!studentId || !subject || !className || !term) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Calculate total
  const total = (firstTest || 0) + (secondTest || 0) + (thirdTest || 0) + (midTerm || 0) + (examination || 0);

  // Optional: Pull test attempt scores if available (for CBT integration)
  const attempts = await TestAttempt.find({ student: studentId, test: { $in: await Test.find({ subject }) } });
  const attemptTotal = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
  const attemptPercentage = attempts.length ? (attemptTotal / (attempts.length * 100)) * 100 : 0;

  // Final total can blend manual + CBT if you want
  const finalTotal = total + attemptTotal; // or use logic you prefer

  let mark = await Mark.findOne({ student: studentId, subject, className, term });
  if (mark) {
    // Update existing
    mark.marks = { firstTest, secondTest, thirdTest, midTerm, examination, total: finalTotal };
    mark.teacher = teacher._id;
    await mark.save();
  } else {
    // Create new
    mark = await Mark.create({
      student: studentId,
      subject,
      className,
      term,
      marks: { firstTest, secondTest, thirdTest, midTerm, examination, total: finalTotal },
      teacher: teacher._id,
      schoolName: teacher.schoolName,
    });
  }

  res.json({ success: true, mark });
});

// 2. Publish report card (teacher selects format and publishes)
export const publishReportCard = asyncHandler(async (req, res) => {
  const teacher = req.user;
  if (!['teacher'].includes(teacher.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { studentId, term, format } = req.body; // format: 'classic', 'modern', 'minimal'

  const marks = await Mark.find({ student: studentId, term })
    .populate('student', 'name className');

  if (!marks.length) {
    return res.status(404).json({ success: false, message: 'No scores found for this student/term' });
  }

  // Calculate overall position (rank) across all subjects
  const allStudentsMarks = await Mark.find({ term: marks[0].term, className: marks[0].className });
  const totals = allStudentsMarks.reduce((acc, m) => {
    acc[m.student] = m.marks.total;
    return acc;
  }, {});

  const sortedTotals = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const position = sortedTotals.findIndex(([id]) => id === studentId.toString()) + 1;

  // Update position in DB
  await Mark.updateMany({ student: studentId, term }, { 'marks.position': position });

  res.json({
    success: true,
    report: {
      student: marks[0].student,
      term,
      marks,
      overallPosition: position,
      format, // teacher-selected format
    },
  });
});

// 3. Student/Parent view – get own report card
export const getStudentReportCard = asyncHandler(async (req, res) => {
  const user = req.user;
  const studentId = user.role === 'student' ? user._id : user.student?._id; // parent case

  if (!studentId) return res.status(400).json({ success: false, message: 'Student not found' });

  const { term } = req.query;

  const marks = await Mark.find({ student: studentId, term })
    .populate('student', 'name className');

  if (!marks.length) return res.status(404).json({ success: false, message: 'No report found' });

  res.json({ success: true, report: { marks, student: marks[0].student } });
});




// GET /computed-score/report/my?term=...
export const getMyReportCard = asyncHandler(async (req, res) => {
  const student = req.user;

  // Only students or parents (with linked student) can access this
  let studentId = student._id;

  if (student.role === 'parent') {
    // If parent, use linked student's ID (adjust based on your schema)
    studentId = student.linkedStudent || student.student?._id;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'No linked student found' });
    }
  } else if (student.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students/parents can view report cards' });
  }


  // Find all marks for this student in the given term
  const marks = await Mark.find({
    student: studentId,
 
    schoolName: student.schoolName, // security: same school
  })
    .populate('student', 'name className admissionNumber') // optional: more student info
    .populate('teacher', 'name') // optional: teacher name
    .lean(); // faster, plain JS objects

  if (!marks.length) {
    return res.status(404).json({
      success: false,
      message: `No report card found for ${term}`,
    });
  }

  // Calculate overall position (rank) in class for this term
  const className = marks[0].className; // assume all marks in same class
  const allClassMarks = await Mark.find({
    className,
  
    schoolName: student.schoolName,
  }).lean();

  // Map student totals
  const totalsMap = {};
  allClassMarks.forEach(m => {
    totalsMap[m.student.toString()] = m.marks.total;
  });

  // Sort descending by total
  const ranked = Object.entries(totalsMap)
    .sort(([, a], [, b]) => b - a)
    .map(([id], rank) => ({ studentId: id, rank: rank + 1 }));

  // Find this student's position
  const position = ranked.find(r => r.studentId === studentId.toString())?.rank || 'N/A';

  // Optional: add percentage or grade per subject
  const enrichedMarks = marks.map(m => ({
    ...m,
    percentage: m.marks.total > 0 ? Math.round((m.marks.total / 500) * 100) : 0, // assuming 100 max per assessment × 5
    grade: getGrade(m.marks.total), // optional helper function
  }));

  // Optional: student info
  const studentInfo = await User.findById(studentId).select('name className admissionNumber gender dob');

  res.json({
    success: true,
    report: {
      student: studentInfo || { name: 'Student', className },
    
      marks: enrichedMarks,
      overallPosition: position,
      totalSubjects: marks.length,
      // optional extra stats
      totalMarks: enrichedMarks.reduce((sum, m) => sum + m.marks.total, 0),
      averagePercentage: marks.length 
        ? (enrichedMarks.reduce((sum, m) => sum + (m.percentage || 0), 0) / marks.length).toFixed(1)
        : 0,
    },
  });
});

// Optional helper: convert total to grade (customize as needed)
function getGrade(total) {
  if (total >= 450) return 'A1';
  if (total >= 400) return 'B2';
  if (total >= 350) return 'B3';
  if (total >= 300) return 'C4';
  if (total >= 250) return 'C5';
  if (total >= 200) return 'C6';
  if (total >= 150) return 'D7';
  if (total >= 100) return 'E8';
  return 'F9';
}