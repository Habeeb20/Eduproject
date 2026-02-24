import express from 'express';
import { registerSuperAdmin, login, getSchoolOverview, getAllTeachers, getAllStudents, getAllParents, getAllClasses, getAllResults, getSchoolStaff, editUser, deleteUser, getCurrentUser, getAllStudents1, getSchoolRecipients } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register-superadmin', registerSuperAdmin);
router.post('/login', login);
router.get('/me', protect, getCurrentUser)
router.get('/overview', protect, authorize('superadmin'), getSchoolOverview);
router.get('/teachers', protect, authorize('superadmin'), getAllTeachers);
router.get('/students', protect,  getAllStudents);
router.get('/students1', protect,  getAllStudents1);
router.get('/parents', protect, authorize('superadmin'), getAllParents);
router.get("/classes", protect, authorize('superadmin'), getAllClasses)
router.get("/results", protect, authorize('superadmin'), getAllResults)
router.get("/staff", protect, authorize('superadmin', 'accountant'), getSchoolStaff)
router.get('/school-recipients', protect, getSchoolRecipients);
router.put('/edit-user/:userId', editUser);
router.delete('/delete-user/:userId', deleteUser);

// GET /verify?id=<userId>&code=<uniqueCode>
router.get('/verify', async (req, res) => {
  const { id, code } = req.query;

  if (!id || !code) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  const user = await User.findById(id).select('name email role schoolName profilePicture digitalId');

  if (!user || user.digitalId?.uniqueCode !== code) {
    return res.status(404).json({ success: false, message: 'Invalid or expired ID' });
  }

  res.json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      schoolName: user.schoolName,
      profilePicture: user.profilePicture,
      uniqueCode: user.digitalId.uniqueCode,
      issuedAt: user.digitalId.issuedAt,
    },
  });
});

export default router;



