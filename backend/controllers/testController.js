import asyncHandler from "express-async-handler";
import Test from "../models/test/test.js";

import TestAttempt from "../models/test/testAttempt.js";

export const createTest = asyncHandler(async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ success: false, message: "Only teachers can create tests" });
  }

  const {
    title,
    description,
    subject,
    classNames, // array of class names e.g. ["SS 1", "SS 2A"]
    term,
    durationMinutes,
    questions, // array of { questionText, optionA/B/C/D, correctOption, explanation }
  } = req.body;

  if (!title || !subject || !classNames?.length || !term || !questions?.length) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  if (!questions.every(q => q.correctOption && ["A","B","C","D"].includes(q.correctOption))) {
    return res.status(400).json({ success: false, message: "Every question must have a correct option (A/B/C/D)" });
  }

  const test = await Test.create({
    title,
    description,
    subject,
    classNames,
    term,
    durationMinutes: durationMinutes || 60,
    totalQuestions: questions.length,
    createdBy: req.user._id,
    schoolName: req.user.schoolName,
    questions,
  });

  res.status(201).json({ success: true, test });
});






// POST /api/tests/:testId/start
export const startTest = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const student = req.user;

  if (student.role !== "student") {
    return res.status(403).json({ success: false, message: "Only students can take tests" });
  }

  const test = await Test.findById(testId);
  if (!test) return res.status(404).json({ success: false, message: "Test not found" });

  // Check if student is allowed (in one of the allowed classes)
  if (!test.classNames.includes(student.class)) {
    return res.status(403).json({ success: false, message: "You are not authorized to take this test" });
  }


  // Check time window
  const now = new Date();
  if (test.startDate && now < test.startDate) {
    return res.status(403).json({ success: false, message: "Test has not started yet" });
  }
  if (test.endDate && now > test.endDate) {
    return res.status(403).json({ success: false, message: "Test has ended" });
  }

  // Check if already completed
  let attempt = await TestAttempt.findOne({ student: student._id, test: testId });
  if (attempt?.status === "completed") {
    return res.status(403).json({ success: false, message: "You have already completed this test" });
  }

  if (!attempt) {
    attempt = await TestAttempt.create({
      student: student._id,
      test: testId,
    });
  }

  res.json({ success: true, attempt, test });
});








// POST /api/tests/:testId/attempt/:attemptId/answer
export const submitAnswer = asyncHandler(async (req, res) => {
  const { testId, attemptId } = req.params;
  const { questionIndex, selectedOption } = req.body;

  const attempt = await TestAttempt.findById(attemptId);
  if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not your attempt" });
  }

  attempt.answers.set(questionIndex.toString(), selectedOption);
  await attempt.save();

  res.json({ success: true });
});




// export const finishTest = asyncHandler(async (req, res) => {
//   const { testId, attemptId } = req.params;

//   const attempt = await TestAttempt.findById(attemptId);
//   if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
//     return res.status(403).json({ success: false, message: "Not your attempt" });
//   }

//   const test = await Test.findById(testId);
//   if (!test) return res.status(404).json({ success: false, message: "Test not found" });

//   // Safety: ensure answers is a Map (fallback to empty Map if broken)
//   const answersMap = attempt.answers instanceof Map ? attempt.answers : new Map(Object.entries(attempt.answers || {}));

//   let correct = 0;
//   test.questions.forEach((q, i) => {
//     const studentAnswer = answersMap.get(i.toString());
//     if (studentAnswer === q.correctOption) correct++;
//   });

//   const percentage = Math.round((correct / test.totalQuestions) * 100);

//   attempt.score = correct;
//   attempt.totalQuestions = test.totalQuestions;
//   attempt.percentage = percentage;
//   attempt.timeTakenSeconds = Math.floor((Date.now() - attempt.startedAt) / 1000);
//   attempt.status = "completed";
//   attempt.finishedAt = new Date();

//   await attempt.save();

//   res.json({
//     success: true,
//     score: { correct, total: test.totalQuestions, percentage },
//     attempt,
//   });
// });


// GET /api/tests/:testId/results


