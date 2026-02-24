import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createPayroll,
  publishPayroll,
  getMyPayrolls,
  getAllPayrolls,
} from '../controllers/payrollController.js';

const router = express.Router();

router.post('/', protect, authorize('accountant'), createPayroll);
router.post('/:payrollId/publish', protect, authorize('accountant'), publishPayroll);
router.get('/my', protect, getMyPayrolls);
router.get('/', protect, authorize('accountant', 'admin', 'superadmin'), getAllPayrolls);

export default router;