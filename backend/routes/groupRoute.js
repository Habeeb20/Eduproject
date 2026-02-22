// routes/groupRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createGroup,  sendGroupMessage,
  getGroupMessages,
  removeParticipant,
  toggleBlockGroup,
  createSchoolWideGroup,
  getMyGroups,
  getGroupDetails,
  getSchoolWideGroup,
  addParticipants,
  updateGroupName, } from '../controllers/groupController.js';


const router = express.Router();

router.post('/', protect, authorize('teacher'), createGroup);
router.post('/:groupId/message', protect, sendGroupMessage);
router.get('/:groupId/messages', protect, getGroupMessages);
router.delete('/:groupId/participant/:userId', protect, authorize('admin', 'superadmin'), removeParticipant);
router.put('/:groupId/block', protect, authorize('admin', 'superadmin'), toggleBlockGroup);
router.post('/school-wide', protect, authorize('admin', 'superadmin'), createSchoolWideGroup);
router.get('/my', protect, getMyGroups);
router.get('/:groupId/details', protect, getGroupDetails);
router.get('/school-wide', protect, getSchoolWideGroup);
router.post('/:groupId/add-participants', protect, addParticipants)
// Add this line
router.put('/:groupId/name', protect, authorize('admin', 'superadmin'), updateGroupName);
export default router;