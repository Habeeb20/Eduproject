import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { setSchoolSettings,  markAttendance,
  getAttendanceHistory,
  getAllAttendance,
  getSchoolSettings, } from '../controllers/attendanceController.js';


const router = express.Router();

router.post('/settings', protect, authorize('superadmin', 'admin'), setSchoolSettings);
router.get('/settings', protect, authorize('superadmin', 'admin'), getSchoolSettings);
router.post('/mark', protect, markAttendance);

router.get('/history', protect, getAttendanceHistory);
router.get('/history/:userId', protect, getAttendanceHistory); // for parent/admin/superadmin

router.get('/all', protect, authorize(['superadmin', 'admin']), getAllAttendance);

export default router;