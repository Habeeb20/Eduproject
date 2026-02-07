// routes/teacherAttendanceRoutes.js
import express from "express";
import {
  generateTodayTeacherQR,
  checkInTeacher,
  getTodayTeacherAttendance,
  getTeachersForScan,
} from "../controllers/teacherAttendanceController.js";

import { protect, authorize } from "../middleware/auth.js";
import { checkInStudent } from "../controllers/studentControllers.js";

const router = express.Router();

router.get(
  "/generate-qr",
  protect,
  authorize("admin", "superadmin"),
  generateTodayTeacherQR
);

router.post("/checkin", protect, authorize("teacher"), checkInTeacher);

router.get(
  "/today",
  protect,
  authorize("admin", "superadmin"),
  getTodayTeacherAttendance
);

router.get("/teachers-list", protect, authorize("teacher"), getTeachersForScan);

router.get(
  "/date/:date",
  protect,
  authorize("admin", "superadmin"),
  getTodayTeacherAttendance
);

router.post("/checkin", protect, authorize("teacher", "admin"), checkInStudent);
export default router;
