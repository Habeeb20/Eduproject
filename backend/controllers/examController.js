// controllers/examController.js
import asyncHandler from 'express-async-handler';
import ExamQuestion from '../models/exam/examQuestions.js';
import ExamTimetable from "../models/exam/examTimeTable.js"
// Create exam questions (teacher)
export const createExamQuestions = asyncHandler(async (req, res) => {
  const teacher = req.user;
  if (teacher.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Only teachers can create exams' });
  }

  const {
    subject,
    className,
    title,
    totalMarks,
    durationMinutes,
    isCBT,
    cbtAvailableFrom,
    questions,
  } = req.body;

  if (!subject || !className || !title || !totalMarks || !durationMinutes || !questions?.length) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const exam = await ExamQuestion.create({
    teacher: teacher._id,
    subject,
    className,
    title,
    totalMarks,
    durationMinutes,
    isCBT: isCBT || false,
    cbtAvailableFrom: isCBT ? cbtAvailableFrom : null,
    questions,
    status: 'draft',
    schoolName: teacher.schoolName,
  });

  res.status(201).json({ success: true, exam });
});

// Get my created exams (teacher)
export const getMyExams = asyncHandler(async (req, res) => {
  const teacher = req.user;
  if (teacher.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const exams = await ExamQuestion.find({ teacher: teacher._id, schoolName: teacher.schoolName })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, exams });
});



// Auto-generate timetable from selected exam questions
export const createExamTimetable = asyncHandler(async (req, res) => {
  const { year, term, entries } = req.body; // entries: [{ subject, className, examQuestionId, date, startTime }]

  const user = req.user;
  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  let timetableEntries = [];

  for (const entry of entries) {
    const examQ = await ExamQuestion.findById(entry.examQuestionId);
    if (!examQ) continue;

    const endTime = new Date(entry.date);
    const [hours, minutes] = entry.startTime.split(':');
    endTime.setHours(parseInt(hours) + Math.floor(examQ.durationMinutes / 60));
    endTime.setMinutes(parseInt(minutes) + (examQ.durationMinutes % 60));

    timetableEntries.push({
      subject: examQ.subject,
      className: entry.className,
      date: entry.date,
      startTime: entry.startTime,
      endTime: endTime.toTimeString().slice(0, 5),
      durationMinutes: examQ.durationMinutes,
      examQuestionId: entry.examQuestionId,
    });
  }

  const timetable = await ExamTimetable.create({
    year,
    term,
    entries: timetableEntries,
    createdBy: user._id,
    schoolName: user.schoolName,
  });

  res.status(201).json({ success: true, timetable });
});

// Manual creation (no examQuestionId)
export const createManualTimetable = asyncHandler(async (req, res) => {
  const { year, term, entries } = req.body;

  const user = req.user;
  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const timetable = await ExamTimetable.create({
    year,
    term,
    entries,
    createdBy: user._id,
    schoolName: user.schoolName,
  });

  res.status(201).json({ success: true, timetable });
});

// Get all timetables (for students/teachers/parents)
export const getAllTimetables = asyncHandler(async (req, res) => {
  const user = req.user;
  const timetables = await ExamTimetable.find({ schoolName: user.schoolName })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, timetables });
});

export const publishExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exam = await ExamQuestion.findById(id);
  if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
  if (exam.teacher.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Unauthorized' });

  exam.status = 'published';
  await exam.save();

  res.json({ success: true, exam });
});


// Student: Get available CBT exams (only those published, CBT-enabled, and date/time matches)
export const getAvailableCBTExams = asyncHandler(async (req, res) => {
  const student = req.user;
  if (student.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can access CBT exams' });
  }

  const now = new Date();

  const exams = await ExamQuestion.find({
    schoolName: student.schoolName,
    status: 'published',
    isCBT: true,
    cbtAvailableFrom: { $lte: now },
    className: student.className, // assuming student has className field
  })
    .select('title subject className totalMarks durationMinutes cbtAvailableFrom')
    .sort({ cbtAvailableFrom: 1 })
    .lean();

  res.json({ success: true, exams });
});

// Student: Start CBT (optional - can just be frontend check, but backend can log start)
export const startCBTExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const student = req.user;

  const exam = await ExamQuestion.findById(examId);
  if (!exam || !exam.isCBT || exam.status !== 'published') {
    return res.status(404).json({ success: false, message: 'Exam not available' });
  }

  // Optional: record start time or prevent multiple starts
  // You can add a StartedExams collection if needed

  res.json({ success: true, exam });
});

