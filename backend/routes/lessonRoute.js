// routes/lessonNoteRoutes.js
import express from 'express';
import { createLessonNote,   getAllLessonNotes,
  reviewLessonNote,
  getMyLessonNotes, } from '../controllers/lessonNoteController.js';

import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();

router.post('/', protect, authorize('teacher'), createLessonNote);
router.get('/', protect, authorize('superadmin', 'admin'), getAllLessonNotes);
router.put('/:id/review', protect, authorize('superadmin', 'admin'), reviewLessonNote);
router.get('/my', protect, authorize('teacher'), getMyLessonNotes);

export default router;