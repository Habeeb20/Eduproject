import express from 'express';
import { protect } from '../middleware/auth.js';
import { getSchoolRecipients, sendMessage,
  getConversations,
  markAsRead, } from '../controllers/MessageController.js';


const router = express.Router();

router.get('/recipients', protect, getSchoolRecipients);
router.post('/send', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.patch('/:id/read', protect, markAsRead);

export default router;