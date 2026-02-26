// routes/virtualClassRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createVirtualClass,
  updateVirtualClassStatus,
  getMyVirtualClasses,
} from '../controllers/virtualClassController.js';

const router = express.Router();

router.post('/', protect, createVirtualClass);
router.put('/:id/status', protect, updateVirtualClassStatus);
router.get('/my', protect, getMyVirtualClasses);

export default router;