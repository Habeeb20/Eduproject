import express from 'express';
import { protect, authorize, schoolOnly } from '../middleware/auth.js';
import {  createAnnouncement,
  getMyAnnouncements,
  deleteAnnouncement,
  toggleAnnouncementStatus, } from '../controllers/annoucementController.js';


const router = express.Router();

// Public for logged-in users (students, teachers, staff)
router.get('/my', protect,  getMyAnnouncements);

// Admin / Superadmin only
router.post('/', protect, authorize('admin', 'superadmin'), createAnnouncement);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteAnnouncement);
router.put('/:id/status', protect, authorize('admin', 'superadmin'), toggleAnnouncementStatus);

export default router;