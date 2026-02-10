import express from 'express';
import { registerSuperAdmin, login, getSchoolOverview, getAllTeachers, getAllStudents, getAllParents, getAllClasses, getAllResults, getSchoolStaff, editUser, deleteUser, getCurrentUser } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/auth.js';


const router = express.Router();

router.post('/register-superadmin', registerSuperAdmin);
router.post('/login', login);
router.get('/me', protect, getCurrentUser)
router.get('/overview', protect, authorize('superadmin'), getSchoolOverview);
router.get('/teachers', protect, authorize('superadmin'), getAllTeachers);
router.get('/students', protect, authorize('superadmin'), getAllStudents);
router.get('/parents', protect, authorize('superadmin'), getAllParents);
router.get("/classes", protect, authorize('superadmin'), getAllClasses)
router.get("/results", protect, authorize('superadmin'), getAllResults)
router.get("/staff", protect, authorize('superadmin'), getSchoolStaff)
// Add these lines in your superAdminRoutes.js
router.put('/edit-user/:userId', editUser);
router.delete('/delete-user/:userId', deleteUser);

export default router;



