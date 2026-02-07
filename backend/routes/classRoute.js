// routes/classRoutes.js
import express from 'express';
import { addStudentToClass, createClass, getAllClasses, getChildClass, getMyClass } from '../controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';


const router = express.Router();

// Admin/Teacher creates class
router.post('/create', protect, authorize('admin', 'teacher'), createClass);

// Add student to class
router.post('/add-student', protect, authorize('admin', 'teacher'), addStudentToClass);

// Get all classes
router.get('/all', protect, authorize('admin', 'teacher', 'superadmin'), getAllClasses);

// Student sees their class
router.get('/my-class', protect, authorize('student'), getMyClass);

// Parent sees child's class
router.get('/child-class', protect, authorize('parent'), getChildClass);

export default router;