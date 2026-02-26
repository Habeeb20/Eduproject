import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createPayroll,
  publishPayroll,
  getMyPayrolls,
  getAllPayrolls,
  updatePayroll,
  deletePayroll,
} from '../controllers/payrollController.js';

const router = express.Router();

router.post('/', protect, authorize('accountant'), createPayroll);
router.post('/:payrollId/publish', protect, authorize('accountant'), publishPayroll);
router.get('/my', protect, getMyPayrolls);
router.get('/all', protect, authorize('accountant', 'admin', 'superadmin'), getAllPayrolls);
router.put('/:id', protect, authorize('accountant'), updatePayroll);
router.delete('/:id', protect, authorize('accountant'), deletePayroll);

export default router;