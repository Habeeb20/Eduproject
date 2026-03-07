import express from "express";

import { createTest, finishTest, getAllTests, getMyTests, getStudentTestAttempts, getTestResults, getVisibleTests, startTest, submitAnswer, updateAttemptProgress,  } from "../controllers/testController.js";

import { protect, authorize } from "../middleware/auth.js";
const testRouter = express.Router();




// Define routes
testRouter.post("/", protect, authorize("teacher"), createTest);
testRouter.get("/:testId/results", protect, authorize("teacher", "admin", "superadmin"), getTestResults);
testRouter.post("/:testId/start", protect, authorize("student"), startTest);
testRouter.post("/:testId/attempt/:attemptId/answer", protect, authorize("student"), submitAnswer);
testRouter.post("/:testId/attempt/:attemptId/finish", protect, authorize("student"), finishTest);

testRouter.post('/:testId/attempt/:attemptId/update', protect, updateAttemptProgress);
testRouter.get("/visible", protect, authorize("student"), getVisibleTests)
testRouter.get(
  '/student/:studentId',
  protect,
  getStudentTestAttempts
);
testRouter.get('/my', protect, authorize('teacher'), getMyTests);
testRouter.get('/', protect, getAllTests);

export default testRouter;