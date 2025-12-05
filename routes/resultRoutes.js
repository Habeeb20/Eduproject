// routes/resultRoutes.js
import express from 'express';
import { enterResult, getChildResults, getMyResults, publishResult, saveResult,        // Create OR Update
  deleteResult,

  unpublishResult, } from '../controllers/resultController.js';
import { protect, authorize } from '../middleware/auth.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Teacher enters result
router.post('/enter', protect, authorize('teacher', 'admin'), enterResult);

// Publish result
router.post('/publish', protect, authorize('teacher', 'admin'), publishResult);

// Student sees results
router.get('/my-results', protect, authorize('student'), getMyResults);

// Parent sees child's results
router.get('/child-results', protect, authorize('parent'), getChildResults);


// Save (Create or Update)
router.post('/save', protect, authorize('teacher', 'admin'), saveResult);

// Delete result
router.delete('/:resultId', protect, authorize('teacher', 'admin'), deleteResult);

router.post('/unpublish', protect, authorize('teacher', 'admin'), unpublishResult);



export default router;


