

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createClass,
  getAllClasses,
  addSubjectToClass,
  assignTeacherToSubject,
  getStudentsInClass,
} from '../controllers/classController.js';

const router = express.Router();

router.post('/', protect, authorize('superadmin', 'admin'), createClass);
router.get('/', protect, authorize('superadmin', 'admin', 'teacher'), getAllClasses);
router.post('/subjects', protect, authorize('superadmin', 'admin'), addSubjectToClass);
router.post('/assign-teacher', protect, authorize('superadmin', 'admin'), assignTeacherToSubject);
// ... existing imports and router setup ...

// Get students in a specific class
router.get('/:className/students', protect, getStudentsInClass);
export default router;