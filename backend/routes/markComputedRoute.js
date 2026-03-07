
import express from "express"
import { protect } from "../middleware/auth.js";
import { computeAndPublishScore, getMyReportCard, getStudentReportCard, publishReportCard } from "../controllers/markComputedController.js";

const router = express.Router()

router.post('/marks/compute', protect, computeAndPublishScore);
router.post('/report/publish', protect, publishReportCard);
router.get('/report/my', protect, getMyReportCard);

export default router