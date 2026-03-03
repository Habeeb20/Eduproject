// routes/timetableRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

import asyncHandler from 'express-async-handler'; // if you're using it, or just use try/catch

import {
  createClassTimetable,
  updateTimetable,

  getTimetableByClass,
  checkConflicts,
} from '../controllers/classTimeTableController.js';

const router = express.Router();

// ────────────────────────────────────────────────
// ADMIN / SUPERADMIN ONLY
// ────────────────────────────────────────────────

// Create new class timetable
router.post(
  '/',
  protect,
  authorize('admin', 'superadmin'),
  createClassTimetable
);

// Update existing timetable
router.put(
  '/:id',
  protect,
  authorize(['admin', 'superadmin']),
  updateTimetable
);

// Delete timetable (optional - if you want admins to delete)
router.delete(
  '/:id',
  protect,
  authorize(['admin', 'superadmin']),
  asyncHandler(async (req, res) => {
    // You can implement deleteTimetable controller if needed
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) return res.status(404).json({ success: false, message: 'Not found' });
    if (timetable.schoolName !== req.user.schoolName) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    await timetable.deleteOne();
    res.json({ success: true, message: 'Timetable deleted' });
  })
);

// Check for teacher conflicts (before saving)
router.post(
  '/check-conflicts',
  protect,
  authorize('admin', 'superadmin'),
  checkConflicts
);

// ────────────────────────────────────────────────
// ALL AUTHENTICATED USERS (students, parents, teachers, admins)
// ────────────────────────────────────────────────

// Get timetables based on role & class/teacher assignment
router.get(
  '/',
  protect,
  getTimetableByClass
);
router.get(
  '/view',
  protect,
  getTimetableByClass
);

export default router;