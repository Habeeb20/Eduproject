// routes/userRoutes.js
import express from "express";
import {
  createAdmin,
  createStaff,
  createStudentAndParent,
  createTeacher,
} from "../controllers/adminControllers.js";

import { protect, authorize } from "../middleware/auth.js";
import { setTiming } from "../controllers/teacherAttendanceController.js";

const adminRouter = express.Router();

// Only Super Admin can create Admin
adminRouter.post(
  "/create-admin",
  protect,
  authorize("superadmin"),
  createAdmin
);
adminRouter.post("/create-teacher", protect, authorize("admin"), createTeacher);
adminRouter.post(
  "/create-student",
  protect,
  authorize("admin"),
  createStudentAndParent
);
adminRouter.post("/create-staff", protect, authorize("admin"), createStaff);

adminRouter.post(
  "/set-timings",
  protect,
  authorize("admin", "superadmin"),
  setTiming
);

export default adminRouter;
