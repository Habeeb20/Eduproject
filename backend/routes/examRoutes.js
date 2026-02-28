// src/routes/examRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';


import {
  // Exam Questions (Teacher)
  createExamQuestions,
  getMyExams,
  publishExam,
  updateExamQuestions,
  deleteExam,
  getExamById,

  // CBT / Student Exam Interface
  startCBTExam,
  submitCBTExam,
  getAvailableCBTExams,

  // Examination Timetable (Admin / Superadmin)
  createExamTimetable,
  createManualTimetable,
  getAllTimetables,
  getTimetableById,
  getAllPublishedExams,
  getTeacherTimetables,
  getStudentTimetables,
  updateTimetable,
  deleteTimetable,
} from '../controllers/examController.js';

const router = express.Router();

// ────────────────────────────────────────────────
// TEACHER: Exam Questions Management
// ────────────────────────────────────────────────

// Create new exam questions (draft or direct)
router.post(
  '/questions',
  protect,
  authorize('teacher'),
  createExamQuestions
);

// Get all exams created by the logged-in teacher (drafts + published)
router.get(
  '/questions/my',
  protect,
  authorize('teacher'),
  getMyExams
);

// Publish a draft exam (makes it available for CBT or viewing)
router.patch(
  '/questions/:id/publish',
  protect,
  authorize('teacher'),
  publishExam
);

// Update an existing draft exam
router.put(
  '/questions/:id',
  protect,
  authorize('teacher'),
  updateExamQuestions
);

// Delete a draft or unpublished exam
router.delete(
  '/questions/:id',
  protect,
  authorize('teacher'),
  deleteExam
);

// Get single exam details (teacher preview or student CBT start)
router.get(
  '/questions/:id',
  protect,
  getExamById
);

// ────────────────────────────────────────────────
// STUDENT: CBT (Computer-Based Test) Interface
// ────────────────────────────────────────────────

// Student starts a CBT exam session
router.post(
  '/cbt/:examId/start',
  protect,
  authorize(['student']),
  startCBTExam
);

// Student submits CBT answers
router.post(
  '/cbt/:examId/submit',
  protect,
  authorize(['student']),
  submitCBTExam
);

// Student views all CBT exams currently available to them
router.get(
  '/cbt/available',
  protect,
  authorize(['student']),
  getAvailableCBTExams
);

// ────────────────────────────────────────────────
// ADMIN / SUPERADMIN: Examination Timetable Management
// ────────────────────────────────────────────────

// Create timetable (automated from selected exam questions)
router.post(
  '/timetable',
  protect,
  authorize('admin', 'superadmin'),
  createExamTimetable
);

// Create timetable manually (no linked exam questions)
router.post(
  '/timetable/manual',
  protect,
  authorize(['admin', 'superadmin']),
  createManualTimetable
);

// Everyone can view the school timetable
router.get(
  '/timetable',
  protect,
  getAllTimetables
);



router.get('/all-published', protect, authorize('admin', 'superadmin'), getAllPublishedExams);

// Get timetables for teacher's classes
router.get('/timetable/teacher', protect, authorize('teacher'), getTeacherTimetables);

// Get timetables for student's class
router.get('/timetable/my', protect, authorize('student'), getStudentTimetables);

// View single timetable details
router.get(
  '/timetable/:id',
  protect,
  getTimetableById
);


router.put('/timetable/:id', protect, authorize('admin', 'superadmin'), updateTimetable);
router.delete('/timetable/:id', protect, authorize('admin', 'superadmin'), deleteTimetable);
export default router;