// Student: Submit CBT answers
export const submitCBTExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { answers } = req.body; // { questionIndex: answer }
  const student = req.user;

  const exam = await ExamQuestion.findById(examId);
  if (!exam || !exam.isCBT || exam.status !== 'published') {
    return res.status(404).json({ success: false, message: 'Exam not available' });
  }

  // Calculate score (for MCQ/true-false)
  let score = 0;
  exam.questions.forEach((q, idx) => {
    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      if (answers[idx] === q.correctAnswer) {
        score += q.marks;
      }
    }
    // Essay/fill-in-blank would need manual grading later
  });

  // Save result (you'll need a Result model)
  // await Result.create({ student: student._id, exam: examId, score, answers });

  res.json({ success: true, score, totalMarks: exam.totalMarks });
});

// Optional: Edit draft exam
export const updateExamQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacher = req.user;

  // Verify ownership first
  const exam = await ExamQuestion.findOne({ _id: id, teacher: teacher._id });
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found or unauthorized' });
  }

  const updates = req.body;

  // Special handling for nested questions
  if (updates.questions) {
    updates.questions = updates.questions; // Ensure it's array
  }

  const updatedExam = await ExamQuestion.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.json({ success: true, exam: updatedExam });
});
// Optional: Delete exam (only drafts)
export const deleteExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacher = req.user;

  const exam = await ExamQuestion.findById(id);
  if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
  if (exam.teacher.toString() !== teacher._id.toString()) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  if (exam.status !== 'draft') {
    return res.status(400).json({ success: false, message: 'Only drafts can be deleted' });
  }

  await exam.deleteOne();
  res.json({ success: true, message: 'Exam deleted' });
});

export const getExamById = asyncHandler(async (req, res) => {
  const exam = await ExamQuestion.findById(req.params.id)
    .populate('teacher', 'name')
    .lean();
  if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
  res.json({ success: true, exam });
});





// Get all published exams (for admin/superadmin)
export const getAllPublishedExams = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const exams = await ExamQuestion.find({
    schoolName: user.schoolName,
    status: 'published',
  })
    .populate('teacher', 'name')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, exams });
});









export const getTeacherTimetables = asyncHandler(async (req, res) => {
  const teacher = req.user;

  if (teacher.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Only teachers can access this' });
  }

  const teacherClasses = teacher.assignedClasses || [];


  const timetables = await ExamTimetable.find({
    schoolName: teacher.schoolName,
    // 'entries.className': { $in: teacherClasses }, 
  })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, timetables });
});

// Get timetables for a student's class (only their own class)
export const getStudentTimetables = asyncHandler(async (req, res) => {
  const student = req.user;

  if (student.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can access this' });
  }


  const studentClass = student.class

  if (!studentClass) {
    return res.status(400).json({ success: false, message: 'Student class not found' });
  }

  const timetables = await ExamTimetable.find({
    schoolName: student.schoolName,
    // 'entries.className': studentClass, // exact match for student's class
  })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, timetables });
});




export const getTimetableById = asyncHandler(async (req, res) => {
  const timetable = await ExamTimetable.findById(req.params.id)
    .populate('createdBy', 'name') 
    .lean()
    if(!timetable) return res.status(404).json({ success: false, message: 'Timetable not found' });
    res.json({ success: true, timetable });

})




// Update timetable (admin/superadmin only)
export const updateTimetable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const timetable = await ExamTimetable.findById(id);
  if (!timetable) return res.status(404).json({ success: false, message: 'Timetable not found' });
  if (timetable.schoolName !== user.schoolName) return res.status(403).json({ success: false, message: 'Unauthorized' });

  const { year, term, entries } = req.body;

  if (year) timetable.year = year;
  if (term) timetable.term = term;
  if (entries) timetable.entries = entries;

  await timetable.save();

  res.json({ success: true, timetable });
});

// Delete timetable
export const deleteTimetable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const timetable = await ExamTimetable.findById(id);
  if (!timetable) return res.status(404).json({ success: false, message: 'Timetable not found' });
  if (timetable.schoolName !== user.schoolName) return res.status(403).json({ success: false, message: 'Unauthorized' });

  await timetable.deleteOne();

  res.json({ success: true, message: 'Timetable deleted' });
});