export const finishTest = asyncHandler(async (req, res) => {
  const { testId, attemptId } = req.params;

  const attempt = await TestAttempt.findById(attemptId);
  if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not your attempt" });
  }

  const test = await Test.findById(testId);
  if (!test) return res.status(404).json({ success: false, message: "Test not found" });

  // ────────────────────────────────────────────────────────
  // Normalize answers to a Map with STRING keys (fixes the issue)
  // This handles BOTH numeric keys (from frontend) and string keys
  // ────────────────────────────────────────────────────────
  const answersMap = new Map();

  if (attempt.answers) {
    // Convert whatever came from DB (Map or object) to string-keyed Map
    const entries = attempt.answers instanceof Map 
      ? Array.from(attempt.answers.entries())
      : Object.entries(attempt.answers);

    entries.forEach(([key, value]) => {
      answersMap.set(String(key), value);  // Force key to be string
    });
  }

  // Debug logs (remove after testing)
  console.log('Normalized answers keys:', Array.from(answersMap.keys()));
  console.log('Normalized answers values:', Array.from(answersMap.values()));

  let correct = 0;

  test.questions.forEach((q, index) => {
    // Try both string and number key (covers all cases)
    let studentAnswer = answersMap.get(String(index));   // "0", "1", ...

    if (studentAnswer === undefined) {
      studentAnswer = answersMap.get(index);            // 0, 1, ... (fallback)
    }

    // More debug
    console.log(
      `Q${index}: Student = "${studentAnswer || 'undefined'}", Correct = "${q.correctOption}"`
    );

    if (studentAnswer === q.correctOption) {
      correct++;
    }
  });

  const percentage = test.totalQuestions > 0 
    ? Math.round((correct / test.totalQuestions) * 100) 
    : 0;

  attempt.score = correct;
  attempt.totalQuestions = test.totalQuestions;
  attempt.percentage = percentage;
  attempt.timeTakenSeconds = Math.floor((Date.now() - attempt.startedAt) / 1000);
  attempt.status = "completed";
  attempt.finishedAt = new Date();

  await attempt.save();

  res.json({
    success: true,
    score: { correct, total: test.totalQuestions, percentage },
    attempt,
  });
});

export const getTestResults = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  const test = await Test.findById(testId);
  if (!test) return res.status(404).json({ success: false, message: "Test not found" });

  // Only creator (teacher) or admin/superadmin
  const isAuthorized =
    test.createdBy.toString() === req.user._id.toString() ||
    ["superadmin", "admin"].includes(req.user.role);

  if (!isAuthorized) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const attempts = await TestAttempt.find({ test: testId })
    .populate("student", "name class rollNumber")
    .sort({ percentage: -1 })
    .lean();

  res.json({ success: true, test, attempts });
});



// controllers/testController.js
export const getVisibleTests = asyncHandler(async (req, res) => {
  const user = req.user;

  let query = { schoolName: user.schoolName, };

  if (user.role === 'student') {
    // Students only see tests that include their class
    query.classNames = user.class;  // assuming user has a "class" field like "SS 1"
  } else if (user.role === 'teacher') {
    // Teachers see only tests they created
    query.createdBy = user._id;
  }
  // superadmin & admin see everything → no extra filter

  const tests = await Test.find(query)
    .select('-questions')           // don't send full questions here (security)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
console.log(tests)
  res.json({
    success: true,
    count: tests.length,
    tests,
  });
});




export const updateAttemptProgress = asyncHandler(async (req, res) => {
  const { testId, attemptId } = req.params;
  const { answers } = req.body;

  const attempt = await TestAttempt.findById(attemptId);
  if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  if (answers) {
    // Normalize keys to strings
    const normalized = new Map();
    Object.entries(answers).forEach(([key, value]) => {
      normalized.set(String(key), value);
    });
    attempt.answers = normalized;
  }

  await attempt.save();

  res.json({ success: true, message: 'Progress saved' });
});

// controllers/testController.js
export const getMyTests = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Only teachers can view their tests' });
  }

  const tests = await Test.find({
    createdBy: req.user._id,
    schoolName: req.user.schoolName,
  })
    .select('title subject term totalQuestions createdAt status')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, tests });
});






// Example controller
export const getAllTests = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const tests = await Test.find({ schoolName: req.user.schoolName })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, tests });
});










export const getStudentTestAttempts = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subject } = req.query;

  const user = req.user;


  let filter = { student: studentId, status: 'completed' };


  if (subject) {
    // Find test IDs that match the subject
    const matchingTests = await Test.find({ subject }).select('_id');
    const testIds = matchingTests.map(t => t._id);

    filter.test = { $in: testIds };
  }

  const attempts = await TestAttempt.find(filter)
    .populate({
      path: 'test',
      select: 'title subject totalQuestions durationMinutes createdAt',
    })
    .sort({ finishedAt: -1 }) // newest first
    .lean();

  // Optional: format response
  const formattedAttempts = attempts.map(attempt => ({
    _id: attempt._id,
    testTitle: attempt.test?.title || 'Untitled Test',
    subject: attempt.test?.subject || 'Unknown',
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: attempt.percentage,
    timeTakenSeconds: attempt.timeTakenSeconds,
    startedAt: attempt.startedAt,
    finishedAt: attempt.finishedAt,
    answers: attempt.answers, // Map of questionId → answer
  }));

  res.json({
    success: true,
    attempts: formattedAttempts,
    count: formattedAttempts.length,
  });
});