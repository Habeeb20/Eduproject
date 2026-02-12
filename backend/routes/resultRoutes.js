// routes/markRoutes.js
import express from 'express';

import { protect, authorize } from '../middleware/auth.js';
import {
  setMarkSettings,
  assignSubjectsToTeacher,
  addMarks,
  getStudentMarks,
  getClassMarks,
  getTeachersForSubjects,
} from '../controllers/resultController.js';

const router = express.Router();

router.post('/settings/marks', protect, authorize(['superadmin', 'admin']), setMarkSettings);
router.post('/assign-subjects', protect, authorize(['admin', 'superadmin']), assignSubjectsToTeacher);
router.post('/marks', protect, authorize('teacher'), addMarks);
router.get('/marks/student', protect, getStudentMarks);
router.get('/marks/student/:studentId', protect, getStudentMarks);
router.get('/marks/class', protect, authorize(['superadmin', 'admin', 'teacher']), getClassMarks);
router.get('/teachers/subjects', protect, authorize(['superadmin', 'admin']), getTeachersForSubjects);

export default router;