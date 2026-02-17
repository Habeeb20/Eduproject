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
router.post('/', protect, authorize('teacher'), addMarks);
router.get('/student', protect, getStudentMarks);
router.get('/student/:studentId', protect, getStudentMarks);
router.get('/class', protect, authorize('superadmin', 'admin', 'teacher'), getClassMarks);
router.get('/teachers/subjects', protect, authorize(['superadmin', 'admin']), getTeachersForSubjects);

export default router;