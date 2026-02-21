// routes/groupRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createGroup,  sendGroupMessage,
  getGroupMessages,
  removeParticipant,
  toggleBlockGroup,
  createSchoolWideGroup,
  getMyGroups,
  getGroupDetails, } from '../controllers/groupController.js';


const router = express.Router();

router.post('/', protect, authorize('teacher'), createGroup);
router.post('/:groupId/message', protect, sendGroupMessage);
router.get('/:groupId/messages', protect, getGroupMessages);
router.delete('/:groupId/participant/:userId', protect, authorize('admin', 'superadmin'), removeParticipant);
router.post('/:groupId/block', protect, authorize('admin', 'superadmin'), toggleBlockGroup);
router.post('/school-wide', protect, authorize('admin', 'superadmin'), createSchoolWideGroup);
router.get('/my', protect, getMyGroups);
router.get('/:groupId/details', protect, getGroupDetails);
export default router;