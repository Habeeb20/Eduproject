// // routes/userRoutes.js
// import express from "express";
// import {
//   createAdmin,
//   createStaff,
//   createStudentAndParent,
//   createTeacher,
// } from "../controllers/adminControllers.js";

// import { protect, authorize } from "../middleware/auth.js";
// import { setTiming } from "../controllers/teacherAttendanceController.js";

// const adminRouter = express.Router();

// // Only Super Admin can create Admin
// adminadminRouter.post(
//   "/create-admin",
//   protect,
//   authorize("superadmin"),
//   createAdmin
// );
// adminadminRouter.post("/create-teacher", protect, authorize("admin", "superadmin"), createTeacher);
// adminadminRouter.post(
//   "/create-student",
//   protect,
//   authorize("admin"),
//   createStudentAndParent
// );
// adminadminRouter.post("/create-staff", protect, authorize("admin", "superadmin"), createStaff);

// adminadminRouter.post(
//   "/set-timings",
//   protect,
//   authorize("admin", "superadmin"),
//   setTiming
// );

// export default adminRouter;









// routes/adminRoutes.js
import express from 'express';

import { createSchoolAdmin,   createTeacher,
  createStudentWithParent,
  createStaffMember,
  getAllUsersForSuperadmin, } from '../controllers/adminControllers.js';
import { protect, authorize } from '../middleware/auth.js';

const adminRouter = express.Router();

// ──────────────────────────────
// Superadmin-only routes
// ──────────────────────────────
adminRouter.post(
  '/create-admin', 
  protect, 
  authorize('superadmin'), 
  createSchoolAdmin
);

// Superadmin can see all users + their temporary passwords
adminRouter.get(
  '/users/all-with-passwords',
  protect,
  authorize('superadmin'),
  getAllUsersForSuperadmin
);

// ──────────────────────────────
// Admin + Superadmin routes
// ──────────────────────────────
adminRouter.post(
  '/create-teacher',
  protect,
  authorize(['admin', 'superadmin']),
  createTeacher
);

adminRouter.post(
  '/create-staff',
  protect,
  authorize(['admin', 'superadmin']),
  createStaffMember
);

// ──────────────────────────────
// Admin-only routes
// ──────────────────────────────
adminRouter.post(
  '/create-student',
  protect,
  authorize('admin'),
  createStudentWithParent
);

export default adminRouter;